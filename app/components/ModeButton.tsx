import React from "react";

const Grid2Icon = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="7" fill="currentColor" />
    <rect x="11" y="2" width="7" height="7" fill="currentColor" />
    <rect x="2" y="11" width="7" height="7" fill="currentColor" />
    <rect x="11" y="11" width="7" height="7" fill="currentColor" />
  </svg>
);

const Grid3Icon = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="4" height="4" fill="currentColor" />
    <rect x="8" y="2" width="4" height="4" fill="currentColor" />
    <rect x="14" y="2" width="4" height="4" fill="currentColor" />
    <rect x="2" y="8" width="4" height="4" fill="currentColor" />
    <rect x="8" y="8" width="4" height="4" fill="currentColor" />
    <rect x="14" y="8" width="4" height="4" fill="currentColor" />
    <rect x="2" y="14" width="4" height="4" fill="currentColor" />
    <rect x="8" y="14" width="4" height="4" fill="currentColor" />
    <rect x="14" y="14" width="4" height="4" fill="currentColor" />
  </svg>
);

const Grid4Icon = () => (
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="3" height="3" fill="currentColor" />
    <rect x="6" y="1" width="3" height="3" fill="currentColor" />
    <rect x="11" y="1" width="3" height="3" fill="currentColor" />
    <rect x="16" y="1" width="3" height="3" fill="currentColor" />
    <rect x="1" y="6" width="3" height="3" fill="currentColor" />
    <rect x="6" y="6" width="3" height="3" fill="currentColor" />
    <rect x="11" y="6" width="3" height="3" fill="currentColor" />
    <rect x="16" y="6" width="3" height="3" fill="currentColor" />
    <rect x="1" y="11" width="3" height="3" fill="currentColor" />
    <rect x="6" y="11" width="3" height="3" fill="currentColor" />
    <rect x="11" y="11" width="3" height="3" fill="currentColor" />
    <rect x="16" y="11" width="3" height="3" fill="currentColor" />
    <rect x="1" y="16" width="3" height="3" fill="currentColor" />
    <rect x="6" y="16" width="3" height="3" fill="currentColor" />
    <rect x="11" y="16" width="3" height="3" fill="currentColor" />
    <rect x="16" y="16" width="3" height="3" fill="currentColor" />
  </svg>
);

const iconMap: Record<number, React.JSX.Element> = {
  2: <Grid2Icon />,
  3: <Grid3Icon />,
  4: <Grid4Icon />,
};

interface ModeButtonProps {
  active: boolean;
  modeKey: number;
  label: string;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({
  active,
  modeKey,
  label,
  onClick,
}) => (
  <button
    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
      ${
        active ? "bg-white shadow text-black" : "bg-transparent text-gray-400"
      }`}
    onClick={onClick}
    aria-label={label}
    type="button"
  >
    <span className="inline-block align-middle">{iconMap[modeKey]}</span>
  </button>
);

export default ModeButton;
