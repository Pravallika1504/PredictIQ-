import { useState } from "react";
import "../styles/Login.css";

interface LoginProps {
  onLogin: () => void;
  onNavigateToCreateAccount?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function Login({
  onLogin,
  onNavigateToCreateAccount,
  onNavigateToForgotPassword,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    // Check credentials against registered users in localStorage
    const usersRaw = localStorage.getItem("predictiq_users");
    let users: any[] = [];
    try {
      users = usersRaw ? JSON.parse(usersRaw) : [];
    } catch {
      users = [];
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(
      (u: any) =>
        u.email?.trim().toLowerCase() === cleanEmail &&
        u.password === password
    );

    // Also support default admin credentials (admin@predictiq.com / admin123) if not overridden
    const adminUser = users.find(
      (u: any) => u.email?.trim().toLowerCase() === "admin@predictiq.com"
    );
    const isDefaultAdmin =
      !adminUser && cleanEmail === "admin@predictiq.com" && password === "admin123";

    if (!user && !isDefaultAdmin) {
      setError("Invalid email or password. Only registered users with correct credentials can enter.");
      return;
    }

    localStorage.setItem("predictiq_logged_in", "true");
    localStorage.setItem("predictiq_user_email", email.trim());

    // Record login in history
    try {
      const historyRaw = localStorage.getItem("predictiq_history");
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({
        id: Date.now(),
        type: "auth",
        title: "User Signed In",
        description: `Signed in as ${email.trim()}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      localStorage.setItem("predictiq_history", JSON.stringify(history));
    } catch {
      // Ignore history error
    }

    onLogin();
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
          <div className="brand-icon">
            P
          </div>

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

        {/* Login card */}
        <div className="login-card">

          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to PredictIQ</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() => {
                    if (onNavigateToForgotPassword) {
                      onNavigateToForgotPassword();
                    } else {
                      setError("Password recovery will be available soon.");
                    }
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>

            {onNavigateToCreateAccount && (
              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToCreateAccount}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

          </form>

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