import { motion } from "framer-motion";
import { Clock, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HistoryItem {
  id: string;
  niche: string;
  platform: string;
  style: string;
  created_at: string;
  content: any;
}

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export default function HistoryPanel({ items, onSelect, onDelete }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Clock className="mx-auto text-muted-foreground mb-2" size={24} />
        <p className="text-sm text-muted-foreground">No saved content yet. Generate your first ideas!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock size={16} /> History</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-muted-foreground transition-colors group cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.niche} · {item.platform}</p>
              <p className="text-xs text-muted-foreground">{item.style} · {new Date(item.created_at).toLocaleDateString()}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            >
              <Trash2 size={14} />
            </Button>
            <ChevronRight size={14} className="text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
