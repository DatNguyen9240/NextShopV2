"use client";

import { useEffect, useState } from "react";
import { getAllAttributes, createAttribute, createAttributeValue, getValuesByAttributeId, getCategoriesForAttribute, assignAttributeToCategory, removeAttributeFromCategory, AttributeValue, updateAttributeValue, deleteAttributeValue, updateAttribute, deleteAttribute } from "@/app/services/attributeService";
import { getCategories, Category } from "@/app/services/categoryService";
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';

type Attribute = {
  attributeId: string;
  name: string;
  inputType?: string;
  isActive: boolean;
  values?: AttributeValue[];
};

type ConfirmState = { show: boolean; title?: string; message?: string; onConfirm?: () => void } | null;

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Attribute | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowName, setEditingRowName] = useState<string>('');
  const [editingRowInputType, setEditingRowInputType] = useState<string>('text');
  const [editingRowActive, setEditingRowActive] = useState<boolean>(true);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrInputType, setNewAttrInputType] = useState("text");
  const [valueInput, setValueInput] = useState("");
  const [valueEditingId, setValueEditingId] = useState<string | null>(null);
  const [valueEditingText, setValueEditingText] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [savingValueId, setSavingValueId] = useState<string | null>(null);
  const [deletingAttributeId, setDeletingAttributeId] = useState<string | null>(null);
  const [deletingValueId, setDeletingValueId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [attrs, cats] = await Promise.all([getAllAttributes(), getCategories()]);
        setAttributes(attrs);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openManage = async (attr: Attribute) => {
    setEditing(attr);
    // fetch values and categories assigned
    const vals = await getValuesByAttributeId(attr.attributeId);
    const catIds = await getCategoriesForAttribute(attr.attributeId);
    setAssignedCategories(new Set(catIds.map(id => id.toString())));
    setEditing({ ...attr, values: vals });
    setShowModal(true);
  };

  const handleCreateAttr = async () => {
    try {
      const payload = { name: newAttrName, inputType: newAttrInputType, isActive: true };
      const r = await createAttribute(payload);
      setAttributes(prev => [r, ...prev]);
      setNewAttrName("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddValue = async () => {
    if (!editing) return;
    try {
      // allow comma-separated multiple values
      const inputs = valueInput.split(',').map(s => s.trim()).filter(Boolean);
      const created: AttributeValue[] = [];
      for (const val of inputs) {
        const v = await createAttributeValue({ attributeId: editing.attributeId, value: val });
        created.push(v);
      }
      setEditing((prev) => {
        if (!prev) return prev;
        const p = prev as Attribute;
        const newVals = [...created, ...(p.values ?? [])];
        // update attributes list so count reflects immediately
        setAttributes(prevAttrs => prevAttrs.map(a => a.attributeId === p.attributeId ? { ...a, values: newVals } : a));
        return { ...p, values: newVals };
      });
      setValueInput("");
      toast.success('Giá trị đã được thêm');
    } catch (err) {
      console.error(err);
      toast.error('Thêm giá trị thất bại');
    }
  };

  const startRowEdit = (attr: Attribute) => {
    setEditingRowId(attr.attributeId);
    setEditingRowName(attr.name);
    setEditingRowInputType(attr.inputType ?? 'text');
    setEditingRowActive(Boolean(attr.isActive));
  };

  const cancelRowEdit = () => {
    setEditingRowId(null);
    setEditingRowName('');
    setEditingRowInputType('text');
    setEditingRowActive(true);
  };

  const saveRowEdit = async (attrId: string) => {
    try {
      const updated = await updateAttribute(attrId, { name: editingRowName, inputType: editingRowInputType, isActive: editingRowActive });
      setAttributes(prev => prev.map(a => a.attributeId === updated.attributeId ? updated : a));
      if (editing && editing.attributeId === attrId) setEditing(updated);
      cancelRowEdit();
      toast.success('Attribute đã cập nhật');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại');
    }
  };

  const startEditValueInline = (v: AttributeValue) => {
    setValueEditingId(v.attributeValueId);
    setValueEditingText(v.value);
  };

  const saveValueInline = async (v: AttributeValue) => {
    try {
      await updateAttributeValue(v.attributeValueId, { value: valueEditingText, displayOrder: v.displayOrder, isActive: v.isActive });
      const vals = await getValuesByAttributeId(editing!.attributeId);
      setEditing(prev => prev ? { ...prev, values: vals } : prev);
      setAttributes(prevAttrs => prevAttrs.map(a => a.attributeId === editing?.attributeId ? { ...a, values: vals } : a));
      setValueEditingId(null);
      setValueEditingText('');
      toast.success('Đã cập nhật');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại');
    }
  };

  const cancelValueInline = () => {
    setValueEditingId(null);
    setValueEditingText('');
  };

  const toggleCategory = async (catId: string) => {
    if (!editing) return;
    const attrId = editing.attributeId;
    const isAssigned = assignedCategories.has(catId);
    try {
      if (isAssigned) {
        await removeAttributeFromCategory(catId, attrId);
        setAssignedCategories(prev => { const s = new Set(prev); s.delete(catId); return s; });
      } else {
        await assignAttributeToCategory(catId, attrId);
        setAssignedCategories(prev => { const s = new Set(prev); s.add(catId); return s; });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Attributes</h2>
        <div className="flex items-center space-x-4">
          <input value={newAttrName} onChange={(e) => setNewAttrName(e.target.value)} placeholder="Attribute name" className="border px-3 py-2 rounded" />
          <select value={newAttrInputType} onChange={(e) => setNewAttrInputType(e.target.value)} className="border px-3 py-2 rounded">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
          <button onClick={handleCreateAttr} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Input Type</th>
              <th className="px-4 py-2">Values</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
                {attributes.map((a: Attribute) => (
              <tr key={a.attributeId} className="border-t">
                <td className="px-4 py-3">{editingRowId === a.attributeId ? (<input value={editingRowName} onChange={(e) => setEditingRowName(e.target.value)} className="border px-2 py-1 rounded w-full" />) : (a.name)}</td>
                <td className="px-4 py-3">{editingRowId === a.attributeId ? (<select value={editingRowInputType} onChange={(e) => setEditingRowInputType(e.target.value)} className="border px-2 py-1 rounded"><option value="text">Text</option><option value="number">Number</option><option value="boolean">Boolean</option></select>) : (a.inputType)}</td>
                <td className="px-4 py-3">{(a.values ?? []).length}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => startRowEdit(a)} className="text-blue-600">Edit</button>
                    <button onClick={() => openManage(a)} className="text-blue-600">Manage</button>
                    {editingRowId === a.attributeId ? (
                      <>
                        <button onClick={() => saveRowEdit(a.attributeId)} className="text-green-600">Save</button>
                        <button onClick={cancelRowEdit} className="text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <button
                        disabled={deletingAttributeId === a.attributeId}
                        onClick={() => setConfirm({ show: true, title: 'Xóa thuộc tính', message: `Bạn có chắc muốn xóa thuộc tính "${a.name}"?`, onConfirm: async () => {
                          setConfirm(null);
                          try {
                            setDeletingAttributeId(a.attributeId);
                            await deleteAttribute(a.attributeId);
                            setAttributes(prev => prev.filter(x => x.attributeId !== a.attributeId));
                            toast.success('Thuộc tính đã xóa');
                          } catch (err) {
                            console.error(err);
                            toast.error('Xóa thất bại');
                          } finally { setDeletingAttributeId(null); }
                        } })}
                        className="text-red-600"
                      >{deletingAttributeId === a.attributeId ? 'Deleting...' : 'Delete'}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6 z-50">
          <div className="bg-white w-full max-w-3xl rounded shadow p-6">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Manage: {editing.name}</h3>
                <div className="text-sm text-gray-500">Type: <span className="font-medium text-gray-700">{editing.inputType}</span></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={async () => {
                  if (!editing) return;
                  try {
                    const updated = await updateAttribute(editing.attributeId, { name: editing.name, inputType: editing.inputType, isActive: editing.isActive });
                    setAttributes(prev => prev.map(a => a.attributeId === updated.attributeId ? updated : a));
                    setEditing(updated);
                    toast.success('Attribute đã cập nhật');
                  } catch (err) {
                    console.error(err);
                    toast.error('Cập nhật thất bại');
                  }
                }} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                <button className="text-sm text-gray-500 px-2 py-1 rounded hover:bg-gray-100" onClick={() => setShowModal(false)}>Close</button>
                <button className="text-red-600 px-3 py-1 rounded border border-red-100" onClick={() => setConfirm({ show: true, title: 'Xóa thuộc tính', message: 'Bạn có chắc muốn xóa thuộc tính này?', onConfirm: async () => {
                  if (!editing) return;
                  setConfirm(null);
                  try {
                    setDeletingAttributeId(editing.attributeId);
                    await deleteAttribute(editing.attributeId);
                    setAttributes(prev => prev.filter(a => a.attributeId !== editing.attributeId));
                    setShowModal(false);
                    toast.success('Thuộc tính đã xóa');
                  } catch (err) {
                    console.error(err);
                    toast.error('Xóa thất bại');
                  } finally { setDeletingAttributeId(null); }
                } })}>Delete</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Values</h4>
                <div className="mb-3 flex gap-2">
                  <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="New value" className="border px-3 py-2 rounded flex-1" />
                  <button onClick={handleAddValue} className="bg-green-600 text-white px-3 py-2 rounded">Add</button>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {(editing.values ?? []).sort((a,b)=>a.displayOrder-b.displayOrder).map((v: AttributeValue, idx) => (
                    <div key={v.attributeValueId} className="flex items-center justify-between border rounded p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{v.value}</div>
                        <div className="text-xs text-gray-400">#{v.displayOrder}</div>
                        <div className={`text-xs ${v.isActive ? 'text-green-600' : 'text-gray-400'}`}>{v.isActive ? 'Active' : 'Inactive'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={savingValueId === v.attributeValueId}
                          onClick={async () => {
                            if (!editing) return;
                            if (idx === 0) return;
                            const other = (editing.values ?? [])[idx - 1];
                            try {
                              setSavingValueId(v.attributeValueId);
                              await updateAttributeValue(v.attributeValueId, { value: v.value, displayOrder: v.displayOrder - 1, isActive: v.isActive });
                              await updateAttributeValue(other.attributeValueId, { value: other.value, displayOrder: other.displayOrder + 1, isActive: other.isActive });
                              const vals = await getValuesByAttributeId(editing.attributeId);
                              setEditing(prev => prev ? { ...prev, values: vals } : prev);
                              toast.success('Đổi thứ tự thành công');
                            } catch (err) {
                              console.error(err);
                              toast.error('Không thể đổi thứ tự');
                            } finally { setSavingValueId(null); }
                          }}
                          className="px-2 py-1 rounded bg-gray-100"
                        >↑</button>
                        <button
                          disabled={savingValueId === v.attributeValueId}
                          onClick={async () => {
                            if (!editing) return;
                            if (idx === (editing.values ?? []).length - 1) return;
                            const other = (editing.values ?? [])[idx + 1];
                            try {
                              setSavingValueId(v.attributeValueId);
                              await updateAttributeValue(v.attributeValueId, { value: v.value, displayOrder: v.displayOrder + 1, isActive: v.isActive });
                              await updateAttributeValue(other.attributeValueId, { value: other.value, displayOrder: other.displayOrder - 1, isActive: other.isActive });
                              const vals = await getValuesByAttributeId(editing.attributeId);
                              setEditing(prev => prev ? { ...prev, values: vals } : prev);
                              toast.success('Đổi thứ tự thành công');
                            } catch (err) {
                              console.error(err);
                              toast.error('Không thể đổi thứ tự');
                            } finally { setSavingValueId(null); }
                          }}
                          className="px-2 py-1 rounded bg-gray-100"
                        >↓</button>
                        {valueEditingId === v.attributeValueId ? (
                          <>
                            <input value={valueEditingText} onChange={(e) => setValueEditingText(e.target.value)} className="border px-2 py-1 rounded mr-2" />
                            <button onClick={() => saveValueInline(v)} className="px-2 py-1 rounded bg-green-100 text-green-800">Save</button>
                            <button onClick={cancelValueInline} className="px-2 py-1 rounded bg-gray-100">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => startEditValueInline(v)} className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Edit</button>
                        )}
                        <button
                          disabled={deletingValueId === v.attributeValueId}
                          onClick={() => {
                            setConfirm({
                              show: true,
                              title: 'Xóa giá trị',
                              message: 'Bạn có chắc muốn xóa giá trị này?',
                              onConfirm: async () => {
                                setConfirm(null);
                                try {
                                  setDeletingValueId(v.attributeValueId);
                                  await deleteAttributeValue(v.attributeValueId);
                                  const vals = await getValuesByAttributeId(editing.attributeId);
                                  setEditing(prev => prev ? { ...prev, values: vals } : prev);
                                  setAttributes(prevAttrs => prevAttrs.map(a => a.attributeId === editing.attributeId ? { ...a, values: vals } : a));
                                  toast.success('Đã xóa');
                                } catch (err) {
                                  console.error(err);
                                  toast.error('Xóa thất bại');
                                } finally {
                                  setDeletingValueId(null);
                                }
                              }
                            });
                          }}
                          className="px-2 py-1 rounded bg-red-50 text-red-600"
                        >{deletingValueId === v.attributeValueId ? 'Deleting...' : 'Delete'}</button>
                      </div>
                    </div>
                  ))}
                  {(!editing.values || editing.values.length === 0) && <div className="text-sm text-gray-500 mt-2">No values yet. Add some to allow assigning to variants.</div>}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Assign to Categories <span className="text-xs text-gray-400">({Array.from(assignedCategories).length})</span></h4>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto border rounded p-2">
                  {categories.map(cat => (
                    <label key={cat.categoryId} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <input type="checkbox" checked={assignedCategories.has(cat.categoryId)} onChange={() => toggleCategory(cat.categoryId)} />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirm && confirm.show && (
        <ConfirmModal show={true} title={confirm.title || ''} message={confirm.message || ''} confirmText="Xóa" cancelText="Hủy" onConfirm={() => { if (confirm?.onConfirm) confirm.onConfirm(); }} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}
