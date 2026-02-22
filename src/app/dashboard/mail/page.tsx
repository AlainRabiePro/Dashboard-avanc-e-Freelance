"use client";

import { useState } from "react";
import { Mail, Search, Send, Trash2, Archive, Star, StarOff } from "lucide-react";

// Mock emails (garde ton tableau actuel pour la démo)
const emails = [
  {
    id: "1",
    from: "AliExpress",
    subject: "À ajouter à vos achats",
    snippet: "Nos selections pour vous",
    date: "05:19",
    unread: true,
    starred: false,
    important: false,
  },
  {
    id: "2",
    from: "AliExpress",
    subject: "Liquidation : jusqu'à 60% de réduction",
    snippet: "Sélectionné pour vous : Bouton rotatif nouvelles chaussures de sécurité...",
    date: "05:19",
    unread: false,
    starred: true,
    important: true,
  },
  // ... Autres emails ...
];

function SidebarItem({ icon, label, count, active }: { icon: React.ReactNode, label: string, count?: number, active?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: active ? '#222' : 'none', borderRadius: 6,
      padding: '6px 10px', fontWeight: active ? 700 : 500,
      color: active ? '#fff' : '#ccc', marginBottom: 2, cursor: 'pointer'
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        {label}
      </span>
      {typeof count === 'number' &&
        <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{count}</span>
      }
    </div>
  );
}

// Menubar inversée : recherche à gauche, assign à droite, recherche élargie
function AssignmentMenubar({
  search, setSearch,
  onAssign
}: {
  search: string,
  setSearch: (v: string) => void,
  onAssign?: (project: string, recipient: string) => void
}) {
  const [project, setProject] = useState('');
  const [recipient, setRecipient] = useState('');
  const projects = ["Nexlance", "E-commerce", "Landing Page", "Dashboard", "Autre projet"];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "#222",
      borderBottom: "1px solid #19191b",
      padding: "11px 24px",
      gap: 10
    }}>
      {/* Recherche à gauche (allongée ici) */}
      <div style={{ position: "relative", marginRight: 20 }}>
        <input
          type="text"
          placeholder="Search mail"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: "#191926",
            border: "none",
            outline: "none",
            borderRadius: 8,
            color: "#c3c8d4",
            fontSize: 16,
            padding: "7px 10px 7px 34px",
            fontWeight: 500,
            width: 330, // <<--- largeur allongée
            boxShadow: "none"
          }}
        />
        <Search style={{
          position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
          width: 18, height: 18, color: "#57586e"
        }} />
      </div>
      {/* Les boutons à droite */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <span style={{ color: "#aaa", fontWeight: 500, marginRight: 5 }}>Assigner à un projet :</span>
        <select
          value={project}
          onChange={e => setProject(e.target.value)}
          style={{
            background: "#26262c", color: "#fff", padding: "6px 12px", borderRadius: 6, border: "none", fontWeight: 500
          }}
        >
          <option value="">Sélectionner un projet</option>
          {projects.map(p =>
            <option key={p} value={p}>{p}</option>
          )}
        </select>
        <input
          type="text"
          placeholder="Destinataire (mail ou nom)"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          style={{
            background: "#23232B",
            border: "none",
            outline: "none",
            borderRadius: 6,
            color: "#fff",
            fontSize: 16,
            padding: "7px 15px",
            fontWeight: 500,
            width: 210
          }}
        />
        <button
          onClick={() => {
            if (project && recipient) {
              onAssign && onAssign(project, recipient);
              alert(`Assigné à ${recipient} sur ${project}`);
            }
          }}
          style={{
            background: "#2d60e2",
            color: "#fff",
            borderRadius: 7,
            border: "none",
            fontWeight: 700,
            fontSize: 15,
            padding: "8px 23px",
            cursor: "pointer",
            letterSpacing: 0.1
          }}
        >
          Assigner
        </button>
      </div>
    </div>
  );
}

