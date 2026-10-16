import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  description?: string;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-icon">
          <Icon size={20} />
        </div>

        {change && (
          <span className="metric-change">
            <ArrowUpRight size={14} />
            {change}
          </span>
        )}
      </div>

      <div className="metric-title">{title}</div>

      <div className="metric-value">{value}</div>

      {description && (
        <div className="metric-description">
          {description}
        </div>
      )}
    </div>
  );
}

export default MetricCard;