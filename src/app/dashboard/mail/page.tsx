"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Send, Trash2, Archive, Star, StarOff, Tag, Plus, X } from "lucide-react";
import { initializeFirebase } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  starred: boolean;
  important: boolean;
  tags: string[];
}

// Composant Tag (style Apple)
function EmailTag({ name, color }: { name: string; color?: string }) {
  const colors = {
    Shopping: '#ff6b6b',
    Promo: '#4ecdc4',
    Urgent: '#ffe66d',
    Vêtements: '#95e1d3',
    Important: '#ffaa00',
    default: '#6c757d'
  };

  return (
    <span style={{
      background: colors[name as keyof typeof colors] || colors.default,
      color: '#000',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: 12,
      fontWeight: 600,
      marginRight: 4,
      marginBottom: 2,
      whiteSpace: 'nowrap'
    }}>
      {name}
    </span>
  );
}

// Sidebar avec section Tags
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

function TagsSection({ selectedTag, onTagSelect }: { selectedTag: string | null, onTagSelect: (tag: string | null) => void }) {
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = async () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
      try {
        const { firestore } = initializeFirebase();
        await addDoc(collection(firestore, "tags"), { name: tag });
      } catch (e) {
        console.error("Erreur lors de l'ajout du tag dans Firestore", e);
      }
    }
  };

  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #23232B" }}>
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 8, fontWeight: 500 }}>TAGS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <SidebarItem 
          icon={<Tag style={{ width: 16, height: 16 }} />} 
          label="Tous les tags" 
          active={!selectedTag}
        />
        {tags.map(tag => (
          <div
            key={tag}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              color: selectedTag === tag ? '#fff' : '#ccc',
              background: selectedTag === tag ? '#2d60e2' : 'none',
              fontWeight: 500,
              fontSize: 14
            }}
            onClick={() => onTagSelect(tag)}
          >
            {tag}
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Nouveau tag"
            style={{
              background: "#23232B",
              border: "none",
              outline: "none",
              borderRadius: 6,
              color: "#fff",
              fontSize: 14,
              padding: "6px 12px",
              fontWeight: 500,
              width: 120
            }}
            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            style={{
              background: newTag.trim() ? "#2d60e2" : "#444",
              color: "#fff",
              borderRadius: 6,
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              padding: "6px 12px",
              cursor: newTag.trim() ? "pointer" : "default"
            }}
          >Créer</button>
        </div>
      </div>
    </div>
  );
}

function AssignmentMenubar({
  search, setSearch,
  selectedEmails,
  onAssign,
  availableTags,
  onAddTag
}: {
  search: string,
  setSearch: (v: string) => void,
  selectedEmails: string[],
  onAssign?: (project: string, recipient: string) => void,
  availableTags: string[],
  onAddTag: (tag: string) => void
}) {
  const [project, setProject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [newTag, setNewTag] = useState('');
  const projects = ["Nexlance", "E-commerce", "Landing Page", "Dashboard", "Autre projet"];

  const handleAddTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "#222",
      borderBottom: "1px solid #19191b",
      padding: "11px 24px",
      gap: 10
    }}>
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
            width: 280,
            boxShadow: "none"
          }}
        />
        <Search style={{
          position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
          width: 18, height: 18, color: "#57586e"
        }} />
      </div>

      {selectedEmails.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#aaa", fontWeight: 500 }}>Ajouter tag:</span>
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Nouveau tag"
            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
            style={{
              background: "#23232B",
              border: "none",
              outline: "none",
              borderRadius: 6,
              color: "#fff",
              fontSize: 14,
              padding: "6px 12px",
              width: 120,
              fontWeight: 500
            }}
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            style={{
              background: newTag.trim() ? "#2d60e2" : "#444",
              color: "#fff",
              borderRadius: 6,
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              padding: "6px 12px",
              cursor: newTag.trim() ? "pointer" : "default"
            }}
          >
            +
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <span style={{ color: "#aaa", fontWeight: 500, marginRight: 5 }}>Assigner :</span>
        <select
          value={project}
          onChange={e => setProject(e.target.value)}
          style={{
            background: "#26262c", color: "#fff", padding: "6px 8px", borderRadius: 6, border: "none", fontWeight: 500
          }}
        >
          <option value="">Projet</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="text"
          placeholder="Destinataire"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          style={{
            background: "#23232B",
            border: "none",
            outline: "none",
            borderRadius: 6,
            color: "#fff",
            fontSize: 14,
            padding: "6px 12px",
            fontWeight: 500,
            width: 140
          }}
        />
        <button onClick={() => { if (project && recipient) onAssign?.(project, recipient); }} style={{
          background: "#2d60e2", color: "#fff", borderRadius: 7, border: "none", fontWeight: 700,
          fontSize: 13, padding: "6px 16px", cursor: "pointer"
        }}>
          Assigner
        </button>
      </div>
    </div>
  );
}

