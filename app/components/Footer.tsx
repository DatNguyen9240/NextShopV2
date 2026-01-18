import React, { useState, useEffect } from "react";
import axios from '../lib/axiosClient';

const Footer = () => {
  const [footerInfo, setFooterInfo] = useState<{ className: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFooterInfo = async () => {
      try {
        const response = await axios.get('/api/FooterInfo');
        const data = response.data;
        if (data.success && data.data) {
          setFooterInfo({ className: data.data.className });
        }
      } catch (error) {
        console.error('Failed to load footer info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFooterInfo();
  }, []);

  if (loading) {
    return (
      <footer className="border-t border-gray-200 mt-8 py-4">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <small className="text-gray-500">
            &copy; {new Date().getFullYear()} NextShop. All rights reserved.
          </small>
        </div>
      </footer>
    );
  }

  if (!footerInfo) {
    return (
      <footer className="border-t border-gray-200 mt-8 py-4">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <small className="text-gray-500">
            &copy; {new Date().getFullYear()} NextShop. All rights reserved.
          </small>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-gray-200 mt-8">
      <div dangerouslySetInnerHTML={{ __html: footerInfo.className }} />
    </footer>
  );
};

export default Footer;
