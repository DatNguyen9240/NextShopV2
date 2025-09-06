import ModeButton from "./ModeButton";

const ViewModeSwitcher = ({
  value,
  onChange,
  modes,
  className = "",
}: {
  value: number;
  onChange: (cols: number) => void;
  modes: { key: number; label: string }[];
  className?: string;
}) => (
  <div
    className={`flex items-center gap-2 ${className} bg-gray-100 rounded-lg px-3 py-2`}
  >
    {modes.map((mode) => (
      <ModeButton
        key={mode.key}
        active={value === mode.key}
        modeKey={mode.key}
        label={mode.label}
        onClick={() => onChange(mode.key)}
      />
    ))}
  </div>
);

export default ViewModeSwitcher;
