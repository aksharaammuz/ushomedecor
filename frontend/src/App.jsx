import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Building2, CheckCircle2, ChevronLeft,
  Mail, MapPin, Search, Send, Settings2, Users, Zap
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import LeadCard from "./components/LeadCard";
import { findBuyers, getHealth, sendEmail } from "./services/api";

const meta = {
  dashboard: ["Dashboard", "API-powered buyer discovery for US home-decor sellers."],
  find: ["Find Buyers", "Search live business data using your product and target market."],
  leads: ["Selected Leads", "Businesses you chose during this session."],
  email: ["Email Buyers", "Send your message through the email API."],
  settings: ["API Status", "Check whether the external API integrations are configured."]
};

const initialForm = {
  product: "Handmade wall decor",
  buyerType: "Interior designers",
  location: "Los Angeles, CA"
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [form, setForm] = useState(initialForm);
  const [leads, setLeads] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    businessDiscovery: true, hunter: false, resend: false
  });
  const [email, setEmail] = useState({
    subject: "Wholesale Home Decor Opportunity",
    message:
`Hello,

I’m reaching out because I think our home-decor collection could be a strong fit for your business.

We work with sellers of handmade home-decor products and would be happy to share our catalog and wholesale details.

Would you be open to a quick conversation?

Best,
Seller`
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getHealth()
      .then((data) => setApiStatus(data.providers || {}))
      .catch(() => {});
  }, []);

  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedIds.includes(lead.id)),
    [leads, selectedIds]
  );

  const emailLeads = selectedLeads.filter((lead) => lead.email);

  function notify(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function search(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await findBuyers(form);
      setLeads(data.leads || []);
      setSelectedIds([]);
      setPage("find");
      notify("success", `${data.count} businesses found through live business discovery. Hunter email enrichment was attempted.`);
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  function selectAll() {
    setSelectedIds(
      selectedIds.length === leads.length ? [] : leads.map((x) => x.id)
    );
  }

  function openEmail() {
    if (!selectedIds.length) {
      notify("error", "Select at least one buyer.");
      return;
    }
    setSent(false);
    setPage("email");
  }

  async function submitEmail(event) {
    event.preventDefault();

    const recipients = emailLeads.map((lead) => lead.email);

    if (!recipients.length) {
      notify("error", "No selected lead has an email address.");
      return;
    }

    try {
      const result = await sendEmail({
        recipients,
        subject: email.subject,
        message: email.message
      });
      setSent(true);
      notify("success", result.message);
    } catch (error) {
      notify("error", error.message);
    }
  }

  const [title, subtitle] = meta[page];

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onChange={setPage} />

      <main className="main">
        <Topbar title={title} subtitle={subtitle} />

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === "success"
              ? <CheckCircle2 size={18} />
              : <Zap size={18} />}
            {toast.message}
          </div>
        )}

        {page === "dashboard" && (
          <Dashboard
            leads={leads}
            selected={selectedLeads}
            status={apiStatus}
            onFind={() => setPage("find")}
            onEmail={openEmail}
          />
        )}

        {page === "find" && (
          <FindPage
            form={form}
            setForm={setForm}
            leads={leads}
            selectedIds={selectedIds}
            loading={loading}
            onSubmit={search}
            onToggle={toggle}
            onSelectAll={selectAll}
            onEmail={openEmail}
          />
        )}

        {page === "leads" && (
          <LeadsPage
            leads={selectedLeads}
            onFind={() => setPage("find")}
            onEmail={openEmail}
            onToggle={toggle}
          />
        )}

        {page === "email" && (
          <EmailPage
            leads={selectedLeads}
            emailLeads={emailLeads}
            email={email}
            setEmail={setEmail}
            sent={sent}
            onBack={() => setPage("find")}
            onSubmit={submitEmail}
          />
        )}

        {page === "settings" && <SettingsPage status={apiStatus} />}
      </main>
    </div>
  );
}

