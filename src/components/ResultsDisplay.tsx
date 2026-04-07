import { motion } from "framer-motion";
import { Lightbulb, FileText, Image, Copy, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface GeneratedContent {
  videoIdeas: string[];
  script: { hook: string; body: string; cta: string };
  thumbnail: { text: string; visualIdea: string; colors: string };
}

interface ResultsDisplayProps {
  content: GeneratedContent;
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function ResultsDisplay({ content, onRegenerate, isLoading }: ResultsDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Generated Content</h2>
        <Button variant="subtle" size="sm" onClick={onRegenerate} disabled={isLoading}>
          <RefreshCw className={isLoading ? "animate-spin" : ""} /> Regenerate
        </Button>
      </div>

      {/* Video Ideas */}
      <Section icon={<Lightbulb className="text-primary" />} title="Video Ideas">
        <div className="space-y-3">
          {content.videoIdeas.map((idea, i) => (
            <IdeaCard key={i} index={i + 1} text={idea} />
          ))}
        </div>
      </Section>

      {/* Script */}
      <Section icon={<FileText className="text-accent" />} title="Full Script">
        <div className="space-y-4">
          <ScriptBlock label="🎣 Hook" text={content.script.hook} />
          <ScriptBlock label="📝 Body" text={content.script.body} />
          <ScriptBlock label="📣 Call to Action" text={content.script.cta} />
        </div>
      </Section>

      {/* Thumbnail */}
      <Section icon={<Image className="text-primary" />} title="Thumbnail Concept">
        <div className="space-y-3 text-sm">
          <div><span className="font-semibold text-foreground">Text Overlay:</span> <span className="text-muted-foreground">{content.thumbnail.text}</span></div>
          <div><span className="font-semibold text-foreground">Visual Idea:</span> <span className="text-muted-foreground">{content.thumbnail.visualIdea}</span></div>
          <div><span className="font-semibold text-foreground">Color Palette:</span> <span className="text-muted-foreground">{content.thumbnail.colors}</span></div>
        </div>
      </Section>
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function IdeaCard({ index, text }: { index: number; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border group">
      <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{index}</span>
      <p className="text-sm text-foreground flex-1">{text}</p>
      <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function ScriptBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground whitespace-pre-wrap">{text}</div>
      <button onClick={copy} className="absolute top-8 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