export default function MailPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: "#18181b", color: "#fff", padding: "0 0 0 0",
        borderRight: "1px solid #23232B", display: "flex", flexDirection: "column", minHeight: "100vh"
      }}>
        <div style={{
          marginBottom: 18, padding: 16, borderBottom: '1px solid #23232B',
          fontWeight: 700, fontSize: 18
        }}>
          <button style={{
            width: "100%", background: "#23232B", color: "#fff", border: "none",
            borderRadius: 6, padding: 9, fontWeight: 600, textAlign: "left"
          }}>▲ Alicia Koch</button>
        </div>
        <div style={{ padding: "8px 16px 8px 16px", borderBottom: "1px solid #23232B" }}>
          <SidebarItem icon={<Mail style={{ width: 18, height: 18 }} />} label="Inbox" count={128} active />
          <SidebarItem icon={<Send style={{ width: 18, height: 18 }} />} label="Sent" />
          <SidebarItem icon={<Trash2 style={{ width: 18, height: 18 }} />} label="Trash" />
          <SidebarItem icon={<Archive style={{ width: 18, height: 18 }} />} label="Archive" />
        </div>
        <div style={{ flex: 1 }} />
      </aside>

      {/* Main */}
      <main style={{
        flex: 1, background: "#181818", minHeight: '100vh', overflow: 'auto',
        display: "flex", flexDirection: "column"
      }}>
        {/* Header & controls */}
        <div style={{
          padding: "0 24px", height: 54, borderBottom: "1px solid #222",
          display: "flex", alignItems: "center", background: "#222"
        }}>
          <input type="checkbox" style={{ accentColor: "#666", width: 17, height: 17 }} />
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 16, fontSize: 18, cursor: "pointer" }}>⭳</button>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>⭱</button>
          <span style={{ marginLeft: "auto", color: "#999", fontSize: 14 }}>1-{emails.length} sur {emails.length} </span>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>‹</button>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>›</button>
        </div>

        {/* ---- MENUBAR inversée avec recherche allongée ---- */}
        <AssignmentMenubar search={search} setSearch={setSearch} />

        {/* Table des mails */}
        <div style={{ width: "100%", flex:1 }}>
          {(emails
            .filter(email => (
              email.subject.toLowerCase().includes(search.toLowerCase()) ||
              email.from.toLowerCase().includes(search.toLowerCase()) ||
              email.snippet.toLowerCase().includes(search.toLowerCase())
            ))
          ).map(mail => (
            <div
              key={mail.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: 49,
                borderBottom: "1px solid #232323",
                background: selected.includes(mail.id) ? "#23242a" : "none",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#242427")}
              onMouseOut={e => (e.currentTarget.style.background = selected.includes(mail.id) ? "#23242a" : "none")}
              onClick={() => toggleSelect(mail.id)}
            >
              <input
                type="checkbox"
                checked={selected.includes(mail.id)}
                onChange={e => { e.stopPropagation(); toggleSelect(mail.id); }}
                style={{ accentColor: "#666", width: 17, height: 17 }}
                onClick={e => e.stopPropagation()}
              />
              {/* Star */}
              <span style={{ marginLeft: 12, marginRight: 6 }}>
                {mail.starred
                  ? <Star style={{ width: 18, height: 18, color: "#facc15", fill: "#facc15" }} />
                  : <StarOff style={{ width: 18, height: 18, color: "#666" }} />
                }
              </span>
              {/* Expéditeur */}
              <span style={{
                fontWeight: mail.unread ? 700 : 500,
                color: mail.unread ? "#fff" : "#ccc",
                marginRight: 14,
                minWidth: 128,
                flex: "0 0 180px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>{mail.from}</span>
              {/* Sujet + Extrait */}
              <span style={{
                flex: "1 1 0",
                display: "flex",
                alignItems: "center",
                minWidth: 0,
                overflow: "hidden"
              }}>
                {/* Sujet */}
                <span style={{
                  fontWeight: mail.unread ? 700 : 500,
                  color: mail.unread ? "#fff" : "#eee",
                  marginRight: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 270
                }}>
                  {mail.subject}
                </span>
                {/* Snippet */}
                <span style={{
                  color: "#888",
                  fontWeight: 400,
                  marginLeft: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: 15,
                  maxWidth: 285
                }}>
                  &nbsp;- {mail.snippet}
                </span>
              </span>
              {/* Date */}
              <span style={{
                color: "#aaa",
                fontWeight: mail.unread ? 700 : 400,
                minWidth: 70,
                marginLeft: 14,
                textAlign: "right",
                fontSize: 15
              }}>{mail.date}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}