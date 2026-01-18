'use client';

import { useState, useEffect } from 'react';
import axios from '../../../lib/axiosClient';

interface FooterInfo {
  id: string;
  className: string;
  createdAt: string;
  updatedAt: string;
}

export default function FooterAdminPage() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
  });

  useEffect(() => {
    loadFooterInfo();
  }, []);

  const loadFooterInfo = async () => {
    try {
      const response = await axios.get('/api/FooterInfo');
      const data = response.data;
      if (data.success && data.data) {
        setFooterInfo(data.data);
        setFormData({
          className: data.data.className || '',
        });
      }
    } catch (error) {
      console.error('Failed to load footer info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post('/api/FooterInfo', formData);
      const data = response.data;
      if (data.success) {
        setFooterInfo(data.data);
        alert('Footer info updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update footer info:', error);
      alert('Failed to update footer info');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Footer Management</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Footer Content</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              Footer HTML/Tailwind Classes
            </label>
            <textarea
              id="className"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter HTML content with Tailwind classes for footer..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter HTML content with Tailwind CSS classes. Example: &lt;div class=&quot;bg-gray-800 text-white p-4&quot;&gt;Footer content&lt;/div&gt;
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Footer'}
            </button>
          </div>
        </form>

        {footerInfo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Current Footer Preview</h3>
            <div className="border border-gray-200 p-4 rounded">
              <div dangerouslySetInnerHTML={{ __html: footerInfo.className }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date(footerInfo.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}