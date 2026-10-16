import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  X,
} from "lucide-react";

import { useState } from "react";
import { uploadSalesFile } from "../api";

function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setIsError(true);
      setMessage("Please select a CSV file (.csv).");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setIsError(false);
  }

  async function handleUpload() {
    if (!file) {
      setIsError(true);
      setMessage("Please select a CSV file first.");
      return;
    }

    try {
      setUploading(true);
      setIsError(false);
      setMessage("");

      const result = await uploadSalesFile(file);

      setIsError(false);
      setMessage(
        result.message || "Dataset uploaded and analyzed successfully."
      );

      // Record in history
      try {
        const historyRaw = localStorage.getItem("predictiq_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift({
          id: Date.now(),
          type: "upload",
          title: "Dataset Uploaded",
          description: `${file.name} (${result.dataset?.rows?.toLocaleString() || "processed"} rows)`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        localStorage.setItem("predictiq_history", JSON.stringify(history));
      } catch {
        // Ignore history error
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setIsError(true);
      const errMsg =
        error?.message ||
        "Upload failed. Please make sure the backend is running.";
      setMessage(errMsg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DATA MANAGEMENT</span>

          <h2>Upload Sales Data</h2>

          <p>
            Upload a CSV dataset to analyze sales and
            generate forecasts.
          </p>
        </div>
      </div>

      <div className="upload-layout">
        <div className="upload-card">
          <div className="upload-icon">
            <UploadCloud size={34} />
          </div>

          <h3>Upload your sales dataset</h3>

          <p>
            Select a CSV file containing your sales
            transactions.
          </p>

          <label className="upload-dropzone">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />

            <FileSpreadsheet size={34} />

            <strong>
              {file
                ? file.name
                : "Click to browse your CSV file"}
            </strong>

            <span>
              CSV files only • Recommended: 1,000+ rows
            </span>
          </label>

          {file && (
            <div className="selected-file">
              <div>
                <FileSpreadsheet size={20} />

                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setMessage("");
                  setIsError(false);
                }}
                className="remove-file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <button
            className="primary-button upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading
              ? "Processing..."
              : "Analyze Dataset"}
          </button>

          {message && (
            <div
              className="upload-message"
              style={{
                color: isError ? "#dc2626" : "#2b8a60",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "14px",
                fontSize: "13px",
                lineHeight: "1.4"
              }}
            >
              {isError ? (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              )}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="requirements-card">
          <h3>Dataset Requirements</h3>

          <p>
            Your CSV should contain these recommended
            columns:
          </p>

          <div className="column-list">
            {[
              "Order_Date",
              "Product",
              "Category",
              "Region",
              "Quantity",
              "Unit_Price",
              "Discount",
              "Sales",
              "Profit",
            ].map((column) => (
              <div key={column}>
                <CheckCircle2 size={16} />
                {column}
              </div>
            ))}
          </div>

          <div className="format-note">
            <strong>Tip</strong>
            <p>
              More historical records generally provide
              more useful forecasting results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;