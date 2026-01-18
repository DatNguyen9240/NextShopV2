"use client";
import React, { useEffect, useState, useRef } from "react";
import { updateProfile, upsertAddress, deleteAddress } from "../../services/authService";
import { getPasskeys, startRegister, verifyRegister, revokePasskey } from '../../services/webauthnService';
import MfaEmailSection from './MfaEmailSection';
import { preformatMakeCredReq, publicKeyCredentialToJSON } from '@/utils/webauthn';
import { uploadImage } from "../../services/uploadService";
import { useAuth } from "@/app/providers/AuthProvider";
import AddressAutocomplete from "../../components/AddressAutocomplete";
import ConfirmModal from "../../components/ConfirmModal";
import LocationPicker from "../../components/LocationPicker";

type Address = { addressId: string; fullAddress: string; latitude?: number | null; longitude?: number | null; isDefault?: boolean };

export default function SettingsPage() {
  const { refreshUser, user, getAddresses } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDefault, setIsDefault] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedAvatar, setHasUnsavedAvatar] = useState(false);

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [, setEditingAddressId] = useState<string | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<string | null>(null);
  // avatar delete confirm
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);

  // Profile modal
  // const [showProfileModal, setShowProfileModal] = useState(false);

  // Map position state
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`, {
        headers: {
          'User-Agent': 'NextShopV2-App/1.0'
        }
      });
      if (!response.ok) {
        console.warn('Nominatim request failed:', response.status);
        return null;
      }
      const data = await response.json();
      if (data && data.display_name) {
        // Use display_name for full address
        return data.display_name;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return null;
  };

  const forwardGeocode = async (addr: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1&accept-language=vi`, {
        headers: {
          'User-Agent': 'NextShopV2-App/1.0'
        }
      });
      if (!response.ok) {
        console.warn('Nominatim forward geocode failed:', response.status);
        return null;
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        return { lat: parseFloat(result.lat), lng: parseFloat(result.lon), displayName: result.display_name };
      }
    } catch (error) {
      console.error('Forward geocoding failed:', error);
    }
    return null;
  };

  // Passkeys
  const [passkeys, setPasskeys] = useState<Array<{ id: string; credentialId: string; createdAt: string; lastUsedAt?: string | null }>>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      setLoadingPasskeys(true);
      return;
    }

    const load = async () => {
      setLoading(true);
      setLoadingPasskeys(true);
      try {
        setFullName(user.fullName ?? "");
        setPhone(user.phone ?? "");
        setGender(user.gender ?? undefined);
        setAvatarUrl(user.avatar ?? null);
        setAvatarPreview(user.avatar ?? null);
        setHasUnsavedAvatar(false);

        // addresses from context helper
        const addrs = (getAddresses() || []) as Address[];
        addrs.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        setAddresses(addrs);

        const addr = addrs.find((a) => a.isDefault) || addrs[0];
        if (addr) {
          setAddress(addr.fullAddress || "");
          setLatitude(addr.latitude != null ? String(addr.latitude) : null);
          setLongitude(addr.longitude != null ? String(addr.longitude) : null);
          setAddressId(addr.addressId);
          setIsDefault(!!addr.isDefault);
        }

        // load passkeys once
        try {
          const pk = await getPasskeys();
          setPasskeys(pk);
        } catch (e) {
          console.warn('Could not load passkeys', e);
        }
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingPasskeys(false);
      }
    };
    void load();
  }, [user, getAddresses]);

  // Forward geocode when address changes and no coords
  useEffect(() => {
    if (address && address.trim().length > 0 && (!latitude || !longitude)) {
      const timeoutId = setTimeout(async () => {
        const geo = await forwardGeocode(address.trim());
        if (geo) {
          setLatitude(String(geo.lat));
          setLongitude(String(geo.lng));
          setMapLat(geo.lat);
          setMapLng(geo.lng);
        }
      }, 1000); // debounce 1s
      return () => clearTimeout(timeoutId);
    }
  }, [address, latitude, longitude]);

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      // preview local
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(String(reader.result));
      };
      reader.readAsDataURL(file);

      // upload
      const url = await uploadImage(file);
      setAvatarUrl(url);
      setHasUnsavedAvatar(true);
      setMessage("Ảnh đã được tải lên. Nhấn 'Lưu' để cập nhật.");
    } catch (err: unknown) {
      console.error(err);
      const e = err as { message?: string };
      setMessage(e?.message ?? "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDeleteAvatar = async () => {
    try {
      setSaving(true);
      await updateProfile({ avatarUrl: null });
      setAvatarUrl(null);
      setAvatarPreview(null);
      setHasUnsavedAvatar(false);
      await refreshUser();
      setMessage("Đã xóa ảnh đại diện");
    } catch (err: unknown) {
      console.error(err);
      setMessage("Xóa ảnh thất bại");
    } finally {
      setSaving(false);
      setShowDeleteAvatarConfirm(false);
    }
  };

  const cancelDeleteAvatar = () => {
    setShowDeleteAvatarConfirm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // update profile (including avatar and gender)
      await updateProfile({ fullName, phone, gender, avatarUrl });
      setHasUnsavedAvatar(false);
      // update or create address if provided
      if (address && address.trim().length > 0) {
        const lat = latitude ? parseFloat(latitude) : null;
        const lon = longitude ? parseFloat(longitude) : null;
        const addrPayload: { addressId?: string; fullAddress: string; latitude?: number | null; longitude?: number | null; isDefault?: boolean } = { fullAddress: address, latitude: lat, longitude: lon, isDefault };
        if (addressId) addrPayload.addressId = addressId;
        const addrRes = await upsertAddress(addrPayload);
        if (addrRes && addrRes.addressId) setAddressId(addrRes.addressId);

        // refresh from server (via context)
        await refreshUser();
        const addrs = (getAddresses() || []) as Address[];
        addrs.sort((a,b) => (b.isDefault?1:0) - (a.isDefault?1:0));
        setAddresses(addrs);
      } else {
        // Even if no address provided, still refresh profile data
        await refreshUser();
      }

      // Refresh auth user so header/avatar updates
      // (done above)
    } catch (err: unknown) {
      const e = err as { message?: string };
      setMessage(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteAddressId) return;
    try {
      setSaving(true);
      await deleteAddress(pendingDeleteAddressId);
      await refreshUser();
      const addrs = (getAddresses() || []) as Address[];
      addrs.sort((x,y) => (y.isDefault?1:0) - (x.isDefault?1:0));
      setAddresses(addrs);
      // Clear the address form state after deletion and exit edit mode
      setAddress("");
      setLatitude(null);
      setLongitude(null);
      setAddressId(undefined);
      setIsDefault(true);
      setEditingAddressId(undefined);
      setMapLat(null);
      setMapLng(null);
      setMessage("Đã xóa địa chỉ");
    } catch {
      setMessage("Xóa thất bại");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
      setPendingDeleteAddressId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteAddressId(null);
  };

  if (loading) return <main className="max-w-screen-xl mx-auto mt-12 p-6 md:p-10 bg-white rounded-md shadow">Đang tải...</main>;

  return (
    <main className="max-w-screen-xl mx-auto mt-12 p-6 md:p-10 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Cài đặt tài khoản</h1>
      {message && <div className="mb-4 text-sm text-green-600">{message}</div>}

      <form onSubmit={handleSave} className="md:grid md:grid-cols-5 md:gap-6">
        {/* Left column: avatar + upload */}
        <div className="md:col-span-1 flex flex-col items-center space-y-3 p-4 rounded">
            {/* clickable avatar: clicking the avatar opens file picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            aria-label="Chọn ảnh đại diện"
            className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Nhấn để chọn</div>
            )}
          </button>

          <div className="w-full text-center">
            <label className="text-sm mb-1 block">Ảnh đại diện</label>
            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => { if (e.target.files) handleFileChange(e.target.files[0]); }}
            />
            {uploading && <div className="text-xs text-gray-500">Đang tải ảnh...</div>}

            {avatarPreview && <div className="mt-2">
              <button type="button" onClick={() => setShowDeleteAvatarConfirm(true)} disabled={saving} className={`text-xs ${saving ? 'text-gray-400' : 'text-red-600'}`}>Xóa ảnh</button>
            </div>}

            {hasUnsavedAvatar && <div className="mt-2 text-xs text-yellow-600">Bạn cần nhấn <strong>Lưu</strong> để cập nhật ảnh đại diện</div>}

            <div className="mt-2 text-xs text-gray-500">Nhấn vào ảnh để chọn (hiển thị công khai)</div>
          </div>
        </div>

        {/* Right column: profile & address fields */}
        <div className="md:col-span-4 space-y-4 p-4">
          <div>
            <label className="block text-sm mb-1">Họ và tên</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Giới tính</label>
              <select value={gender ?? ""} onChange={(e) => setGender(e.target.value || undefined)} className="w-full border px-3 py-2 rounded">
                <option value="">Không khai báo</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Địa chỉ</label>
            {/* Address autocomplete using RapidAPI Google Places */}
            <AddressAutocomplete
              value={address}
              onSelectAddress={async (addr, placeId, lat, lng) => {
                setAddress(addr);
                setAddressId(placeId);
                setLatitude(lat != null ? String(lat) : null);
                setLongitude(lng != null ? String(lng) : null);
                // Update map position
                if (lat != null && lng != null) {
                  setMapLat(lat);
                  setMapLng(lng);
                }
                setMessage("Địa chỉ đã được chọn. Nhấn 'Lưu' để cập nhật profile.");
              }}
            />

            <div className="mt-2">
              <LocationPicker
                onLocationSelect={async (lat, lng) => {
                  setLatitude(String(lat));
                  setLongitude(String(lng));
                  setMapLat(lat);
                  setMapLng(lng);
                  // Reverse geocode to get address
                  const geocodedAddress = await reverseGeocode(lat, lng);
                  if (geocodedAddress) {
                    setAddress(geocodedAddress);
                    setAddressId(undefined); // Clear placeId since it's from map
                  }
                  setMessage("Vị trí đã được chọn. Nhấn 'Lưu' để cập nhật profile.");
                }}
                initialLat={latitude ? parseFloat(latitude) : undefined}
                initialLng={longitude ? parseFloat(longitude) : undefined}
                positionLat={mapLat}
                positionLng={mapLng}
              />
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <div>Chọn địa chỉ để tự động lấy tọa độ hoặc nhập tay trước khi lưu</div>
              {/* keep coords in hidden inputs so they are preserved for save */}
              <input type="hidden" name="latitude" value={latitude ?? ""} />
              <input type="hidden" name="longitude" value={longitude ?? ""} />
            </div>

            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="mr-2" />
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            {addresses.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <div className="text-sm font-medium mb-2">Địa chỉ hiện có</div>
                <ul className="space-y-2">
                  {addresses.map((a) => (
                    <li key={a.addressId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm">{a.fullAddress}</div>
                        <div className="text-xs text-gray-500">{a.latitude != null ? `${a.latitude}, ${a.longitude}` : ""}</div>
                        {a.isDefault && <div className="text-xs text-green-600">Mặc định</div>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button type="button" onClick={() => {
                          setAddress(a.fullAddress);
                          setLatitude(a.latitude != null ? String(a.latitude) : null);
                          setLongitude(a.longitude != null ? String(a.longitude) : null);
                          setAddressId(a.addressId);
                          setIsDefault(!!a.isDefault);
                          setEditingAddressId(a.addressId);
                          // Update map position
                          if (a.latitude != null && a.longitude != null) {
                            setMapLat(a.latitude);
                            setMapLng(a.longitude);
                          }
                        }} className="text-xs text-blue-600">Sửa</button>
                        <button type="button" onClick={() => {
                          setPendingDeleteAddressId(a.addressId);
                          setShowDeleteConfirm(true);
                        }} className="text-xs text-red-600">Xóa</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <ConfirmModal
            show={showDeleteConfirm}
            title="Xóa địa chỉ"
            message="Bạn có chắc chắn muốn xóa địa chỉ này?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={handleConfirmDelete}
            onCancel={cancelDelete}
          />

          <ConfirmModal
            show={showDeleteAvatarConfirm}
            title="Xóa ảnh đại diện"
            message="Bạn có chắc chắn muốn xóa ảnh đại diện này?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={handleConfirmDeleteAvatar}
            onCancel={cancelDeleteAvatar}
          />



          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white py-2 px-6 rounded">
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>

          {/* Passkey management */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Passkeys</div>
              <div>
                <button type="button" onClick={async () => {
                  try {
                    setLoadingPasskeys(true);
                    const options = await startRegister();
                    // Preserve original base64 challenge for server verification (preformatMakeCredReq mutates it to ArrayBuffer)
                    const serverChallenge = options.challenge;
                    const publicKey = preformatMakeCredReq(options) as unknown as PublicKeyCredentialCreationOptions;

                    // Ensure a reasonable timeout (ms) to avoid immediate NotAllowedError on some devices
                    publicKey.timeout = publicKey.timeout ?? 60000;

                    // Debug: log the publicKey options so we can inspect what's being sent to the authenticator
                    console.debug('[Settings] publicKey options before navigator.credentials.create:', publicKey);

                    let cred: PublicKeyCredential | null = null;
                    try {
                      cred = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null;
                      console.debug('[Settings] credential created', cred);
                    } catch (err: unknown) {
                      // User cancelled or operation not allowed — handle gracefully without rethrowing
                      const errObj = err as { name?: string; message?: string };
                      console.warn('[Settings] navigator.credentials.create failed', errObj?.name, errObj?.message);
                      if (errObj?.name === 'NotAllowedError') {
                        setMessage('Đã hủy hoặc hết thời gian');
                      } else {
                        console.error('[Settings] navigator.credentials.create unexpected error', err);
                        setMessage('Lỗi đăng ký');
                      }
                      // Stop further processing when create fails
                      return;
                    }

                    const payload = publicKeyCredentialToJSON(cred) as Record<string, unknown>;

                    // Try to attach transports (may be available on the credential object in some browsers)
                    try {
                      const credObj = cred as unknown as { transports?: unknown; response?: { getTransports?: () => unknown } } | null;
                      if (credObj?.transports) (payload as Record<string, unknown>)['transports'] = credObj.transports as unknown as string;
                      else if (credObj?.response && typeof credObj.response.getTransports === 'function') {
                        const tr = credObj.response.getTransports();
                        if (tr) (payload as Record<string, unknown>)['transports'] = tr;
                      }
                    } catch (e: unknown) { console.debug('[Settings] transports read failed', e); }

                    const verify = await verifyRegister({ userId: user?.id, credential: payload, challenge: serverChallenge });
                    if (verify && verify.success) {
                      setMessage('Đã thêm passkey');
                      const pk = await getPasskeys();
                      setPasskeys(pk);
                    } else {
                      setMessage('Đăng ký thất bại');
                    }
                  } catch (err) {
                    console.error(err);
                    setMessage('Lỗi đăng ký passkey');
                  } finally { setLoadingPasskeys(false); }
                }} className="bg-green-600 text-white text-xs py-1 px-3 rounded">Thêm Passkey</button>
              </div>
            </div>

            <div>
              {loadingPasskeys ? <div className="text-xs text-gray-500">Đang tải...</div> : (
                passkeys.length === 0 ? <div className="text-xs text-gray-500">Chưa có Passkey nào</div> : (
                  <ul className="space-y-2">
                    {passkeys.map(p => (
                      <li key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm">Credential: {p.credentialId}</div>
                          <div className="text-xs text-gray-500">Đăng ký: {new Date(p.createdAt).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Lần dùng cuối: {p.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : 'Chưa từng'}</div>
                        </div>
                        <div>
                          <button className="text-xs text-red-600" onClick={async () => {
                            try {
                              // Use credentialId (base64url) which the server expects for deletions
                              await revokePasskey(p.credentialId);
                              setMessage('Đã xóa passkey');
                              const pk = await getPasskeys();
                              setPasskeys(pk);
                            } catch (err: unknown) {
                              const e = err as { response?: { status?: number } };
                              console.warn('[Settings] revokePasskey failed', err);
                              const msg = e?.response?.status === 404 ? 'Passkey không tồn tại hoặc không thuộc user' : 'Xóa thất bại';
                              setMessage(msg);
                            }
                          }}>Xóa</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>

            {/* Email MFA management */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Xác thực 2 lớp (Email OTP)</div>
              </div>

              <MfaEmailSection user={user} refreshUser={refreshUser} setMessage={setMessage} />
            </div>

          </div>
        </div>
      </form>

    </main>
  );
}