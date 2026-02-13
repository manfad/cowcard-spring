import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "slate",
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export const colorBgMap: Record<string, string> = {
  slate: "bg-slate-500",
  gray: "bg-gray-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  lime: "bg-lime-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  fuchsia: "bg-fuchsia-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
};

export const colorBtnMap: Record<string, string> = {
  slate: "bg-slate-500 text-white hover:bg-slate-600",
  gray: "bg-gray-500 text-white hover:bg-gray-600",
  red: "bg-red-500 text-white hover:bg-red-600",
  orange: "bg-orange-500 text-white hover:bg-orange-600",
  amber: "bg-amber-500 text-white hover:bg-amber-600",
  yellow: "bg-yellow-500 text-white hover:bg-yellow-600",
  lime: "bg-lime-500 text-white hover:bg-lime-600",
  green: "bg-green-500 text-white hover:bg-green-600",
  emerald: "bg-emerald-500 text-white hover:bg-emerald-600",
  teal: "bg-teal-500 text-white hover:bg-teal-600",
  cyan: "bg-cyan-500 text-white hover:bg-cyan-600",
  sky: "bg-sky-500 text-white hover:bg-sky-600",
  blue: "bg-blue-500 text-white hover:bg-blue-600",
  indigo: "bg-indigo-500 text-white hover:bg-indigo-600",
  violet: "bg-violet-500 text-white hover:bg-violet-600",
  purple: "bg-purple-500 text-white hover:bg-purple-600",
  fuchsia: "bg-fuchsia-500 text-white hover:bg-fuchsia-600",
  pink: "bg-pink-500 text-white hover:bg-pink-600",
  rose: "bg-rose-500 text-white hover:bg-rose-600",
};

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          className={cn(
            "h-7 w-7 rounded-full transition-all",
            colorBgMap[c],
            value === c
              ? "ring-2 ring-offset-2 ring-primary scale-110"
              : "hover:scale-110",
          )}
          onClick={() => onChange(c)}
          title={c}
        />
      ))}
    </div>
  );
}
