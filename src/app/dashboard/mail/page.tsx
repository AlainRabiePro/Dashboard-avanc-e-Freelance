"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Mail, Search, Star, Trash2, Archive, RefreshCw,
  Inbox, Send, FileText, AlertCircle,
  ChevronLeft, Reply, Forward, Briefcase, X, Check,
  Pencil, ChevronDown,
} from "lucide-react";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  snippet: string;
  date: string;
  timestamp: number;
  unread: boolean;
  starred: boolean;
  important: boolean;
  tags: string[];
  projectId?: string;
  projectName?: string;
  folder: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#1a73e8","#e53935","#43a047","#f57c00","#8e24aa",
  "#00897b","#d81b60","#546e7a","#6d4c41","#0288d1",
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: AVATAR_COLORS[idx],
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: size * 0.38,
        flexShrink: 0, userSelect: "none",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

const PROJECT_STATUS_COLOR: Record<string, string> = {
  "In Progress": "#3b82f6",
  "Planning": "#f59e0b",
  "Completed": "#22c55e",
  "Testing": "#a78bfa",
};

function ProjectBadge({ name, status }: { name: string; status?: string }) {
  const color = status ? (PROJECT_STATUS_COLOR[status] ?? "#6b7280") : "#3b82f6";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `${color}20`, color: color,
      border: `1px solid ${color}40`,
      borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>
      <Briefcase style={{ width: 10, height: 10 }} />
      {name}
    </span>
  );
}

function TagChip({ name }: { name: string }) {
  const CHIP_COLORS: Record<string, [string, string]> = {
    Client:     ["#3b82f620", "#3b82f6"],
    Finance:    ["#f59e0b20", "#f59e0b"],
    Design:     ["#a78bfa20", "#a78bfa"],
    Newsletter: ["#6b728020", "#9ca3af"],
    Urgent:     ["#ef444420", "#ef4444"],
    default:    ["#ffffff10", "#9ca3af"],
  };
  const [bg, text] = CHIP_COLORS[name] ?? CHIP_COLORS.default;
  return (
    <span style={{
      background: bg, color: text,
      border: `1px solid ${text}33`,
      borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 500,
    }}>
      {name}
    </span>
  );
}

// ─── Sidebar Folder Button ─────────────────────────────────────────────────

