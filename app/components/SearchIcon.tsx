import React from "react";

const SearchIcon = React.memo(function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="#222"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
});

export default SearchIcon;
