import { motion } from "framer-motion";
import { FileText, Image, Hash, Clock, Video, Copy, Check, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface GeneratedMaterials {
  script: { hook: string; body: string; cta: string };
  thumbnail: { text: string; visualIdea: string; colors: string };
  hashtags: string[];
  postCaption: string;
  bestPostingTime: string;
  estimatedLength: string;
}

interface MaterialsDisplayProps {
  ideaTitle: string;
  materials: GeneratedMaterials;
  onBack: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function MaterialsDisplay({ ideaTitle, materials, onBack, onRegenerate, isLoading }: MaterialsDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Ideas
        </Button>
        <Button variant="subtle" size="sm" onClick={onRegenerate} disabled={isLoading}>
          <RefreshCw className={isLoading ? "animate-spin" : ""} size={14} /> Regenerate
        </Button>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground mb-1">Generating materials for:</p>
        <p className="font-semibold text-foreground">{ideaTitle}</p>
      </div>

      {/* Script */}
      <Section icon={<FileText className="text-accent" />} title="Full Script">
        <div className="space-y-4">
          <ScriptBlock label="🎣 Hook" text={materials.script.hook} />
          <ScriptBlock label="📝 Body" text={materials.script.body} />
          <ScriptBlock label="📣 Call to Action" text={materials.script.cta} />
        </div>
      </Section>

      {/* Thumbnail */}
      <Section icon={<Image className="text-primary" />} title="Thumbnail Concept">
        <div className="space-y-3 text-sm">
          <InfoRow label="Text Overlay" value={materials.thumbnail.text} />
          <InfoRow label="Visual Idea" value={materials.thumbnail.visualIdea} />
          <InfoRow label="Color Palette" value={materials.thumbnail.colors} />
        </div>
      </Section>

      {/* Extras */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Section icon={<Hash className="text-primary" />} title="Hashtags">
          <div className="flex flex-wrap gap-2">
            {materials.hashtags.map((tag, i) => (
              <CopyChip key={i} text={`#${tag}`} />
            ))}
          </div>
        </Section>

        <Section icon={<Clock className="text-accent" />} title="Posting Info">
          <div className="space-y-2 text-sm">
            <InfoRow label="Best Time" value={materials.bestPostingTime} />
            <InfoRow label="Duration" value={materials.estimatedLength} />
          </div>
        </Section>
      </div>

      {/* Caption */}
      <Section icon={<Video className="text-primary" />} title="Post Caption">
        <CopyableBlock text={materials.postCaption} />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold text-foreground">{label}: </span>
      <span className="text-muted-foreground">{value}</span>
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

function CopyableBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground whitespace-pre-wrap">{text}</div>
      <button onClick={copy} className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function CopyChip({ text }: { text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${text}` });
  };

  return (
    <button
      onClick={copy}
      className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
    >
      {text}
    </button>
  );
}
