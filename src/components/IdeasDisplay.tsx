import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VideoIdea {
  title: string;
  description: string;
}

interface IdeasDisplayProps {
  ideas: VideoIdea[];
  onSelect: (idea: VideoIdea) => void;
  isLoading: boolean;
  onRegenerate: () => void;
}

export default function IdeasDisplay({ ideas, onSelect, isLoading, onRegenerate }: IdeasDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-foreground">Pick a Video Idea</h2>
        </div>
        <Button variant="subtle" size="sm" onClick={onRegenerate} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Regenerate"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Select one idea below to generate a full script, thumbnail concept, and more.</p>

      <div className="space-y-3">
        {ideas.map((idea, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => !isLoading && onSelect(idea)}
            disabled={isLoading}
            className="w-full text-left flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm mb-1">{idea.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{idea.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
