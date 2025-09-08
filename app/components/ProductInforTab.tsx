import { useState } from "react";
import Button from "./Button";

type Tab = {
  label: string;
  content: React.ReactNode;
};

const defaultTabs: Tab[] = [
  {
    label: "Description",
    content: (
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </p>
    ),
  },
  {
    label: "Additional Info",
    content: <p>Additional product information goes here.</p>,
  },
  {
    label: "Reviews (9)",
    content: <p>Reviews content goes here.</p>,
  },
];

export default function ProductInforTab({
  tabs = defaultTabs,
}: {
  tabs?: Tab[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-[#f7f4ff] rounded-2xl p-4 md:p-8">
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
        {tabs.map((tab, idx) => (
          <Button
            key={tab.label}
            shape="rounded"
            size="sm"
            className={`border transition-colors px-4 py-2 md:px-6 md:py-2 text-sm md:text-base
              ${
                active === idx
                  ? "bg-[#6c47c6] text-white font-semibold border-[#6c47c6]"
                  : "bg-white text-[#3d2173] border-[#e2d8fa] font-medium"
              }
            `}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="text-base md:text-lg text-gray-700">
        {tabs[active].content}
      </div>
    </div>
  );
}
