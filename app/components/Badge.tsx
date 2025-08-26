import React from "react";

interface BadgeProps {
  count: number;
}

const Badge: React.FC<BadgeProps> = React.memo(function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="bg-green-500 text-white rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center absolute -top-1.5 -right-1.5 px-1 font-semibold shadow">
      {count}
    </span>
  );
});

export default Badge;
