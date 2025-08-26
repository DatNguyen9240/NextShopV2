import React from "react";

const AnnouncementBar = React.memo(function AnnouncementBar() {
  return (
    <div className="w-full bg-purple-600 text-white text-center py-1 px-2 text-sm font-semibold">
      Miễn phí vận chuyển với đơn hàng trị giá 300.000đ trở lên và chỉ ship ở
      khu vực Bình Long
    </div>
  );
});

export default AnnouncementBar;
