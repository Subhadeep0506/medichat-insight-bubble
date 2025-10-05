import React, { useRef } from 'react';
import { MessageSquare, Plus, Trash2, Clock, Calendar, Tag, Stethoscope, ArrowLeft, Heart, Brain, Eye, Bone, Activity, User, Settings, Moon, Sun, Loader } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  createdAt: Date;
  messageCount: number;
  category: 'radiology' | 'cardiology' | 'neurology' | 'orthopedics' | 'general' | 'pathology';
  tags: string[];
}

import type { Patient, CaseRecord } from "@/types/domain";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChatSettingsStore } from "@/store/settings";

interface ChatHistorySidebarProps {
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onBackToCase?: () => void;
  patient?: Patient | null;
  caseRecord?: CaseRecord | null;
}

const categoryConfig = {
  radiology: { icon: Eye, color: 'bg-blue-600 dark:bg-blue-500', label: 'Radiology' },
  cardiology: { icon: Heart, color: 'bg-red-600 dark:bg-red-500', label: 'Cardiology' },
  neurology: { icon: Brain, color: 'bg-purple-600 dark:bg-purple-500', label: 'Neurology' },
  orthopedics: { icon: Bone, color: 'bg-amber-600 dark:bg-amber-500', label: 'Orthopedics' },
  general: { icon: Stethoscope, color: 'bg-green-600 dark:bg-green-500', label: 'General' },
  pathology: { icon: Activity, color: 'bg-pink-600 dark:bg-pink-500', label: 'Pathology' },
};

const tagColors = [
  'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700',
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
  'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900 dark:text-violet-200 dark:border-violet-700',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
  'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:border-rose-700',
  'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700',
];

