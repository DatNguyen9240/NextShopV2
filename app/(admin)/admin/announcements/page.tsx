'use client';

import { useState, useEffect } from 'react';
import axios from '../../../lib/axiosClient';

interface Announcement {
  id: string;
  name: string;
  className: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    className: 'w-full bg-purple-600 text-white text-center py-1 px-2 text-sm font-semibold',
    isActive: false,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get('/api/MarketingElements?name=Announcement');
      const data = response.data;
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const response = await axios.put(`/api/MarketingElements/${editing.id}`, { ...formData, name: 'Announcement' });
        const data = response.data;
        if (data.success) {
          alert('Announcement updated successfully');
          setEditing(null);
          loadAnnouncements();
        } else {
          alert('Failed to update: ' + data.message);
        }
      } else {
        const createData = { ...formData, name: 'Announcement', isActive: false }; // Always create as inactive
        const response = await axios.post('/api/MarketingElements', createData);
        const data = response.data;
        if (data.success) {
          alert('Announcement created successfully');
          loadAnnouncements();
        } else {
          alert('Failed to create: ' + data.message);
        }
      }
      setFormData({
        className: 'w-full bg-purple-600 text-white text-center py-1 px-2 text-sm font-semibold',
        isActive: false,
      });
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormData({
      className: announcement.className,
      isActive: announcement.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await axios.delete(`/api/MarketingElements/${id}`);
      const data = response.data;
      if (data.success) {
        alert('Announcement deleted successfully');
        loadAnnouncements();
      } else {
        alert('Failed to delete: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  const handleSetActive = async (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;
    try {
      const response = await axios.put(`/api/MarketingElements/${id}`, {
        ...announcement,
        isActive: true,
      });
      const data = response.data;
      if (data.success) {
        loadAnnouncements();
      } else {
        alert('Failed to set active: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to set active:', error);
      alert('Failed to set active');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Announcements</h1>

      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Announcement' : 'Add New Announcement'}</h2>
        <div>
          <label className="block text-sm font-medium">HTML/Tailwind Classes</label>
          <textarea
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            className="w-full p-2 border rounded"
            rows={5}
            placeholder="Enter HTML content with Tailwind classes..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter HTML content with Tailwind CSS classes. Example: &lt;div class=&quot;bg-blue-600 text-white p-4&quot;&gt;Announcement content&lt;/div&gt;
          </p>
        </div>
        {editing && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              Active
            </label>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormData({
                  className: 'w-full bg-purple-600 text-white text-center py-1 px-2 text-sm font-semibold',
                  isActive: false,
                });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Announcements</h2>
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Classes: {announcement.className.substring(0, 100)}{announcement.className.length > 100 ? '...' : ''}</p>
                  <p className="text-sm text-gray-500">Status: {announcement.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetActive(announcement.id)}
                    className={`px-3 py-1 rounded text-sm ${announcement.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                  >
                    {announcement.isActive ? 'Active' : 'Set Active'}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <strong>Preview:</strong>
                <div dangerouslySetInnerHTML={{ __html: announcement.className }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}