import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  badgeType?: "increase" | "status" | "normal";
  icon: ReactNode;
  iconBgColor?: string;
}

export default function MetricCard({
  title,
  value,
  badgeText,
  badgeType = "increase",
  icon,
  iconBgColor = "bg-blue-600/20 text-blue-400",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 shadow-sm transition hover:border-navy-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>

        {badgeText && (
          <div
            className={`flex items-center text-xs font-semibold ${
              badgeType === "increase"
                ? "text-emerald-400"
                : badgeType === "status"
                ? "text-blue-400"
                : "text-emerald-400"
            }`}
          >
            {badgeType === "increase" && <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
            <span>{badgeText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
