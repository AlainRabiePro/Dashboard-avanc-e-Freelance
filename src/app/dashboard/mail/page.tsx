"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, Search, Send, Trash2, X, Plus, MoreVertical, Star, Archive, 
  AlertCircle, Clock, ChevronDown, CheckCircle, Tag as TagIcon, 
  FileText, Paperclip, SmilePlus, Settings
} from "lucide-react";
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

  const unreadCount = emails.filter(e => !e.read).length;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Top Bar - Gmail Style */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher un e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 bg-gray-100 dark:bg-slate-900 border-0 rounded-full h-10 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTagManager(!showTagManager)}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              title="Gérer les tags"
            >
              <TagIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsComposing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              <Mail className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>
      </div>

      {/* Tag Manager Dialog */}
      <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Add New Tag */}
            <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-slate-700">
              <h4 className="font-medium text-sm">Créer un nouveau tag</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {colorOptions.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-6 h-6 rounded border-2 ${
                        newTagColor === color
                          ? "border-gray-800 dark:border-white"
                          : "border-transparent"
                      } ${color}`}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleCreateTag}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Existing Tags */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Mes tags</h4>
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tag.color.split(' ')[0]}`} />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  <button
                    onClick={() => setTagToDelete(tag)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagManager(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirmation */}
      <Dialog open={!!tagToDelete} onOpenChange={(open) => { if (!open) setTagToDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer le tag <span className="font-semibold">{tagToDelete?.name}</span> ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagToDelete(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => { if (tagToDelete) { handleDeleteTag(tagToDelete.id); setTagToDelete(null); } }}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {isComposing ? (
        // Compose Modal
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md w-full max-w-2xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="font-medium">Nouveau message</h2>
              <button
                onClick={() => {
                  setIsComposing(false);
                  setComposeData({ to: "", subject: "", message: "" });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">À:</label>
                <Input
                  placeholder="Destinataire"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  className="mt-1 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Sujet:</label>
                <Input
                  placeholder="Sujet"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="mt-1 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                />
              </div>

              <div>
                <Textarea
                  placeholder="Composez votre message..."
                  value={composeData.message}
                  onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                  className="min-h-48 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2 items-center">
              <Button
                onClick={handleSendEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSending}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Envoi..." : "Envoyer"}
              </Button>
              {sendError && (
                <span className="text-red-500 text-sm">{sendError}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Email List & Detail View
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Left Sidebar - Folders */}
          <div className="w-40 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto flex flex-col p-2 text-sm">
            <div className="space-y-1">
              <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer font-medium">
                📧 Courrier
              </div>
              <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-600 dark:text-gray-400">
                ⭐ Suivi
              </div>
              <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-600 dark:text-gray-400">
                📤 Envoyés
              </div>
              <div className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-600 dark:text-gray-400">
                🗑️ Corbeille
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 mt-3 pt-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-3 mb-2">ÉTIQUETTES</div>
              <div className="space-y-1">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTagFilter(tag.id)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle - Email List */}
          <div className="w-72 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="border-b border-gray-200 dark:border-slate-800 p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {filteredEmails.length} e-mails
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} non lus
              </span>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
              {filteredEmails.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                  Aucun e-mail
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      handleMarkAsRead(email.id);
                    }}
                    className={`p-3 cursor-pointer transition-colors text-xs ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    } ${!email.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(email.id);
                        }}
                        className="mt-0.5 text-gray-300 hover:text-yellow-500 flex-shrink-0"
                      >
                        {email.starred ? (
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Star className="w-3.5 h-3.5" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {email.from}
                        </div>
                        <div className={`truncate mt-0.5 ${!email.read ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                          {email.subject}
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 truncate mt-0.5">
                          {email.preview}
                        </div>
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex-shrink-0 text-right whitespace-nowrap">
                        {email.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Email Detail */}
          <div className="flex-1 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {selectedEmail ? (
              <>
                {/* Detail Header */}
                <div className="border-b border-gray-200 dark:border-slate-800 p-3 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStar(selectedEmail.id)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {selectedEmail.starred ? (
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-3xl">
                    {/* Email Header */}
                    <div className="mb-4">
                      <h1 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                        {selectedEmail.subject}
                      </h1>

                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {selectedEmail.from.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedEmail.from}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedEmail.fromEmail}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedEmail.date}
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedEmail.body}
                    </div>

                    {/* Tags Section */}
                    {(selectedEmail.tags.length > 0 || tags.filter((tag) => !selectedEmail.tags.includes(tag.id)).length > 0) && (
                      <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
                        <h3 className="text-xs font-medium mb-2 text-gray-900 dark:text-white">Étiquettes</h3>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {selectedEmail.tags.map((tag) => (
                            <div
                              key={tag}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getTagColor(tag)}`}
                            >
                              {tags.find((t) => t.id === tag)?.name}
                              <button
                                onClick={() => handleRemoveTag(selectedEmail.id, tag)}
                                className="hover:opacity-70"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {tags.filter((tag) => !selectedEmail.tags.includes(tag.id)).length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Ajouter une étiquette:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {tags
                                .filter((tag) => !selectedEmail.tags.includes(tag.id))
                                .map((tag) => (
                                  <button
                                    key={tag.id}
                                    onClick={() => handleAddTag(selectedEmail.id, tag.id)}
                                    className={`px-2 py-0.5 rounded text-xs font-medium border border-dashed transition-opacity opacity-60 hover:opacity-100 ${tag.color}`}
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

                {/* Reply Section */}
                <div className="border-t border-gray-200 dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/50">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                    <Send className="w-3 h-3 mr-1.5" />
                    Répondre
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Mail className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Sélectionnez un e-mail</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
