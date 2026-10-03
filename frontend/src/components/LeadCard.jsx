import { Check, ExternalLink, Mail, MapPin, Phone, Star } from "lucide-react";

export default function LeadCard({ lead, selected, onToggle }) {
  return (
    <article className={`lead-card ${selected ? "selected" : ""}`}>
      <button
        className={`checkbox ${selected ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={`Select ${lead.name}`}
      >
        {selected && <Check size={14} />}
      </button>

      <div className="lead-main">
        <div className="lead-heading">
          <div className="business-avatar">
            {lead.name?.slice(0, 1).toUpperCase() || "B"}
          </div>
          <div>
            <h3>{lead.name}</h3>
            <p>{lead.category || "Business"}</p>
          </div>
        </div>

        <div className="lead-details">
          <span><MapPin size={14} /> {lead.location || lead.address || "US"}</span>
          {lead.phone && <span><Phone size={14} /> {lead.phone}</span>}
          {lead.email ? (
            <span className="email-found"><Mail size={14} /> {lead.email}</span>
          ) : (
            <span className="email-missing"><Mail size={14} /> No professional email found</span>
          )}
        </div>

        <div className="lead-meta">
          {lead.rating != null && (
            <span><Star size={12} /> {lead.rating} · {lead.reviewCount} reviews</span>
          )}
          {lead.emailConfidence != null && (
            <span className="confidence">Email confidence {lead.emailConfidence}%</span>
          )}
        </div>

        <div className="lead-footer">
          <span>{lead.source}</span>
          {lead.osmUrl && (
            <a href={lead.osmUrl} target="_blank" rel="noreferrer">
              View source <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
