import {
  BarChart3,
  Database,
  History,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  Upload,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onLogout?: () => void;
}

function Sidebar({
  activePage,
  setActivePage,
  darkMode,
  setDarkMode,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "upload",
      label: "Upload Data",
      icon: Upload,
    },
    {
      id: "forecast",
      label: "Forecast",
      icon: TrendingUp,
    },
    
    {
      id: "insights",
      label: "Insights",
      icon: Lightbulb,
    },
    {
      id: "history",
      label: "History",
      icon: History,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <BarChart3 size={22} />
        </div>

        <div>
          <h1>PredictIQ</h1>
          <span>Business Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section-title">
        ANALYTICS
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
            
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="data-status">
          <div className="status-icon">
            <Database size={16} />
          </div>

          <div>
            <strong>Data Engine</strong>
            <span>Ready</span>
          </div>

          <span className="status-dot" />
        </div>

        <button
          className="theme-button"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? (
            <>
              <Sun size={18} />
              Light Mode
            </>
          ) : (
            <>
              <Moon size={18} />
              Dark Mode
            </>
          )}
        </button>

        {onLogout && (
          <button
            className="theme-button"
            onClick={onLogout}
            style={{ marginTop: "6px" }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
