"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Search, Send, Trash2, X, Plus, MoreVertical, Star, Archive, AlertCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-context";
import { Badge } from "@/components/ui/badge";

interface EmailTag {
  id: string;
  name: string;
  color: string;
}

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
  tags: string[];
  body: string;
}

const defaultTags: EmailTag[] = [
  { id: "client", name: "Client", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { id: "urgent", name: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { id: "meeting", name: "Meeting", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { id: "invoice", name: "Invoice", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { id: "finance", name: "Finance", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { id: "project", name: "Project", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  { id: "follow-up", name: "Follow-up", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
];

const mockEmails: Email[] = [
  {
    id: "1",
    from: "Sarah Johnson",
    fromEmail: "client@example.com",
    subject: "Project Update - Q1 Review",
    preview: "Hi, I wanted to check in on the progress of the Q1 project...",
    date: "Today",
    read: false,
    starred: true,
    tags: ["client", "urgent"],
    body: "Hi, I wanted to check in on the progress of the Q1 project. Could you send me an update on the current status? I'm particularly interested in the timeline and any blockers we might be facing.",
  },
  {
    id: "2",
    from: "Team",
    fromEmail: "team@company.com",
    subject: "Team Meeting - Monday 10am",
    preview: "Reminder: Our weekly team meeting is scheduled for Monday at 10am...",
    date: "Yesterday",
    read: true,
    starred: false,
    tags: ["meeting"],
    body: "Reminder: Our weekly team meeting is scheduled for Monday at 10am in the conference room. Please come prepared with your weekly updates.",
  },
  {
    id: "3",
    from: "Invoice System",
    fromEmail: "invoice@system.com",
    subject: "Invoice Reminder - Invoice #2024-001",
    preview: "This is a reminder that invoice #2024-001 is due for payment...",
    date: "2 days ago",
    read: true,
    starred: false,
    tags: ["invoice", "finance"],
    body: "This is a reminder that invoice #2024-001 is due for payment. Please process this payment at your earliest convenience.",
  },
];

const colorOptions = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
];

export default function MailPage() {
  const [tagToDelete, setTagToDelete] = useState<EmailTag | null>(null);
  const { t } = useLanguage();
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [tags, setTags] = useState<EmailTag[]>(defaultTags);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(colorOptions[0]);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => email.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleDeleteEmail = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(filteredEmails.length > 1 ? filteredEmails[0] : null);
    }
  };

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  async function handleSendEmail() {
    if (composeData.to && composeData.subject && composeData.message) {
      setIsSending(true);
      setSendError(null);
      try {
        const res = await fetch("/api/send-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: composeData.to,
            subject: composeData.subject,
            html: `<p>${composeData.message.replace(/\n/g, '<br/>')}</p>`
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de l'envoi du mail");
        }
        const newEmail: Email = {
          id: Date.now().toString(),
          from: "You",
          fromEmail: "you@example.com",
          subject: composeData.subject,
          preview: composeData.message.substring(0, 100) + "...",
          date: "just now",
          read: true,
          starred: false,
          tags: [],
          body: composeData.message,
        };
        setEmails([newEmail, ...emails]);
        setComposeData({ to: "", subject: "", message: "" });
        setIsComposing(false);
        setSelectedEmail(newEmail);
      } catch (err: any) {
        setSendError(err.message);
      } finally {
        setIsSending(false);
      }
    }
  }

  const handleToggleStar = (id: string) => {
    setEmails(
      emails.map((email) => (email.id === id ? { ...email, starred: !email.starred } : email))
    );
    if (selectedEmail?.id === id) {
      setSelectedEmail({ ...selectedEmail, starred: !selectedEmail.starred });
    }
  };

  const handleAddTag = (emailId: string, tag: string) => {
    setEmails(
      emails.map((email) => {
        if (email.id === emailId && !email.tags.includes(tag)) {
          return { ...email, tags: [...email.tags, tag] };
        }
        return email;
      })
    );
    if (selectedEmail?.id === emailId && !selectedEmail.tags.includes(tag)) {
      setSelectedEmail({ ...selectedEmail, tags: [...selectedEmail.tags, tag] });
    }
  };

  const handleRemoveTag = (emailId: string, tag: string) => {
    setEmails(
      emails.map((email) => {
        if (email.id === emailId) {
          return { ...email, tags: email.tags.filter((t) => t !== tag) };
        }
        return email;
      })
    );
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({
        ...selectedEmail,
        tags: selectedEmail.tags.filter((t) => t !== tag),
      });
    }
  };

  const handleMarkAsRead = (id: string) => {
    setEmails(
      emails.map((email) => (email.id === id ? { ...email, read: true } : email))
    );
  };

  const handleToggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getTagColor = (tag: string) => {
    const tagObj = tags.find((t) => t.id === tag);
    return tagObj?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag: EmailTag = {
        id: newTagName.toLowerCase().replace(/\s+/g, "-"),
        name: newTagName,
        color: newTagColor,
      };
      setTags([...tags, newTag]);
      setNewTagName("");
      setNewTagColor(colorOptions[0]);
    }
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId));
    setEmails(
      emails.map((email) => ({
        ...email,
        tags: email.tags.filter((t) => t !== tagId),
      }))
    );
    setSelectedTags(selectedTags.filter((t) => t !== tagId));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-slate-50/50 dark:to-slate-900/50">
      {/* Header moderne et minimaliste */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-background/80 backdrop-blur-xl px-8 py-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Courrier
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gérez vos e-mails et communications</p>
              </div>
            </div>
            <Button
              onClick={() => setIsComposing(true)}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 h-11"
            >
              <Mail className="w-4 h-4 mr-2" />
              Nouveau message
            </Button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                <Input
                  placeholder="Rechercher dans vos e-mails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-11 focus:border-sky-500 focus:ring-sky-500/10 focus:ring-4 transition-all"
                />
              </div>
            </div>

            {/* Tags Filter - Moderne */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtrer:</span>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTagFilter(tag.id)}
                    className={`group relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedTags.includes(tag.id)
                        ? `${tag.color} shadow-md ring-2 ring-offset-1 dark:ring-offset-slate-900`
                        : `${tag.color} opacity-50 hover:opacity-75`
                    }`}
                  >
                    {tag.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTagToDelete(tag);
                      }}
                      className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 rounded-full shadow-md transition-opacity"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagManager(!showTagManager)}
                  className="text-slate-600 dark:text-slate-400 h-9 px-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter tag
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="ml-auto text-slate-500 dark:text-slate-400 text-xs px-3 h-8"
                >
                  Réinitialiser filtres
                </Button>
              )}
            </div>

            {/* Tag Manager */}
            {showTagManager && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-semibold text-sm">Créer un nouveau tag</h3>
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="Nom du tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 min-w-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <div className="flex gap-1.5">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newTagColor === color
                            ? "border-slate-800 dark:border-white ring-2 ring-offset-1"
                            : "border-transparent opacity-60 hover:opacity-100"
                        } ${color}`}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={handleCreateTag}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-4"
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTagManager(false)}
                    className="text-slate-600 dark:text-slate-400"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation suppression tag */}
      <Dialog open={!!tagToDelete} onOpenChange={(open) => { if (!open) setTagToDelete(null); }}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Supprimer le tag</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 dark:text-slate-400">
            Êtes-vous sûr de vouloir supprimer le tag <span className="font-semibold text-slate-900 dark:text-white">{tagToDelete?.name}</span> ?<br />
            <span className="text-sm">Cette action retirera ce tag de tous les e-mails.</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagToDelete(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => { if (tagToDelete) { handleDeleteTag(tagToDelete.id); setTagToDelete(null); } }}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content - Grid Moderne */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Email List - Sidebar gauche */}
        <div className="w-full lg:w-80 border-r border-slate-200/50 dark:border-slate-700/50 overflow-y-auto flex flex-col bg-background/50 backdrop-blur-sm">
          {filteredEmails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun e-mail trouvé</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    handleMarkAsRead(email.id);
                  }}
                  className={`p-4 cursor-pointer transition-all duration-200 border-l-4 group ${
                    selectedEmail?.id === email.id
                      ? "bg-white dark:bg-slate-800 border-l-sky-500 shadow-sm"
                      : "bg-transparent border-l-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block truncate ${!email.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {email.from}
                      </span>
                      <p className={`text-sm line-clamp-1 mt-1 ${!email.read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                        {email.subject}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(email.id);
                      }}
                      className="text-slate-300 hover:text-yellow-500 transition-colors flex-shrink-0"
                    >
                      {email.starred ? (
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mb-2">
                    {email.preview}
                  </p>

                  {email.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {email.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className={`text-xs ${getTagColor(tag)}`}>
                          {tags.find((t) => t.id === tag)?.name}
                        </Badge>
                      ))}
                      {email.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{email.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{email.date}</span>
                    {!email.read && (
                      <span className="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Detail or Compose - Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {isComposing ? (
            // Compose View - Ultra Moderne
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-background/50">
                <h2 className="text-2xl font-bold">Composer un nouveau message</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rédigez et envoyez vos e-mails en un instant</p>
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto p-8">
                <div className="space-y-6 max-w-2xl">
                  {/* To Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      À:
                    </label>
                    <Input
                      placeholder="destinataire@exemple.com"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-11 focus:border-sky-500 focus:ring-sky-500/10 focus:ring-4"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Sujet:
                    </label>
                    <Input
                      placeholder="Sujet de l'e-mail"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-11 focus:border-sky-500 focus:ring-sky-500/10 focus:ring-4"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Message:
                    </label>
                    <Textarea
                      placeholder="Écrivez votre message ici..."
                      value={composeData.message}
                      onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                      className="min-h-[300px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:border-sky-500 focus:ring-sky-500/10 focus:ring-4 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 flex gap-3 bg-background/50">
                <Button
                  onClick={handleSendEmail}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-6"
                  disabled={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? "Envoi en cours..." : "Envoyer"}
                </Button>
                {sendError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {sendError}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    setComposeData({ to: "", subject: "", message: "" });
                  }}
                  className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : selectedEmail ? (
            // Email Detail View - Ultra Moderne
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Email Header */}
              <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-background/50">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 break-words">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        De: <span className="font-semibold text-slate-900 dark:text-white">{selectedEmail.from}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEmail.fromEmail}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedEmail.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStar(selectedEmail.id)}
                      className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {selectedEmail.starred ? (
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <Star className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-2xl space-y-6">
                  {/* Content */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-base">
                      {selectedEmail.body}
                    </p>
                  </div>

                  {/* Tags Section */}
                  {(selectedEmail.tags.length > 0 || tags.filter((tag) => !selectedEmail.tags.includes(tag.id)).length > 0) && (
                    <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tags ({selectedEmail.tags.length})
                      </h3>
                      
                      {/* Existing Tags */}
                      {selectedEmail.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedEmail.tags.map((tag) => (
                            <div
                              key={tag}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${getTagColor(tag)}`}
                            >
                              {tags.find((t) => t.id === tag)?.name}
                              <button
                                onClick={() => handleRemoveTag(selectedEmail.id, tag)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Tags */}
                      {tags.filter((tag) => !selectedEmail.tags.includes(tag.id)).length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ajouter des tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {tags
                              .filter((tag) => !selectedEmail.tags.includes(tag.id))
                              .map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => handleAddTag(selectedEmail.id, tag.id)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium border border-dashed transition-all opacity-60 hover:opacity-100 ${tag.color}`}
                                >
                                  + {tag.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 flex gap-3 bg-background/50">
                <Button
                  variant="outline"
                  className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Répondre
                </Button>
                <Button
                  variant="outline"
                  className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Aucun e-mail sélectionné</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Sélectionnez un e-mail pour lire son contenu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
