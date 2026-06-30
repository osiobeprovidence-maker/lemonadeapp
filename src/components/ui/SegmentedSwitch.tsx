import { motion } from "framer-motion";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedSwitchProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
}

export default function SegmentedSwitch<T extends string>({
  options,
  value,
  onChange,
  name,
}: SegmentedSwitchProps<T>) {
  return (
    <div className="flex w-fit rounded-full bg-[#141414] p-1 ring-1 ring-white/8">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative rounded-full px-5 py-2 text-sm font-bold transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId={name || "segmented-pill"}
                className="absolute inset-0 rounded-full bg-lemon-muted"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon && <span>{opt.icon}</span>}
              <span className={isActive ? "text-black" : "text-white/60"}>
                {opt.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
