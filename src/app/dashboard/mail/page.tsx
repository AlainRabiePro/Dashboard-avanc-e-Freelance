"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Search, Send, Trash2, X, Star, Archive, Clock, Tag as TagIcon 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-context";

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
  { id: "meeting", name: "Réunion", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { id: "invoice", name: "Facture", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

const mockEmails: Email[] = [
  {
    id: "1",
    from: "Sarah Johnson",
    fromEmail: "sarah@client.com",
    subject: "Project Update - Q1 Review",
    preview: "Hi Alain, je voulais faire un point sur l'avancement...",
    date: "Aujourd'hui",
    read: false,
    starred: true,
    tags: ["client", "urgent"],
    body: "Bonjour Alain,\n\nJe voulais faire un point sur l'avancement du projet Q1...",
  },
  {
    id: "2",
    from: "Equipe Dev",
    fromEmail: "team@company.com",
    subject: "Réunion d'équipe - Lundi 10h",
    preview: "Rappel : réunion hebdo lundi à 10h...",
    date: "Hier",
    read: true,
    starred: false,
    tags: ["meeting"],
    body: "Rappel : réunion hebdomadaire prévue lundi...",
  },
  {
    id: "3",
    from: "Facturation",
    fromEmail: "invoice@system.com",
    subject: "Rappel Facture #2026-001",
    preview: "Facture #2026-001 à payer...",
    date: "2 jours",
    read: false,
    starred: false,
    tags: ["invoice"],
    body: "Rappel facture #2026-001 à régler...",
  },
];

export default function MailPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [tags, setTags] = useState<EmailTag[]>(defaultTags);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const filteredEmails = emails.filter((email) =>
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = emails.filter(e => !e.read).length;

  const handleDeleteEmail = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
  };

  const handleToggleStar = (id: string) => {
    setEmails(emails.map((email) => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleMarkAsRead = (id: string) => {
    setEmails(emails.map((email) => 
      email.id === id ? { ...email, read: true } : email
    ));
  };

  const getTagColor = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      
      {/* Sidebar simple - Compatible avec ton repo */}
      <div className="w-64 border-r border-slate-800/50 bg-slate-900/50 backdrop-blur flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-bold text-white">Messagerie</h2>
        </div>
        
        <div className="p-4 space-y-2 flex-1 overflow-auto">
          {/* Menu principal */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Dossiers</div>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-white">
              <Mail className="w-5 h-5" />
              📧 Courrier
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-slate-300">
              <Star className="w-5 h-5" />
              ⭐ Favoris
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-slate-300">
              <Send className="w-5 h-5" />
              📤 Envoyés
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-slate-300">
              <Trash2 className="w-5 h-5" />
              🗑️ Corbeille
            </button>
          </div>

          {/* Tags */}
          <div className="space-y-1 pt-4 border-t border-slate-800/50">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Tags</div>
            {tags.map((tag) => (
              <button 
                key={tag.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 text-slate-200 group"
              >
                <div className={`w-3 h-3 rounded-full ${tag.color.split(' ')[0]} flex-shrink-0`} />
                <span className="truncate">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher emails, contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 h-12 bg-slate-800/50 border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <Button
              onClick={() => setIsComposing(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 px-8 rounded-2xl shadow-xl hover:shadow-2xl text-white font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>

        {/* Email Content */}
        {isComposing ? (
          <div className="flex-1 p-12 flex items-center justify-center bg-slate-900/30">
            <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Nouveau message
                </h2>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsComposing(false)}
                  className="h-12 w-12 rounded-2xl hover:bg-slate-800/50"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 block">À</label>
                  <Input 
                    className="h-14 bg-slate-800/60 border-slate-700/50 text-white placeholder-slate-400 focus:ring-purple-500/50" 
                    placeholder="destinataire@exemple.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 block">Sujet</label>
                  <Input 
                    className="h-14 bg-slate-800/60 border-slate-700/50 text-white placeholder-slate-400 focus:ring-purple-500/50" 
                    placeholder="Sujet du message"
                  />
                </div>
                <Textarea 
                  className="min-h-[250px] bg-slate-800/60 border-slate-700/50 text-white resize-none focus:ring-purple-500/50" 
                  placeholder="Votre message..."
                />
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-700 flex justify-end">
                <Button 
                  size="lg" 
                  className="h-14 px-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl text-white font-semibold rounded-2xl"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Email List */}
            <div className="flex flex-1 overflow-hidden">
              <div className="w-[450px] border-r border-slate-800/50 bg-slate-900/50 backdrop-blur flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Inbox</h3>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold">
                      {unreadCount} non lus
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-6 cursor-pointer border-b border-slate-800/30 hover:bg-slate-800/30 transition-all group ${
                        selectedEmail?.id === email.id 
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-l-4 border-purple-500" 
                          : !email.read 
                          ? "bg-slate-900/50 border-l-4 border-blue-500/50" 
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedEmail(email);
                        if (!email.read) handleMarkAsRead(email.id);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xl group-hover:scale-105 transition-all">
                          {email.from.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white text-base truncate">{email.from}</h4>
                            <div className="flex items-center gap-2">
                              {email.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                              <span className="text-sm text-slate-500">{email.date}</span>
                            </div>
                          </div>
                          
                          <p className={`text-sm font-medium mb-1 truncate pr-20 ${
                            !email.read ? "text-white" : "text-slate-200"
                          }`}>
                            {email.subject}
                          </p>
                          
                          <p className="text-sm text-slate-400 truncate">{email.preview}</p>
                          
                          {email.tags.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {email.tags.slice(0, 2).map((tagId) => (
                                <Badge key={tagId} className={`font-medium ${getTagColor(tagId)}`}>
                                  {tags.find(t => t.id === tagId)?.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Detail */}
              <div className="flex-1 bg-slate-900/20 backdrop-blur overflow-hidden">
                {selectedEmail ? (
                  <div className="h-full flex flex-col">
                    <div className="border-b border-slate-800/50 p-8 bg-slate-900/70 backdrop-blur flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-14 w-14 rounded-2xl hover:bg-slate-800/50"
                          onClick={() => handleToggleStar(selectedEmail.id)}
                        >
                          {selectedEmail.starred ? (
                            <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <Star className="w-6 h-6" />
                          )}
                        </Button>
                        <Button variant="ghost" size="lg" className="h-14 w-14 rounded-2xl hover:bg-slate-800/50">
                          <Archive className="w-6 h-6" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="h-14 w-14 rounded-2xl hover:bg-red-500/20 text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteEmail(selectedEmail.id)}
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                      <Button className="h-14 px-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700 hover:to-slate-600 rounded-2xl text-slate-200 font-semibold shadow-lg">
                        <Send className="w-5 h-5 mr-2" />
                        Répondre
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10">
                      <div className="max-w-4xl">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8">
                          {selectedEmail.subject}
                        </h1>
                        
                        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-800/50">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl ring-4 ring-white/20">
                              {selectedEmail.from.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-white">{selectedEmail.from}</div>
                              <div className="text-lg text-slate-400 mt-1">{selectedEmail.fromEmail}</div>
                            </div>
                          </div>
                          <div className="text-lg text-slate-400 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {selectedEmail.date}
                          </div>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-xl whitespace-pre-wrap mb-12">
                          {selectedEmail.body}
                        </div>

                        {selectedEmail.tags.length > 0 && (
                          <div className="pt-12 border-t border-slate-800/50">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                              <TagIcon className="w-6 h-6" />
                              ÉTIQUETTES
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {selectedEmail.tags.map((tagId) => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                  <Badge 
                                    key={tagId} 
                                    className={`text-lg px-6 py-3 rounded-2xl font-bold shadow-lg ${getTagColor(tagId)} border-2 border-white/20`}
                                  >
                                    {tag.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-20">
                    <Mail className="w-32 h-32 mb-8 opacity-20" />
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
                      Aucun email sélectionné
                    </h2>
                    <p className="text-xl">Cliquez sur un email pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
