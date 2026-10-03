import { Bell, HelpCircle } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <button className="icon-button"><HelpCircle size={18} /></button>
        <button className="icon-button"><Bell size={18} /></button>
        <div className="avatar">S</div>
      </div>
    </header>
  );
}
