import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as UiMessage } from '../MedicalChatInterface';
import { User, Bot, Info, Shield, Brain, ThumbsUp, ThumbsDown, Loader, MessageSquare, Star } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatApi } from '@/api/chat';
import { useChatStore } from '@/store';
import { toast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: UiMessage;
}

function extractOuterTagContent(raw: string, tag: string) {
  const lower = raw.toLowerCase();
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = lower.indexOf(open);
  const end = lower.lastIndexOf(close);
  if (start === -1 || end === -1 || end < start) return null;
  return raw.slice(start + open.length, end).trim();
}

function stripAllTags(raw: string) {
  return raw.replace(/<\/?(think|answer)>/gi, "").trim();
}

function parseAssistantContent(content: string) {
  const think = extractOuterTagContent(content, "think");
  const explicitAnswer = extractOuterTagContent(content.split("</think>")[1], "answer");
  const answer = explicitAnswer ? explicitAnswer : stripAllTags(content);
  return { think: think ? stripAllTags(think) : null, answer };
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  const sections = !isUser ? parseAssistantContent(message.content) : { think: null as string | null, answer: message.content };

  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(message.feedback ?? null);
  const [stars, setStars] = useState<number | null>(message.stars ?? null);

  const sessionId = message.sessionId;

  const updateMessageInStore = (patch: Partial<UiMessage>) => {
    useChatStore.setState((s) => {
      const msgs = { ...(s.messagesBySession || {}) };
      const arr = msgs[sessionId || s.currentSessionId || ''] || [];
      const next = arr.map((m: any) => (m.id === message.id ? { ...m, ...patch } : m));
      return { messagesBySession: { ...msgs, [sessionId || s.currentSessionId || '']: next } } as any;
    });
  };

  const isLiked = () => message.like === 'like' || message.like === 'true' || message.like === true;
  const isDisliked = () => message.like === 'dislike' || message.like === 'false' || message.like === false;

  const handleLike = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const serverId = message.serverMessageId;
    if (!serverId) return;
    const currentlyLiked = isLiked();
    const action = currentlyLiked ? null : 'like';
    setLikeLoading(true);
    setDislikeLoading(false);
    try {
      await ChatApi.likeMessage(serverId, action);
      updateMessageInStore({ like: action });
    } catch (err: any) {
      toast({ title: 'Failed to update like', description: err?.data?.detail ?? String(err), variant: 'destructive' });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const serverId = message.serverMessageId;
    if (!serverId) return;
    const currentlyDisliked = isDisliked();
    const action = currentlyDisliked ? null : 'dislike';
    setDislikeLoading(true);
    setLikeLoading(false);
    try {
      await ChatApi.likeMessage(serverId, action);
      updateMessageInStore({ like: action });
    } catch (err: any) {
      toast({ title: 'Failed to update dislike', description: err?.data?.detail ?? String(err), variant: 'destructive' });
    } finally {
      setDislikeLoading(false);
    }
  };

  const handleSubmitFeedback = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const serverId = message.serverMessageId;
    if (!serverId) return;
    try {
      await ChatApi.editFeedback(serverId, feedbackText ?? null, stars ?? null);
      updateMessageInStore({ feedback: feedbackText ?? null, stars: stars ?? null });
      setFeedbackOpen(false);
      toast({ title: 'Feedback submitted' });
    } catch (err: any) {
      toast({ title: 'Failed to submit feedback', description: err?.data?.detail ?? String(err), variant: 'destructive' });
    }
  };

  return (
    <div className={`flex items-start space-x-2 md:space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground ml-4' : 'bg-secondary text-secondary-foreground'
      }`}>
        {isUser ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] md:max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className={`relative inline-block p-3 md:p-4 rounded-2xl shadow-lg ${
          isUser
            ? 'bg-secondary text-secondary-foreground rounded-br-sm border border-gray-600/20'
            : 'bg-card text-card-foreground rounded-bl-sm border border-gray-200/20'
        }`}>
          {/* Responsibility AI Indicator for Assistant Messages */}
          {!isUser && message.responsibilityScore && (
            <div className="absolute -top-2 -right-2">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="cursor-help">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center space-x-1"
                    >
                      <Info className="h-3 w-3" />
                      <span className="text-xs font-medium">{message.responsibilityScore}%</span>
                    </Badge>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 flex items-center">
                      <Shield className="h-4 w-4 mr-2" /> Responsible AI Score: {message.responsibilityScore}%
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {message.responsibilityReason}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 dark:text-gray-200 dark:bg-gray-800 p-2 rounded">
                      <strong>Note:</strong> This score reflects adherence to ethical AI practices in medical contexts, including appropriate disclaimers and professional consultation recommendations.
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          )}

          {/* Message Image */}
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Uploaded medical image"
                className="max-w-full md:max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}

          {/* think Section (collapsible) */}
          {!isUser && sections.think && (
            <div className="mb-3">
              <Accordion type="single" collapsible>
                <AccordionItem value="think">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4" /> Model reasoning
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-xs leading-relaxed prose prose-sm max-w-none dark:prose-invert bg-muted/40 border border-border rounded-md p-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ul: ({ children }) => (
                            <ul className="list-disc list-outside pl-5 mb-2 space-y-1 text-foreground">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside pl-5 mb-2 space-y-1 text-foreground">{children}</ol>
                          ),
                          li: ({ children }) => <li className="text-foreground">{children}</li>,
                        }}
                      >
                        {sections.think}
                      </ReactMarkdown>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Final Answer Markdown */}
          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>,
                p: ({children}) => <p className="mb-2 last:mb-0 text-foreground">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-outside pl-5 mb-2 space-y-1 text-foreground">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-outside pl-5 mb-2 space-y-1 text-foreground">{children}</ol>,
                li: ({children}) => <li className="text-foreground">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({children}) => <em className="italic text-foreground">{children}</em>,
                code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
              }}
            >
              {sections.answer}
            </ReactMarkdown>
          </div>

          {/* Timestamp */}
          <div className={`mt-2 text-xs opacity-70 ${isUser ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Actions for assistant messages */}
          {!isUser && (
            <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {/* Like */}
              <button
                type="button"
                data-message-id={message.serverMessageId}
                onClick={(e) => handleLike(e)}
                disabled={!message.serverMessageId || likeLoading || dislikeLoading}
                className={`${isLiked() ? 'font-semibold' : 'border rounded px-2 py-1'} flex items-center gap-2 text-sm`}
                aria-label="Like message"
              >
                {likeLoading ? <Loader className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                <span>Like</span>
              </button>

              {/* Dislike */}
              <button
                type="button"
                data-message-id={message.serverMessageId}
                onClick={(e) => handleDislike(e)}
                disabled={!message.serverMessageId || likeLoading || dislikeLoading}
                className={`${isDisliked() ? 'font-semibold' : 'border rounded px-2 py-1'} flex items-center gap-2 text-sm`}
                aria-label="Dislike message"
              >
                {dislikeLoading ? <Loader className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                <span>Dislike</span>
              </button>

              {/* Feedback */}
              <button
                type="button"
                data-message-id={message.serverMessageId}
                onClick={(e) => { e.stopPropagation(); setFeedbackOpen(true); }}
                className={`border rounded px-2 py-1 flex items-center gap-2 text-sm`}
                aria-label="Feedback"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Feedback</span>
              </button>

              {/* Show current stars if any */}
              {message.stars ? (
                <div className="ml-2 text-sm text-foreground flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{message.stars}</span>
                </div>
              ) : null}

              {/* Feedback Dialog */}
              <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Provide feedback</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} type="button" onClick={(ev) => { ev.stopPropagation(); setStars(n); }} className={`p-2 rounded ${stars === n ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}>
                          <Star className={`h-5 w-5 ${stars === n ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>

                    <textarea value={feedbackText ?? ''} onChange={(e) => setFeedbackText(e.target.value)} className="w-full border p-2 rounded" rows={4} placeholder="Describe your feedback" />

                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); setFeedbackOpen(false); }} className="px-3 py-2 rounded border">Cancel</button>
                      <button type="button" onClick={(ev) => handleSubmitFeedback(ev)} className="px-3 py-2 rounded bg-primary text-primary-foreground">Submit</button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