export const ChatHistorySidebar = ({
  chatHistories,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onBackToCase,
  patient,
  caseRecord,
}: ChatHistorySidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const settings = useChatSettingsStore((s) => s.settings);
  const updateSettings = useChatSettingsStore((s) => s.update);

  const [localProvider, setLocalProvider] = React.useState(settings.modelProvider);
  const [localModel, setLocalModel] = React.useState(settings.model);
  const [localTemp, setLocalTemp] = React.useState<number>(settings.temperature);
  const [localTopP, setLocalTopP] = React.useState<number>(settings.top_p);
  const [localMaxTokens, setLocalMaxTokens] = React.useState<number>(settings.max_tokens);
  const [localDebug, setLocalDebug] = React.useState<boolean>(settings.debug);

  React.useEffect(() => {
    setLocalProvider(settings.modelProvider);
    setLocalModel(settings.model);
    setLocalTemp(settings.temperature);
    setLocalTopP(settings.top_p);
    setLocalMaxTokens(settings.max_tokens);
    setLocalDebug(settings.debug);
  }, [settings]);

  const formatDateofBirth = (dob?: string | null) => {
    if (!dob) return '—';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dob));
  };
  const getPriorityClasses = (p?: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high': return 'priority-badge priority-high';
      case 'medium': return 'priority-badge priority-medium';
      default: return 'priority-badge priority-low';
    }
  };
  const formatDateTime = (dob?: string | null) => {
    if (!dob) return '—';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: "2-digit", minute: "2-digit" }).format(new Date(dob));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };
  const tagColorMapRef = useRef<Map<string, number>>(new Map());
  const getRandomColorIndexFor = (s: string) => {
    const existing = tagColorMapRef.current.get(s);
    if (existing) return existing;
    const idx = Math.floor(Math.random() * 12) + 1;
    tagColorMapRef.current.set(s, idx);
    return idx;
  };

  return (
    <Sidebar variant='floating' className="m-0 pr-0">
      <SidebarHeader className="p-4 rounded-t-lg dark:bg-slate-900">
        {(
          isCollapsed ? (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onBackToCase && onBackToCase(); }} className="mb-2 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onBackToCase && onBackToCase(); }} className="w-full justify-start gap-2 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Button>
          )
        )}
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          {deletingId ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {!isCollapsed && (deletingId ? "Deleting..." : "New Medical Chat")}
        </Button>
      </SidebarHeader>

      <SidebarContent className='dark:bg-slate-900'>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && "Chat History"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistories.map((chat) => {
                const categoryInfo = categoryConfig[chat.category];
                const CategoryIcon = categoryInfo.icon;

                return (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={currentChatId === chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`group relative flex flex-col items-start gap-2 p-3 hover:bg-slate/90 h-auto dark:bg-slate-800 active:scale-95 active:border active:border-green-400/90 transition-all ${currentChatId === chat.id ? 'border border-green-400/90 dark:border-green-700/90' : ''
                        }`}
                    >
                      {!isCollapsed ? (
                        <div className="w-full space-y-2">
                          {/* Header with category and delete button */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${categoryInfo.color} text-white`}>
                                <CategoryIcon className="h-3 w-3" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {categoryInfo.label}
                              </Badge>
                            </div>
                            <button
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDeleteId(chat.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {deletingId === chat.id && (
                              <div className="absolute right-3 top-3">
                                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-medium text-left w-full">
                            {truncateText(chat.title, 30)}
                          </h4>

                          {/* Last message preview */}
                          {/* <p className="text-xs text-muted-foreground text-left w-full leading-relaxed">
                            {truncateText(chat.lastMessage, 60)}
                          </p> */}

                          {/* Tags */}
                          {chat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 w-full">
                              {chat.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={tag}
                                  className={`text-xs px-1.5 py-0.5 rounded-full border ${getTagColor(index)}`}
                                >
                                  {truncateText(tag, 8)}
                                </span>
                              ))}
                              {chat.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{chat.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Timestamps and message count */}
                          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(chat.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(chat.timestamp)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{chat.messageCount}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <div className={`p-2 rounded ${categoryInfo.color} text-white`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {chatHistories.length === 0 && !isCollapsed && (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs">Start a new medical consultation</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t dark:bg-slate-900">
        {!isCollapsed ? (
          <div className="space-y-3">

            {/* Profile Section */}
            <div
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setProfileOpen(true)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={"Patient"} />
                <AvatarFallback className="bg-primary/10 text-primary">{(typeof ("" + (patient?.name || "")).charAt === 'function' ? (patient?.name || "?").charAt(0) : 'P')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{patient?.name || "Patient"}</p>
                <p className="text-xs text-muted-foreground">{caseRecord?.title || "Case"}</p>
              </div>
            </div>

            {/* Settings and Theme Toggle */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Collapsed Profile */}
            <div onClick={() => setProfileOpen(true)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={"Patient"} />
                <AvatarFallback className="bg-primary/10 text-primary">{(typeof ("" + (patient?.name || "")).charAt === 'function' ? (patient?.name || "?").charAt(0) : 'P')}</AvatarFallback>
              </Avatar>
            </div>

            {/* Collapsed Controls */}
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chat settings</DialogTitle>
              <DialogDescription>Configure model and generation parameters</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label>Model provider</Label>
                  <Select value={localProvider} onValueChange={setLocalProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq">groq</SelectItem>
                      <SelectItem value="local">local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model name</Label>
                  <Select value={localModel} onValueChange={setLocalModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qwen/qwen3-32b">qwen/qwen3-32b</SelectItem>
                      <SelectItem value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b</SelectItem>
                      <SelectItem value="gemma2-9b-it">gemma2-9b-it</SelectItem>
                      <SelectItem value="compound-beta">compound-beta</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">llama-3.1-8b-instant</SelectItem>
                      <SelectItem value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</SelectItem>
                      <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">meta-llama/llama-4-maverick-17b-128e-instruct</SelectItem>
                      <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">meta-llama/llama-4-scout-17b-16e-instruct</SelectItem>
                      <SelectItem value="meta-llama/llama-guard-4-12b">meta-llama/llama-guard-4-12b</SelectItem>
                      <SelectItem value="openai/gpt-oss-120b">openai/gpt-oss-120b</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input type="number" step="0.1" min={0} max={2} value={localTemp} onChange={(e) => setLocalTemp(parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Top P</Label>
                    <Input type="number" step="0.05" min={0} max={1} value={localTopP} onChange={(e) => setLocalTopP(parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max tokens</Label>
                    <Input type="number" step="1" min={1} max={8192} value={localMaxTokens} onChange={(e) => setLocalMaxTokens(parseInt(e.target.value || '0', 10))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="debug-toggle" type="checkbox" className="h-4 w-4" checked={localDebug} onChange={(e) => setLocalDebug(e.target.checked)} />
                  <Label htmlFor="debug-toggle">Debug mode</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setSettingsOpen(false)}>Cancel</Button>
              <Button onClick={() => { updateSettings({ modelProvider: localProvider, model: localModel, temperature: localTemp, top_p: localTopP, max_tokens: localMaxTokens, debug: localDebug }); setSettingsOpen(false); }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient & case details</DialogTitle>
              <DialogDescription>Overview of the current patient and case</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-semibold mb-2">Patient</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {patient?.name || '-'}</div>
                  <div><span className="text-muted-foreground">Age:</span> {patient?.age ?? '-'}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {patient?.gender || '-'}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {formatDateofBirth(patient?.dob) || '-'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Medical history:</span> {patient?.medicalHistory || '-'}</div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Case</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="col-span-2"><span className="text-muted-foreground">Title:</span> {caseRecord?.title || '-'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Description:</span> {caseRecord?.description || '-'}</div>
                  <div>
                    <span className="text-muted-foreground">Priority: </span>
                    <span className={getPriorityClasses(caseRecord?.priority)}>
                      Priority: {caseRecord?.priority ? caseRecord.priority.charAt(0).toUpperCase() + caseRecord.priority.slice(1) : '-'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-muted-foreground">Tags:</span>
                      {caseRecord?.tags.map((tag) => (
                        <span key={tag} className={`tag-badge tag-color-${getRandomColorIndexFor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Created:</span> {formatDateTime(caseRecord?.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setProfileOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete chat</DialogTitle>
              <DialogDescription>Are you sure you want to delete this chat? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => { if (pendingDeleteId) { setDeletingId(pendingDeleteId); try { await onDeleteChat(pendingDeleteId); } finally { setDeletingId(null); } } setDeleteDialogOpen(false); setPendingDeleteId(null); }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
};
