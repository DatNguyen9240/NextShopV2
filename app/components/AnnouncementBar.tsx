import React, { useState, useEffect } from "react";
import axios from '../lib/axiosClient';

const AnnouncementBar = React.memo(function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<{ className: string } | null>(null);

  useEffect(() => {
    axios.get('/api/Announcements/active')
      .then(response => {
        const data = response.data;
        if (data.success && data.data) {
          setAnnouncement({ className: data.data.className });
        }
      })
      .catch(err => console.error('Failed to fetch announcement', err));
  }, []);

  if (!announcement) return null;

  return (
    <div dangerouslySetInnerHTML={{ __html: announcement.className }} />
  );
});

export default AnnouncementBar;
