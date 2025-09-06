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
}) => {
  const allModes = [...modes];
  if (!allModes.some((m) => m.key === 1)) {
    allModes.unshift({ key: 1, label: "Grid 1" });
  }

  return (
    <div
      className={`flex items-center gap-2 ${className} bg-gray-100 rounded-lg px-3 py-2`}
    >
      {allModes.map((mode) => (
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
};

export default ViewModeSwitcher;
