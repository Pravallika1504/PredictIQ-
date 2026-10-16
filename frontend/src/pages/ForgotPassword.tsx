import { useState } from "react";
import "../styles/Login.css";

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export default function ForgotPassword({ onNavigateToLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check against registered users in localStorage
    const usersRaw = localStorage.getItem("predictiq_users");
    let users: any[] = [];
    try {
      users = usersRaw ? JSON.parse(usersRaw) : [];
    } catch {
      users = [];
    }

    const userExists = users.some(
      (u: any) => u.email?.trim().toLowerCase() === cleanEmail
    );
    const isDefaultAdmin = cleanEmail === "admin@predictiq.com";

    if (!userExists && !isDefaultAdmin) {
      setError("No account found with this email address. Please check your spelling or create an account.");
      return;
    }

    // Proceed to Step 2
    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const usersRaw = localStorage.getItem("predictiq_users");
      let users: any[] = [];
      try {
        users = usersRaw ? JSON.parse(usersRaw) : [];
      } catch {
        users = [];
      }

      const userIndex = users.findIndex(
        (u: any) => u.email?.trim().toLowerCase() === cleanEmail
      );

      if (userIndex !== -1) {
        // Update existing user password
        users[userIndex].password = newPassword;
      } else if (cleanEmail === "admin@predictiq.com") {
        // If default admin, save into registered users with new password
        users.push({
          name: "Administrator",
          email: "admin@predictiq.com",
          password: newPassword,
          createdAt: new Date().toISOString(),
        });
      } else {
        setError("Account verification failed. Please start over.");
        setStep(1);
        return;
      }

      localStorage.setItem("predictiq_users", JSON.stringify(users));

      // Record in history
      try {
        const historyRaw = localStorage.getItem("predictiq_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift({
          id: Date.now(),
          type: "auth",
          title: "Password Reset",
          description: `Password reset successfully for ${cleanEmail}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        localStorage.setItem("predictiq_history", JSON.stringify(history));
      } catch {
        // Ignore history error
      }

      setSuccess("Password has been reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        onNavigateToLogin();
      }, 1400);
    } catch {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>
      </div>

      <div className="login-container">
        {/* Left branding section */}
        <div className="login-brand">
          <div className="brand-icon">P</div>

          <h1>PredictIQ</h1>

          <p className="brand-tagline">
            Sales Forecasting & Business Intelligence
          </p>

          <div className="brand-description">
            <p>
              Turn your sales data into meaningful insights,
              accurate forecasts, and smarter business decisions.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span>✓</span>
              <span>Interactive Sales Analytics</span>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <span>Machine Learning Forecasting</span>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <span>AI-Powered Business Insights</span>
            </div>
          </div>
        </div>

        {/* Password recovery card */}
        <div className="login-card">
          <div className="login-header">
            <h2>{step === 1 ? "Reset Password" : "Set New Password"}</h2>
            <p>
              {step === 1
                ? "Enter your registered email to verify your account"
                : `Account verified for ${email.trim()}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label htmlFor="recovery-email">Email Address</label>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-button">
                Verify Account
              </button>

              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="new-password">New Password</label>
                </div>

                <div className="password-input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                </div>

                <div className="password-input-wrapper">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              {success && (
                <div
                  style={{
                    padding: "11px 13px",
                    marginBottom: "18px",
                    borderRadius: "9px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontSize: "13px",
                  }}
                >
                  {success}
                </div>
              )}

              <button type="submit" className="login-button">
                Update Password
              </button>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ← Change email
                </button>

                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          <div className="login-footer">
            <span>PredictIQ</span>
            <span>•</span>
            <span>Business Intelligence Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