export default function MailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>(["Shopping", "Promo", "Urgent", "Vêtements"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ REMPLACE LES DONNÉES MOCK PAR UN FETCH VERS TON BACKEND
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Remplace par ton endpoint backend (PocketBase, Supabase, etc.)
      const response = await fetch('/api/emails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Ajoute ton token d'auth si nécessaire
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      setEmails(data.emails || data);
      
    } catch (err: any) {
      console.error('Erreur fetch emails:', err);
      setError(err.message);
      
      // Fallback avec mock data en cas d'erreur
      setEmails([
        {
          id: "1",
          from: "🚀 Système",
          subject: "Configuration emails requise",
          snippet: `Activez votre backend API pour voir les vrais emails. Erreur: ${err.message}`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          starred: false,
          important: false,
          tags: ["Configuration"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  function toggleSelect(id: string) {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  }

  const handleAddTag = (tag: string) => {
    setAvailableTags(prev => [...prev, tag]);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.from.toLowerCase().includes(search.toLowerCase()) ||
      email.snippet.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = !selectedTag || email.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#09090b", 
        alignItems: "center", 
        justifyContent: "center",
        color: "#888",
        fontSize: 16
      }}>
        ⏳ Chargement des emails...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      {/* Sidebar améliorée avec tags */}
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
          }}>
            ▲ Alicia Koch
          </button>
        </div>
        
        <div style={{ padding: "8px 16px 8px 16px", borderBottom: "1px solid #23232B" }}>
          <SidebarItem icon={<Mail style={{ width: 18, height: 18 }} />} label="Inbox" count={filteredEmails.length} active />
          <SidebarItem icon={<Send style={{ width: 18, height: 18 }} />} label="Sent" />
          <SidebarItem icon={<Trash2 style={{ width: 18, height: 18 }} />} label="Trash" />
          <SidebarItem icon={<Archive style={{ width: 18, height: 18 }} />} label="Archive" />
        </div>

        <TagsSection selectedTag={selectedTag} onTagSelect={setSelectedTag} />

        <div style={{ flex: 1 }} />
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1, background: "#181818", minHeight: '100vh', overflow: 'auto',
        display: "flex", flexDirection: "column"
      }}>
        {/* Header controls */}
        <div style={{
          padding: "0 24px", height: 54, borderBottom: "1px solid #222",
          display: "flex", alignItems: "center", background: "#222"
        }}>
          <input type="checkbox" style={{ accentColor: "#666", width: 17, height: 17 }} />
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 16, fontSize: 18, cursor: "pointer" }}>⭳</button>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>⭱</button>
          <span style={{ marginLeft: "auto", color: "#999", fontSize: 14 }}>
            {selected.length ? `${selected.length} sélectionné(s)` : `1-${filteredEmails.length} sur ${emails.length}`}
          </span>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>‹</button>
          <button style={{ background: "none", border: "none", color: "#888", marginLeft: 8, fontSize: 18, cursor: "pointer" }}>›</button>
        </div>

        <AssignmentMenubar 
          search={search} 
          setSearch={setSearch}
          selectedEmails={selected}
          availableTags={availableTags}
          onAddTag={handleAddTag}
        />

        {/* ✅ ÉTAT D'ERREUR */}
        {error && (
          <div style={{ padding: '20px 24px', background: '#ff4444', color: 'white', borderBottom: '1px solid #ff6666' }}>
            ❌ Erreur: {error}
            <button 
              onClick={fetchEmails} 
              style={{ 
                marginLeft: 16, 
                background: '#2d60e2', 
                color: 'white', 
                border: 'none', 
                padding: '4px 12px', 
                borderRadius: 4, 
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              🔄 Réessayer
            </button>
          </div>
        )}

        {/* Liste des emails */}
        <div style={{ width: "100%", flex: 1 }}>
          {filteredEmails.length === 0 ? (
            <div style={{ padding: '40px 24px', color: '#888', textAlign: 'center' }}>
              📭 Aucun email trouvé
              <br />
              <small>Essayez de modifier votre recherche ou ajoutez des tags</small>
            </div>
          ) : (
            filteredEmails.map(mail => (
              <div
                key={mail.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "12px 24px",
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
                  style={{ accentColor: "#666", width: 17, height: 17, marginTop: 2 }}
                  onClick={e => e.stopPropagation()}
                />
                
                <span style={{ marginLeft: 12, marginRight: 6, marginTop: 2 }}>
                  {mail.starred
                    ? <Star style={{ width: 18, height: 18, color: "#facc15", fill: "#facc15" }} />
                    : <StarOff style={{ width: 18, height: 18, color: "#666" }} />
                  }
                </span>

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

                <span style={{
                  flex: "1 1 0",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  overflow: "hidden"
                }}>
                  <span style={{
                    fontWeight: mail.unread ? 700 : 500,
                    color: mail.unread ? "#fff" : "#eee",
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 400
                  }}>
                    {mail.subject}
                  </span>
                  <span style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 400
                  }}>
                    {mail.snippet}
                  </span>
                  {mail.tags.length > 0 && (
                    <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {mail.tags.slice(0, 3).map(tag => (
                        <EmailTag key={tag} name={tag} />
                      ))}
                      {mail.tags.length > 3 && (
                        <span style={{ color: "#666", fontSize: 12 }}>+{mail.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </span>

                <span style={{
                  color: "#aaa",
                  fontWeight: mail.unread ? 700 : 400,
                  minWidth: 70,
                  marginLeft: 14,
                  textAlign: "right",
                  fontSize: 15
                }}>{mail.date}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