function Dashboard({ leads, selected, status, onFind, onEmail }) {
  return (
    <div className="content">
      <section className="hero">
        <div>
          <div className="eyebrow"><span /> Live API lead generation</div>
          <h2>Find real businesses<br />for your products.</h2>
          <p>
            Enter your home-decor product, buyer type and US location.
            BuyerLead queries live business data, enriches contacts, and lets you email selected leads.
          </p>
          <button className="primary-button" onClick={onFind}>
            <Search size={17} /> Find buyers <ArrowRight size={16} />
          </button>
        </div>
        <div className="api-visual">
          <div className="api-node top"><Building2 size={17} /><span>OpenStreetMap</span></div>
          <div className="api-line" />
          <div className="api-node"><Mail size={17} /><span>Hunter</span></div>
          <div className="api-line" />
          <div className="api-node bottom"><Send size={17} /><span>Resend</span></div>
        </div>
      </section>

      <div className="api-strip">
        <ApiMini name="OpenStreetMap" ok={status.businessDiscovery} text="Find businesses" />
        <ApiMini name="Hunter" ok={status.hunter} text="Find emails" />
        <ApiMini name="Resend" ok={status.resend} text="Send email" />
      </div>

      <div className="stats-grid">
        <Stat label="Businesses found" value={leads.length} note="Live search results" icon={<Building2 size={18} />} />
        <Stat label="Selected" value={selected.length} note="Seller-selected leads" icon={<Users size={18} />} />
        <Stat label="Email available" value={leads.filter(x => x.email).length} note="Hunter results" icon={<Mail size={18} />} />
        <Stat label="APIs connected" value={Object.values(status).filter(Boolean).length + "/3"} note="Backend status" icon={<Settings2 size={18} />} />
      </div>

      {selected.length > 0 && (
        <div className="bottom-action">
          <span><strong>{selected.length}</strong> buyers selected</span>
          <button className="primary-button small" onClick={onEmail}>
            <Mail size={16} /> Compose email
          </button>
        </div>
      )}
    </div>
  );
}

function ApiMini({ name, ok, text }) {
  return (
    <div className="api-mini">
      <span className={`api-dot ${ok ? "ok" : ""}`} />
      <div><strong>{name}</strong><span>{ok ? text : "Key not configured"}</span></div>
    </div>
  );
}

function Stat({ label, value, note, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </div>
  );
}

