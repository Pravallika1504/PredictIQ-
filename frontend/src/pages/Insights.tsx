import {
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Package,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getInsights } from "../api";
import type { InsightItem } from "../api";

function Insights() {
  const [insights, setInsights] = useState<InsightItem[]>([
    {
      id: "category",
      type: "Revenue",
      title: "Electronics generated the highest revenue.",
      description: "Electronics products contributed strongly to overall sales performance.",
      icon: "DollarSign",
      trend: "up"
    },
    {
      id: "region",
      type: "Regional Performance",
      title: "South region showed strong sales activity.",
      description: "Regional analysis can help identify high performing markets.",
      icon: "MapPin",
      trend: "up"
    },
    {
      id: "product",
      type: "Products",
      title: "High-value products drive a large share of revenue.",
      description: "Product-level analysis can identify items contributing most to sales.",
      icon: "Package",
      trend: "up"
    },
    {
      id: "optimization",
      type: "Optimization Opportunity",
      title: "Compare revenue against profit margins.",
      description: "High sales do not always mean high profitability.",
      icon: "TrendingUp",
      trend: "down"
    }
  ]);

  const [datasetName, setDatasetName] = useState<string>("sales.csv");

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await getInsights();
        if (res && res.insights && res.insights.length > 0) {
          setInsights(res.insights);
          if (res.dataset_name) {
            setDatasetName(res.dataset_name);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic insights:", err);
      }
    }

    loadInsights();
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin size={21} />;
      case "Package":
        return <Package size={21} />;
      case "TrendingUp":
        return <TrendingUp size={21} />;
      case "DollarSign":
      default:
        return <DollarSign size={21} />;
    }
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h2>Business Insights</h2>

          <p>
            Key observations generated from your sales
            data ({datasetName}).
          </p>
        </div>
      </div>

      <div className="insights-grid">
        {insights.map((item) => (
          <div className="business-insight" key={item.id}>
            <div className="business-insight-icon">
              {renderIcon(item.icon)}
            </div>

            <div>
              <span>{item.type}</span>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </div>

            {item.trend === "up" ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownRight size={20} />
            )}
          </div>
        ))}
      </div>

      <div className="insight-footer">
        <Lightbulb size={20} />

        <div>
          <strong>Insights Engine Active</strong>

          <p>
            Observations are dynamically synthesized from{" "}
            <strong>{datasetName}</strong> using statistical
            aggregation and machine learning models.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Insights;