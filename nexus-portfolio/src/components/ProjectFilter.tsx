"use client";

import { categories } from "@/data/projects";

interface Props {
  active: string;
  onChange: (category: string) => void;
}

const options = ["Todas", ...categories];

export default function ProjectFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "border-terracota bg-terracota text-cream"
                : "border-[var(--border)] text-[var(--text)] hover:border-terracota hover:text-terracota"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
