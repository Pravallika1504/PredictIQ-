import { useState } from "react";
import "../styles/Login.css";

interface CreateAccountProps {
  onNavigateToLogin: () => void;
}

export default function CreateAccount({ onNavigateToLogin }: CreateAccountProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const usersRaw = localStorage.getItem("predictiq_users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const existingUser = users.find(
        (u: any) => u.email?.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError("An account with this email already exists.");
        return;
      }

      users.push({
        name: name.trim(),
        email: email.trim(),
        password: password,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("predictiq_users", JSON.stringify(users));

      // Record in history
      try {
        const historyRaw = localStorage.getItem("predictiq_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift({
          id: Date.now(),
          type: "account",
          title: "Account Created",
          description: `New account registered for ${email.trim()}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        localStorage.setItem("predictiq_history", JSON.stringify(history));
      } catch {
        // Ignore history error
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        onNavigateToLogin();
      }, 1200);
    } catch {
      setError("Failed to create account. Please try again.");
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

        {/* Create Account card */}
        <div className="login-card">
          <div className="login-header">
            <h2>Create Account</h2>
            <p>Sign up to start using PredictIQ</p>
          </div>

          <form onSubmit={handleCreateAccount}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
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
              Create Account
            </button>

            <div
              style={{
                marginTop: "16px",
                textAlign: "center",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Already have an account?{" "}
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
