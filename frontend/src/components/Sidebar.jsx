import { LayoutDashboard, Search, Users, Mail, Settings, Sparkles } from "lucide-react";

export default function Sidebar({ activePage, onChange }) {
  const items = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["find", "Find Buyers", Search],
    ["leads", "Selected Leads", Users],
    ["email", "Email Buyers", Mail]
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={17} /></div>
        <div>
          <strong>BuyerLead</strong>
          <span>API workspace</span>
        </div>
      </div>

      <p className="nav-label">Workspace</p>

      {items.map(([id, label, Icon]) => (
        <button
          key={id}
          className={`nav-item ${activePage === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => onChange("settings")}
        >
          <Settings size={18} />
          <span>API Status</span>
        </button>
      </div>
    </aside>
  );
}
