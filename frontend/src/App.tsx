import { useEffect, useState } from "react";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Forecast from "./pages/Forecast";
import Insights from "./pages/Insights";
import History from "./pages/History";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(false);

  const [authView, setAuthView] = useState<
    "login" | "create-account" | "forgot-password"
  >("login");

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("predictiq_logged_in") === "true"
  );

  // Keep this hook BEFORE the login condition
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("predictiq_logged_in");
    setIsLoggedIn(false);
    setAuthView("login");
  };

  function renderPage() {
    switch (activePage) {
      case "upload":
        return <Upload />;

      case "forecast":
        return <Forecast />;

      case "insights":
        return <Insights />;

      case "history":
        return <History />;

      case "dashboard":
      default:
        return <Dashboard />;
    }
  }

  // Show Login, Create Account, or Forgot Password before the main application
  if (!isLoggedIn) {
    if (authView === "create-account") {
      return (
        <CreateAccount
          onNavigateToLogin={() => setAuthView("login")}
        />
      );
    }

    if (authView === "forgot-password") {
      return (
        <ForgotPassword
          onNavigateToLogin={() => setAuthView("login")}
        />
      );
    }

    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        onNavigateToCreateAccount={() => setAuthView("create-account")}
        onNavigateToForgotPassword={() => setAuthView("forgot-password")}
      />
    );
  }

  // Existing PredictIQ application
  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;