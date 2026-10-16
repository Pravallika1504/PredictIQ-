import { useState } from "react";

interface HistoryItem {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("predictiq_history");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const clearHistory = () => {
    localStorage.removeItem("predictiq_history");
    setHistory([]);
  };

  return (
    <div style={{ padding: "28px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            History
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            View your recent PredictIQ activity.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              border: "1px solid #cbd5e1",
              background: "white",
              padding: "9px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            background: "white",
          }}
        >
          <h3>No history yet</h3>

          <p style={{ color: "#64748b" }}>
            Your PredictIQ activity will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "18px 20px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "16px",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