function SidebarFolder({
  icon, label, count, active, onClick,
}: {
  icon: React.ReactNode; label: string; count?: number;
  active?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "7px 12px", borderRadius: 24,
        background: active ? "#2d60e225" : "transparent",
        color: active ? "#fff" : "#9ca3af",
        border: "none", cursor: "pointer", fontWeight: active ? 600 : 500,
        fontSize: 14, transition: "all 0.15s", gap: 8,
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = "#ffffff0a"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        {label}
      </span>
      {typeof count === "number" && count > 0 && (
        <span style={{
          background: active ? "#2d60e2" : "#374151",
          color: "#fff", borderRadius: 12, padding: "1px 8px",
          fontSize: 12, fontWeight: 700, minWidth: 22, textAlign: "center",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Email Row ────────────────────────────────────────────────────────────────

function EmailRow({
  email, selected, active, onSelect, onClick, onStar, onDelete,
}: {
  email: Email; selected: boolean; active: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
  onStar: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center",
        padding: "0 8px 0 4px", height: 56,
        background: active
          ? "#2d60e215"
          : selected
          ? "#2d60e20a"
          : hovered
          ? "#ffffff06"
          : "transparent",
        borderLeft: `3px solid ${active ? "#2d60e2" : "transparent"}`,
        cursor: "pointer", transition: "background 0.1s",
        borderBottom: "1px solid #1a2030",
        position: "relative",
      }}
    >
      {/* Checkbox */}
      <div
        onClick={onSelect}
        style={{ width: 32, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: 3,
          border: `2px solid ${selected ? "#2d60e2" : "#374151"}`,
          background: selected ? "#2d60e2" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {selected && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
        </div>
      </div>

      {/* Star */}
      <div
        onClick={onStar}
        style={{ width: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Star
          style={{
            width: 15, height: 15,
            color: email.starred ? "#facc15" : hovered ? "#6b7280" : "#2d3748",
            fill: email.starred ? "#facc15" : "none",
            transition: "all 0.15s",
          }}
        />
      </div>

      {/* Avatar */}
      <div style={{ width: 36, flexShrink: 0, marginRight: 10 }}>
        <Avatar name={email.from} size={32} />
      </div>

      {/* Sender */}
      <span style={{
        width: 148, flexShrink: 0,
        fontWeight: email.unread ? 700 : 500,
        color: email.unread ? "#f9fafb" : "#9ca3af",
        fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {email.from}
      </span>

      {/* Subject + snippet */}
      <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
        <span style={{
          fontWeight: email.unread ? 700 : 500,
          color: email.unread ? "#f9fafb" : "#d1d5db",
          fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          maxWidth: 220, flexShrink: 0,
        }}>
          {email.subject}
        </span>
        <span style={{ color: "#4b5563", fontSize: 13, fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          — {email.snippet}
        </span>
      </span>

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 8 }}>
        {email.projectName && <ProjectBadge name={email.projectName} />}
        {email.tags.slice(0, 1).map(t => <TagChip key={t} name={t} />)}
      </div>

      {/* Date / actions */}
      <div style={{ width: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4, marginLeft: 8 }}>
        {hovered ? (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              onClick={onDelete}
              style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4, borderRadius: 4 }}
              title="Supprimer"
              onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
              onMouseOut={e => e.currentTarget.style.color = "#4b5563"}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={e => e.stopPropagation()}
              style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4, borderRadius: 4 }}
              title="Archiver"
              onMouseOver={e => e.currentTarget.style.color = "#9ca3af"}
              onMouseOut={e => e.currentTarget.style.color = "#4b5563"}
            >
              <Archive style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          <span style={{ color: email.unread ? "#f9fafb" : "#4b5563", fontSize: 12, fontWeight: email.unread ? 600 : 400 }}>
            {email.date}
          </span>
        )}
      </div>

      {/* Unread dot */}
      {email.unread && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 22, background: "#2d60e2", borderRadius: "0 2px 2px 0",
        }} />
      )}
    </div>
  );
}

// ─── Email Detail Panel ───────────────────────────────────────────────────────

function EmailDetail({
  email, projects, onClose, onAssign, onDelete, onStar,
}: {
  email: Email; projects: Project[];
  onClose: () => void;
  onAssign: (projectId: string, projectName: string) => void;
  onDelete: () => void;
  onStar: (e: React.MouseEvent) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAssignMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const project = projects.find(p => p.id === email.projectId);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0a0c10", minWidth: 0, overflow: "hidden" }}>
      {/* Detail top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderBottom: "1px solid #1f2937",
        background: "#0f1117", flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", color: "#6b7280", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500,
            padding: "4px 8px", borderRadius: 6, transition: "all 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b7280"; }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
          Retour
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={onStar} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}>
          <Star style={{ width: 16, height: 16, fill: email.starred ? "#facc15" : "none", color: email.starred ? "#facc15" : "#6b7280" }} />
        </button>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 6, borderRadius: 6 }}
          onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
          onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
        >
          <Trash2 style={{ width: 16, height: 16 }} />
        </button>

        {/* Assign to project dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowAssignMenu(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: email.projectId ? "#2d60e220" : "#1f2937",
              color: email.projectId ? "#60a5fa" : "#9ca3af",
              border: `1px solid ${email.projectId ? "#2d60e240" : "#374151"}`,
              borderRadius: 8, padding: "6px 12px", cursor: "pointer",
              fontSize: 13, fontWeight: 500, transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.background = "#2d60e220"; e.currentTarget.style.color = "#60a5fa"; }}
            onMouseOut={e => {
              e.currentTarget.style.background = email.projectId ? "#2d60e220" : "#1f2937";
              e.currentTarget.style.color = email.projectId ? "#60a5fa" : "#9ca3af";
            }}
          >
            <Briefcase style={{ width: 14, height: 14 }} />
            {email.projectName ? `Projet : ${email.projectName}` : "Assigner au projet"}
            <ChevronDown style={{ width: 13, height: 13, opacity: 0.7 }} />
          </button>

          {showAssignMenu && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 999,
              background: "#1a2030", border: "1px solid #374151", borderRadius: 10,
              minWidth: 230, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "10px 14px 6px", fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Assigner à un projet
              </div>
              {projects.length === 0 ? (
                <div style={{ padding: "12px 14px", color: "#4b5563", fontSize: 13 }}>Aucun projet disponible</div>
              ) : (
                projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onAssign(p.id, p.name); setShowAssignMenu(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "9px 14px",
                      background: email.projectId === p.id ? "#2d60e215" : "none",
                      border: "none", color: email.projectId === p.id ? "#60a5fa" : "#e5e7eb",
                      cursor: "pointer", fontSize: 13, fontWeight: 500,
                      transition: "background 0.1s", textAlign: "left",
                    }}
                    onMouseOver={e => { if (email.projectId !== p.id) e.currentTarget.style.background = "#ffffff08"; }}
                    onMouseOut={e => { if (email.projectId !== p.id) e.currentTarget.style.background = "none"; }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: PROJECT_STATUS_COLOR[p.status] ?? "#6b7280", flexShrink: 0,
                    }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{p.client} · {p.status}</div>
                    </div>
                    {email.projectId === p.id && (
                      <Check style={{ width: 14, height: 14, color: "#2d60e2", marginLeft: "auto", flexShrink: 0 }} />
                    )}
                  </button>
                ))
              )}
              {email.projectId && (
                <>
                  <div style={{ height: 1, background: "#1f2937", margin: "4px 0" }} />
                  <button
                    onClick={() => { onAssign("", ""); setShowAssignMenu(false); }}
                    style={{
                      width: "100%", padding: "9px 14px",
                      background: "none", border: "none", color: "#ef4444",
                      cursor: "pointer", fontSize: 13, textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#ef444412"}
                    onMouseOut={e => e.currentTarget.style.background = "none"}
                  >
                    <X style={{ width: 13, height: 13 }} />
                    Retirer l'assignation
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px 40px" }}>
        {/* Subject */}
        <h2 style={{ color: "#f9fafb", fontSize: 22, fontWeight: 700, marginBottom: 18, lineHeight: 1.3 }}>
          {email.subject}
        </h2>

        {/* Project info banner */}
        {email.projectName && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#2d60e210", border: "1px solid #2d60e230",
            borderRadius: 10, padding: "8px 14px", marginBottom: 18, fontSize: 13,
          }}>
            <Briefcase style={{ width: 14, height: 14, color: "#60a5fa" }} />
            <span style={{ color: "#6b7280" }}>Assigné au projet :</span>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>{email.projectName}</span>
            {project && (
              <span style={{
                fontSize: 11,
                background: `${PROJECT_STATUS_COLOR[project.status] ?? "#6b7280"}20`,
                color: PROJECT_STATUS_COLOR[project.status] ?? "#6b7280",
                borderRadius: 6, padding: "2px 7px", fontWeight: 600,
              }}>
                {project.status}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {email.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {email.tags.map(t => <TagChip key={t} name={t} />)}
          </div>
        )}

        {/* Sender card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          marginBottom: 24, padding: "14px 18px",
          background: "#111827", borderRadius: 12, border: "1px solid #1f2937",
        }}>
          <Avatar name={email.from} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#f9fafb", fontSize: 14 }}>{email.from}</div>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              <span style={{ color: "#4b5563" }}>De :</span> {email.fromEmail}
            </div>
          </div>
          <div style={{ color: "#4b5563", fontSize: 12, flexShrink: 0 }}>{email.date}</div>
        </div>

        {/* Body */}
        <div style={{
          color: "#d1d5db", fontSize: 14, lineHeight: 1.8,
          whiteSpace: "pre-wrap",
        }}>
          {email.body}
        </div>
      </div>

      {/* Reply bar */}
      <div style={{
        borderTop: "1px solid #1f2937", padding: "12px 24px",
        display: "flex", gap: 8, background: "#0f1117", flexShrink: 0,
      }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#1f2937", border: "1px solid #374151", color: "#d1d5db",
          borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 500,
          transition: "all 0.15s",
        }}
          onMouseOver={e => e.currentTarget.style.background = "#374151"}
          onMouseOut={e => e.currentTarget.style.background = "#1f2937"}
        >
          <Reply style={{ width: 14, height: 14 }} />
          Répondre
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "1px solid #1f2937", color: "#6b7280",
          borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13,
          transition: "all 0.15s",
        }}
          onMouseOver={e => { e.currentTarget.style.background = "#1f2937"; e.currentTarget.style.color = "#d1d5db"; }}
          onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b7280"; }}
        >
          <Forward style={{ width: 14, height: 14 }} />
          Transférer
        </button>
      </div>
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EMAILS: Email[] = [
  {
    id: "1", from: "Alice Dupont", fromEmail: "alice@agence.fr",
    subject: "Proposition de collaboration – Refonte site web",
    body: "Bonjour,\n\nJe vous contacte suite à votre profil sur LinkedIn. Nous cherchons un développeur freelance pour la refonte complète de notre site corporate.\n\nLe projet comprend :\n• Design & intégration (10 pages)\n• Optimisation SEO\n• Formulaires de contact\n• Espace administration\n\nBudget prévu : 4 500€\nDélai : 6 semaines\n\nPouvez-vous me faire parvenir votre disponibilité ainsi qu'un devis estimatif ?\n\nCordialement,\nAlice Dupont\nDirectrice Marketing – AgencePro",
    snippet: "Je vous contacte suite à votre profil LinkedIn...",
    date: "10:32", timestamp: Date.now(), unread: true, starred: true,
    important: true, tags: ["Client"], folder: "inbox",
  },
  {
    id: "2", from: "Marc Leblanc", fromEmail: "marc@comptabilite.fr",
    subject: "Facture #2024-089 – Relance paiement",
    body: "Bonjour,\n\nNous vous informons que votre facture #2024-089 d'un montant de 1 200€ est toujours en attente de paiement.\n\nDate d'échéance dépassée : 15 janvier 2025\n\nMerci de régulariser cette situation dans les meilleurs délais.\n\nCordialement,\nMarc Leblanc\nService Comptabilité",
    snippet: "Votre facture #2024-089 est toujours en attente de paiement...",
    date: "09:15", timestamp: Date.now() - 3600000, unread: true, starred: false,
    important: false, tags: ["Finance"], folder: "inbox",
  },
  {
    id: "3", from: "Sophie Martin", fromEmail: "sophie@startup.io",
    subject: "Retour sur la maquette v2",
    body: "Salut !\n\nJ'ai passé du temps sur la maquette v2 que tu m'as envoyée hier. Dans l'ensemble c'est vraiment top 🎉\n\nQuelques retours :\n• Section hero : parfait, j'adore le gradient\n• La typographie pourrait être un cran plus grande sur mobile\n• Le CTA en dessous du formulaire manque de contraste\n• Pour la section « témoignages », tu peux intégrer les vrais logos\n\nSinon, on est bien dans le timing. Go pour la v3 !\n\nSophie",
    snippet: "Dans l'ensemble c'est vraiment top ! Quelques retours sur la typo...",
    date: "Hier", timestamp: Date.now() - 86400000, unread: false, starred: true,
    important: false, tags: ["Design"], folder: "inbox",
  },
  {
    id: "4", from: "Thomas Bernard", fromEmail: "thomas@nexlance.com",
    subject: "Planning sprint – Semaine du 3 mars",
    body: "Bonjour à tous,\n\nVoici le planning du prochain sprint :\n\n🗓 Lundi 3 : Kick-off, définition des tâches\n🗓 Mardi 4 : Dev front (dashboard)\n🗓 Mercredi 5 : Dev back (API)\n🗓 Jeudi 6 : Tests & intégration\n🗓 Vendredi 7 : Review & démo client\n\nMerci de me confirmer vos disponibilités d'ici ce soir.\n\nThomas",
    snippet: "Voici le planning pour le sprint de la semaine du 3 mars...",
    date: "Hier", timestamp: Date.now() - 90000000, unread: false, starred: false,
    important: false, tags: [], folder: "inbox",
  },
  {
    id: "5", from: "Newsletter Dev.to", fromEmail: "newsletter@dev.to",
    subject: "Top 10 des articles React cette semaine",
    body: "Voici les articles les plus lus cette semaine sur Dev.to :\n\n1. React Server Components expliqués simplement\n2. 5 patterns à connaître en 2025\n3. Zustand vs Redux : comparaison complète\n4. Tailwind CSS v4 : ce qui change\n5. Optimisation des performances Next.js\n\nBonne lecture !",
    snippet: "Top 10 React, patterns 2025, Zustand vs Redux...",
    date: "Lun", timestamp: Date.now() - 172800000, unread: false, starred: false,
    important: false, tags: ["Newsletter"], folder: "inbox",
  },
  {
    id: "6", from: "Julien Roux", fromEmail: "julien@clientcorp.com",
    subject: "Validation du devis – Projet Dashboard",
    body: "Bonjour,\n\nSuite à notre échange téléphonique de vendredi, je valide officiellement le devis n°2025-012 pour un montant de 3 200€.\n\nPouvez-vous me faire parvenir le contrat à signer ?\n\nMerci,\nJulien Roux\nCEO – ClientCorp",
    snippet: "Je valide officiellement le devis n°2025-012 pour 3 200€...",
    date: "28 fév", timestamp: Date.now() - 259200000, unread: false, starred: true,
    important: true, tags: ["Client", "Finance"], folder: "inbox",
  },
  {
    id: "s1", from: "Moi", fromEmail: "moi@freelance.com",
    subject: "Devis n°2025-012 – Développement Dashboard",
    body: "Bonjour Julien,\n\nVeuillez trouver ci-joint le devis n°2025-012 pour la réalisation de votre tableau de bord.\n\nTotal HT : 3 200€\nDélai estimé : 4 semaines\n\nDans l'attente de votre retour,\nCordialement",
    snippet: "Veuillez trouver ci-joint le devis n°2025-012...",
    date: "27 fév", timestamp: Date.now() - 345600000, unread: false, starred: false,
    important: false, tags: [], folder: "sent",
  },
];

const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Nexlance", client: "Nexlance Corp", status: "In Progress" },
  { id: "p2", name: "E-commerce BoutiqueXYZ", client: "BoutiqueXYZ", status: "Planning" },
  { id: "p3", name: "Dashboard ClientCorp", client: "ClientCorp", status: "In Progress" },
  { id: "p4", name: "Landing Page StartupABC", client: "StartupABC", status: "Completed" },
];

const FOLDERS = [
  { id: "inbox", label: "Boîte de réception", icon: <Inbox style={{ width: 16, height: 16 }} /> },
  { id: "starred", label: "Favoris", icon: <Star style={{ width: 16, height: 16 }} /> },
  { id: "sent", label: "Envoyés", icon: <Send style={{ width: 16, height: 16 }} /> },
  { id: "drafts", label: "Brouillons", icon: <FileText style={{ width: 16, height: 16 }} /> },
  { id: "spam", label: "Spam", icon: <AlertCircle style={{ width: 16, height: 16 }} /> },
  { id: "trash", label: "Corbeille", icon: <Trash2 style={{ width: 16, height: 16 }} /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MailPage() {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    // Load projects from Firestore
    try {
      const { firestore, auth } = initializeFirebase();
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(firestore, "projects"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
        }
      }
    } catch (_) { /* keep mock */ }

    // Load emails from API
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        const raw: Email[] = data.emails || data;
        if (raw.length > 0) {
          setEmails(raw.map(e => ({ ...e, folder: e.folder || "inbox" })));
        }
      }
    } catch (_) { /* keep mock */ }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 800);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      if (activeFolder === "starred") return e.starred;
      const folderMatch = e.folder === activeFolder;
      const searchMatch =
        !search ||
        e.from.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase()) ||
        e.snippet.toLowerCase().includes(search.toLowerCase());
      return folderMatch && searchMatch;
    });
  }, [emails, activeFolder, search]);

  const folderCounts: Record<string, number> = {
    inbox: emails.filter(e => e.folder === "inbox" && e.unread).length,
    starred: emails.filter(e => e.starred).length,
    sent: emails.filter(e => e.folder === "sent").length,
    drafts: emails.filter(e => e.folder === "drafts").length,
    spam: emails.filter(e => e.folder === "spam").length,
    trash: emails.filter(e => e.folder === "trash").length,
  };

  const assignedByProject = useMemo(() => {
    const map: Record<string, number> = {};
    emails.forEach(e => {
      if (e.projectId && e.projectName) {
        map[e.projectName] = (map[e.projectName] ?? 0) + 1;
      }
    });
    return map;
  }, [emails]);

  const toggleStar = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    setEmails(prev => prev.map(em => em.id === emailId ? { ...em, starred: !em.starred } : em));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const toggleSelect = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(emailId) ? prev.filter(id => id !== emailId) : [...prev, emailId]
    );
  };

  const openEmail = (email: Email) => {
    setSelectedEmail(email);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, unread: false } : e));
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: "trash" } : e));
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  const assignToProject = async (projectId: string, projectName: string) => {
    if (!selectedEmail) return;
    const updated = { ...selectedEmail, projectId: projectId || undefined, projectName: projectName || undefined };
    setEmails(prev => prev.map(e => e.id === selectedEmail.id ? updated : e));
    setSelectedEmail(updated);

    if (projectId) {
      setAssignSuccess(`Email assigné au projet "${projectName}"`);
      setTimeout(() => setAssignSuccess(null), 3000);
      try {
        const { firestore, auth } = initializeFirebase();
        const user = auth.currentUser;
        await addDoc(collection(firestore, "emailAssignments"), {
          emailId: selectedEmail.id,
          emailSubject: selectedEmail.subject,
          emailFrom: selectedEmail.from,
          projectId,
          projectName,
          userId: user?.uid ?? "anonymous",
          assignedAt: new Date(),
        });
      } catch (_) { /* silent */ }
    }
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.length === filteredEmails.length && filteredEmails.length > 0
        ? []
        : filteredEmails.map(e => e.id)
    );
  };

  const bulkAssign = (projectId: string, projectName: string) => {
    if (!projectId) return;
    setEmails(prev =>
      prev.map(e => selectedIds.includes(e.id) ? { ...e, projectId, projectName } : e)
    );
    setAssignSuccess(`${selectedIds.length} email(s) assigné(s) à "${projectName}"`);
    setTimeout(() => setAssignSuccess(null), 3000);
    setSelectedIds([]);
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#070a0f",
      overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* ── Left Sidebar ───────────────────────────────────────────────── */}
      <aside style={{
        width: 245, flexShrink: 0, background: "#0d1117",
        borderRight: "1px solid #1a2030",
        display: "flex", flexDirection: "column",
        height: "100vh", overflowY: "auto", overflowX: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1a2030" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #2d60e2, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(45,96,226,0.35)",
            }}>
              <Mail style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <span style={{ color: "#f9fafb", fontWeight: 700, fontSize: 15 }}>Messages</span>
          </div>

          <button style={{
            width: "100%", padding: "10px 16px",
            background: "linear-gradient(135deg, #2d60e2, #1e40af)",
            color: "#fff", border: "none", borderRadius: 10, fontWeight: 600,
            fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(45,96,226,0.3)",
            transition: "opacity 0.15s",
          }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            <Pencil style={{ width: 13, height: 13 }} />
            Composer
          </button>
        </div>

        {/* Folders */}
        <div style={{ padding: "10px 8px" }}>
          {FOLDERS.map(f => (
            <SidebarFolder
              key={f.id}
              icon={f.icon}
              label={f.label}
              count={folderCounts[f.id]}
              active={activeFolder === f.id}
              onClick={() => { setActiveFolder(f.id); setSelectedEmail(null); }}
            />
          ))}
        </div>

        {/* Projects with assigned emails */}
        {Object.keys(assignedByProject).length > 0 && (
          <div style={{ padding: "4px 8px 16px", borderTop: "1px solid #1a2030", marginTop: 6 }}>
            <div style={{ padding: "10px 12px 6px", fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Emails → Projets
            </div>
            {Object.entries(assignedByProject).map(([name, count]) => (
              <div key={name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 12px", borderRadius: 8, color: "#6b7280", fontSize: 13,
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Briefcase style={{ width: 13, height: 13, color: "#2d60e2" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{name}</span>
                </span>
                <span style={{
                  background: "#1a2030", color: "#4b5563",
                  borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 600,
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Search bar */}
        <div style={{
          padding: "10px 16px", background: "#0d1117",
          borderBottom: "1px solid #1a2030", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 560 }}>
            <Search style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              width: 15, height: 15, color: "#374151", pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                background: "#111827", border: "1px solid #1f2937",
                borderRadius: 10, color: "#e5e7eb", fontSize: 14,
                outline: "none", transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#2d60e2"}
              onBlur={e => e.currentTarget.style.borderColor = "#1f2937"}
            />
          </div>
          <button
            onClick={handleRefresh}
            title="Actualiser"
            style={{
              background: "none", border: "1px solid #1f2937", color: "#374151",
              borderRadius: 8, padding: "8px 10px", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#9ca3af"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#1f2937"; e.currentTarget.style.color = "#374151"; }}
          >
            <RefreshCw style={{ width: 15, height: 15, animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          </button>
        </div>

        {/* Content: list + detail */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

          {/* ── Email list panel ── */}
          <div style={{
            width: selectedEmail ? 420 : "100%",
            flexShrink: 0,
            display: "flex", flexDirection: "column",
            borderRight: selectedEmail ? "1px solid #1a2030" : "none",
            overflow: "hidden", transition: "width 0.2s ease",
          }}>
            {/* List toolbar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderBottom: "1px solid #1a2030",
              background: "#0d1117", flexShrink: 0, minHeight: 44,
            }}>
              <div
                onClick={selectAll}
                title="Tout sélectionner"
                style={{
                  width: 16, height: 16, borderRadius: 3,
                  border: `2px solid ${selectedIds.length > 0 ? "#2d60e2" : "#1f2937"}`,
                  background: selectedIds.length > 0 && selectedIds.length === filteredEmails.length
                    ? "#2d60e2" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                }}
              >
                {selectedIds.length > 0 && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
              </div>

              <span style={{ color: "#374151", fontSize: 12, flex: 1, fontWeight: 500 }}>
                {selectedIds.length > 0
                  ? `${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`
                  : `${filteredEmails.length} message${filteredEmails.length !== 1 ? "s" : ""}`}
              </span>

              {selectedIds.length > 0 && (
                <select
                  onChange={e => {
                    const val = e.target.value;
                    if (!val) return;
                    const [id, name] = val.split("|||");
                    bulkAssign(id, name);
                    e.target.value = "";
                  }}
                  defaultValue=""
                  style={{
                    background: "#111827", color: "#9ca3af",
                    border: "1px solid #1f2937", borderRadius: 8,
                    padding: "4px 10px", fontSize: 12, cursor: "pointer",
                  }}
                >
                  <option value="" disabled>Assigner au projet…</option>
                  {projects.map(p => (
                    <option key={p.id} value={`${p.id}|||${p.name}`}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Rows */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredEmails.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", height: "100%", color: "#1f2937", gap: 14,
                  padding: 40,
                }}>
                  <Mail style={{ width: 52, height: 52 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>Aucun message</div>
                  <div style={{ fontSize: 13, color: "#1f2937", textAlign: "center" }}>
                    {search ? "Aucun résultat pour votre recherche" : "Ce dossier est vide"}
                  </div>
                </div>
              ) : (
                filteredEmails.map(email => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    selected={selectedIds.includes(email.id)}
                    active={selectedEmail?.id === email.id}
                    onSelect={e => toggleSelect(e, email.id)}
                    onClick={() => openEmail(email)}
                    onStar={e => toggleStar(e, email.id)}
                    onDelete={e => { e.stopPropagation(); deleteEmail(email.id); }}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Email detail panel ── */}
          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              projects={projects}
              onClose={() => setSelectedEmail(null)}
              onAssign={assignToProject}
              onDelete={() => deleteEmail(selectedEmail.id)}
              onStar={e => toggleStar(e, selectedEmail.id)}
            />
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {assignSuccess && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#111827", border: "1px solid #1f2937", color: "#f9fafb",
          borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)", zIndex: 9999,
          animation: "fadeInUp 0.2s ease",
        }}>
          <Check style={{ width: 16, height: 16, color: "#22c55e" }} />
          {assignSuccess}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}</style>
    </div>
  );
}