function FindPage({ form, setForm, leads, selectedIds, loading, onSubmit, onToggle, onSelectAll, onEmail }) {
  return (
    <div className="content">
      <section className="search-panel">
        <div className="section-title">
          <div>
            <span className="kicker">Live business search</span>
            <h2>Describe your target buyer.</h2>
          </div>
          <span className="live-chip"><i /> OpenStreetMap API</span>
        </div>

        <form className="search-form" onSubmit={onSubmit}>
          <label>
            <span>What are you selling?</span>
            <input
              value={form.product}
              onChange={(e) => setForm({...form, product: e.target.value})}
              placeholder="Handmade wall decor"
            />
          </label>

          <label>
            <span>What type of buyer?</span>
            <select
              value={form.buyerType}
              onChange={(e) => setForm({...form, buyerType: e.target.value})}
            >
              <option>Interior designers</option>
              <option>Home decor stores</option>
              <option>Furniture stores</option>
              <option>Boutiques</option>
              <option>Gift shops</option>
              <option>Architectural firms</option>
            </select>
          </label>

          <label>
            <span>US location</span>
            <input
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              placeholder="Los Angeles, CA"
            />
          </label>

          <button className="primary-button search-button" disabled={loading}>
            {loading ? <span className="spinner" /> : <Search size={17} />}
            {loading ? "Searching APIs..." : "Find buyers"}
          </button>
        </form>

        <div className="search-note">
          <span>API chain</span> OpenStreetMap/Overpass → Hunter Domain Search → combined lead results
        </div>
      </section>

      <section className="results-section">
        <div className="results-header">
          <div>
            <span className="kicker">Live results</span>
            <h2>Potential buyers <span>{leads.length}</span></h2>
          </div>
          {leads.length > 0 && (
            <div className="result-actions">
              <button className="secondary-button" onClick={onSelectAll}>
                {selectedIds.length === leads.length ? "Clear all" : "Select all"}
              </button>
              <button className="primary-button small" onClick={onEmail} disabled={!selectedIds.length}>
                <Mail size={16} /> Email selected ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {leads.length > 0 ? (
          <div className="lead-grid">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                selected={selectedIds.includes(lead.id)}
                onToggle={() => onToggle(lead.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={25} />
            <h3>Search the live business API</h3>
            <p>Enter a product, buyer type and US location above. The application will discover businesses at runtime.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function LeadsPage({ leads, onFind, onEmail, onToggle }) {
  return (
    <div className="content">
      <section className="results-section">
        <div className="results-header">
          <div><span className="kicker">Seller selection</span><h2>Selected leads <span>{leads.length}</span></h2></div>
          {leads.length > 0 && <button className="primary-button small" onClick={onEmail}><Mail size={16} /> Email selected</button>}
        </div>

        {leads.length > 0 ? (
          <div className="lead-grid">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} selected onToggle={() => onToggle(lead.id)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={25} />
            <h3>No selected leads</h3>
            <p>Find businesses through the API and select the buyers you want to contact.</p>
            <button className="primary-button" onClick={onFind}><Search size={16} /> Find buyers</button>
          </div>
        )}
      </section>
    </div>
  );
}

function EmailPage({ leads, emailLeads, email, setEmail, sent, onBack, onSubmit }) {
  return (
    <div className="content">
      <button className="back-button" onClick={onBack}><ChevronLeft size={16} /> Back to results</button>

      <div className="email-layout">
        <section className="compose-card">
          <div className="section-title">
            <div><span className="kicker">Resend API</span><h2>Compose email</h2></div>
            <span className="count-pill">{emailLeads.length} with email</span>
          </div>

          {sent ? (
            <div className="sent-state">
              <div className="success-circle"><CheckCircle2 size={31} /></div>
              <h2>Email API request completed</h2>
              <p>Your email was submitted to Resend for {emailLeads.length} selected recipient(s).</p>
              <button className="secondary-button" onClick={onBack}>Back to buyers</button>
            </div>
          ) : (
            <form className="email-form" onSubmit={onSubmit}>
              <label>
                <span>Recipients</span>
                <div className="recipient-box">
                  {leads.map((lead) => (
                    <span className={`recipient ${lead.email ? "" : "missing"}`} key={lead.id}>
                      {lead.email || `${lead.name} — no email`}
                    </span>
                  ))}
                </div>
              </label>

              <label>
                <span>Subject</span>
                <input value={email.subject} onChange={(e) => setEmail({...email, subject: e.target.value})} />
              </label>

              <label>
                <span>Message</span>
                <textarea rows="13" value={email.message} onChange={(e) => setEmail({...email, message: e.target.value})} />
              </label>

              <div className="compose-footer">
                <p>Only selected leads with discovered email addresses are sent to the email API.</p>
                <button className="primary-button" disabled={!emailLeads.length}>
                  <Send size={17} /> Send through Resend
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="recipient-preview">
          <span className="kicker">Selected buyers</span>
          <h3>Recipients</h3>
          {leads.map((lead) => (
            <div className="recipient-row" key={lead.id}>
              <div className="business-avatar small-avatar">{lead.name.slice(0,1)}</div>
              <div>
                <strong>{lead.name}</strong>
                <span>{lead.email || "No email found"}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function SettingsPage({ status }) {
  const providers = [
    ["OpenStreetMap + Overpass", "Business discovery", status.businessDiscovery],
    ["Hunter API", "Professional email discovery", status.hunter],
    ["Resend API", "Email delivery", status.resend]
  ];

  return (
    <div className="content">
      <section className="settings-card">
        <span className="kicker">Live integrations</span>
        <h2>External API status</h2>
        <p className="muted">
          These credentials are read only by the Express backend from <code>backend/.env</code>.
          They are never shipped to the React browser bundle.
        </p>

        <div className="provider-list">
          {providers.map(([name, purpose, ok]) => (
            <div className="provider-row" key={name}>
              <div className="provider-icon"><Zap size={16} /></div>
              <div><strong>{name}</strong><span>{purpose}</span></div>
              <small className={ok ? "connected" : "missing"}>{ok ? "Connected" : "Missing key"}</small>
            </div>
          ))}
        </div>

        <div className="config-note">
          <strong>Setup</strong>
          <p>Copy <code>backend/.env.example</code> to <code>backend/.env</code>, add the three API credentials, restart the backend, and refresh this page.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
