"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  FileText,
  Download,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const DEMO_SPEC = {
  title: "Microservices Architecture Spec",
  snippet:
    "Defines service boundaries, inter-service communication via gRPC, and event streaming with Kafka...",
};

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Ghost AI is initializing neural pathways... Backend generation coming soon.",
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setDraft("");
  }, [draft]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <aside
      aria-label="AI sidebar"
      aria-hidden={!isOpen}
      className={cn(
        "fixed z-40 flex flex-col top-16 right-2 h-[calc(100vh-3.5rem-16px)] w-80",
        "bg-elevated/95 backdrop-blur-2xl",
        "border border-surface-border/60 rounded-2xl overflow-hidden",
        "shadow-[0_8px_40px_-4px_rgba(0,0,0,0.8),0_2px_12px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-[calc(100%+0.5rem)] opacity-0 pointer-events-none",
      )}
    >
      {/* Ambient AI glow strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ai/60 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-surface-border/60 shrink-0 bg-surface/20">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center h-7 w-7 rounded-lg bg-ai/10 border border-ai/20">
            <Bot className="h-3.5 w-3.5 text-ai-text" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.8rem] font-semibold tracking-wide text-copy-primary leading-none">
              AI Workspace
            </span>
            <span className="text-[0.65rem] text-copy-muted leading-none mt-0.5 tracking-wide">
              Collaborate with Ghost AI
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI sidebar"
          className="h-6 w-6 flex items-center justify-center rounded-md text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex-1 flex flex-col overflow-hidden min-h-0">
        <TabsList className="shrink-0 w-full rounded-none border-b border-surface-border/60 bg-transparent h-auto p-0 gap-0 justify-start">
          {[
            { value: "architect", label: "AI Architect", icon: Zap },
            { value: "specs", label: "Specs", icon: FileText },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "flex-1 rounded-none border-0 h-9 text-[0.75rem] font-medium tracking-wide gap-1.5",
                "text-copy-muted",
                "data-active:text-ai-text data-active:bg-ai/8 data-active:shadow-none",
                "after:bg-ai after:h-px after:bottom-[-1px] after:opacity-0 data-active:after:opacity-100",
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex-1 flex flex-col overflow-hidden m-0 min-h-0">
          {/* Chat area */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 flex flex-col gap-2">
              {messages.length === 0 ? (
                <EmptyState onChipClick={(chip) => { setDraft(chip); textareaRef.current?.focus(); }} />
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="shrink-0 border-t border-surface-border/60 p-3 bg-surface/10">
            <div className="flex flex-col gap-2 rounded-xl border border-surface-border/60 bg-subtle/40 p-2 focus-within:border-ai/40 transition-colors">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Ghost AI anything..."
                rows={1}
                className={cn(
                  "w-full resize-none bg-transparent text-[0.8rem] text-copy-primary placeholder:text-copy-faint",
                  "outline-none leading-relaxed",
                  "min-h-[44px] max-h-[160px] field-sizing-content",
                )}
              />
              <div className="flex items-center justify-between">
                <span className="text-[0.6rem] text-copy-faint tracking-wide">
                  Enter to send · Shift+Enter for newline
                </span>
                <button
                  onClick={submit}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className={cn(
                    "h-6 w-6 flex items-center justify-center rounded-md transition-all",
                    draft.trim()
                      ? "bg-ai text-white hover:bg-ai/80"
                      : "bg-subtle text-copy-faint cursor-not-allowed",
                  )}
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex-1 flex flex-col overflow-hidden m-0 min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 flex flex-col gap-3">
              <Button
                className="w-full gap-2 bg-ai text-white hover:bg-ai/80 border-0 shadow-[0_0_20px_-6px_rgba(100,87,249,0.6)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Spec
              </Button>

              <DemoSpecCard />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function EmptyState({ onChipClick }: { onChipClick: (chip: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-14 w-14 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center">
        <Bot className="h-6 w-6 text-ai-text opacity-70" />
        <div className="absolute inset-0 rounded-full bg-ai/5 animate-ping" style={{ animationDuration: "3s" }} />
      </div>
      <div className="space-y-1">
        <p className="text-[0.75rem] font-medium text-copy-primary">Ghost AI is ready</p>
        <p className="text-[0.7rem] text-copy-muted max-w-48 leading-relaxed">
          Describe your system and AI will design the architecture.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            className={cn(
              "w-full text-left rounded-lg px-3 py-2 text-[0.7rem] leading-relaxed",
              "bg-subtle text-ai-text border border-surface-border/40",
              "hover:border-ai/30 hover:bg-ai/5 transition-all duration-200",
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-5 w-5 rounded-md bg-ai/10 border border-ai/20 flex items-center justify-center shrink-0 mr-1.5 mt-0.5">
          <Bot className="h-3 w-3 text-ai-text" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-[0.75rem] leading-relaxed",
          isUser
            ? "bg-brand-dim border-2 border-brand/50 text-copy-primary"
            : "bg-elevated border border-surface-border text-ai-text",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function DemoSpecCard() {
  return (
    <div className="rounded-xl border border-surface-border bg-elevated p-3 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-ai/10 border border-ai/20 flex items-center justify-center shrink-0">
          <FileText className="h-3.5 w-3.5 text-ai-text" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.75rem] font-medium text-copy-primary leading-snug truncate">
            {DEMO_SPEC.title}
          </p>
          <p className="text-[0.65rem] text-copy-muted mt-0.5 leading-relaxed line-clamp-2">
            {DEMO_SPEC.snippet}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-surface-border/60 pt-2">
        <span className="text-[0.6rem] text-copy-faint tracking-wide uppercase">
          v1.0 · 2 min ago
        </span>
        <button
          disabled
          aria-label="Download spec"
          className="h-5 w-5 flex items-center justify-center rounded-md text-copy-faint opacity-40 cursor-not-allowed"
        >
          <Download className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
