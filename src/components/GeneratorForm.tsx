import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NICHES = ["Tech", "Motivation", "Fitness", "Finance", "Gaming", "Cooking", "Travel", "Education", "Comedy", "Lifestyle"];
const PLATFORMS = ["YouTube", "Instagram Reels", "YouTube Shorts", "TikTok"];
const STYLES = ["Educational", "Storytelling", "Viral / Trend", "How-To", "Listicle", "Behind the Scenes"];
const AUDIENCES = ["Gen Z (13-24)", "Millennials (25-40)", "Gen X (41-56)", "Broad Audience"];

interface GeneratorFormProps {
  onGenerate: (data: { niche: string; platform: string; style: string; audience: string }) => void;
  isLoading: boolean;
}

export default function GeneratorForm({ onGenerate, isLoading }: GeneratorFormProps) {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");

  const canSubmit = niche && platform && style && audience && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Configure Your Content</h2>
        <p className="text-sm text-muted-foreground">Tell us about your niche and audience to generate tailored ideas.</p>
      </div>

      <div className="space-y-5">
        <FieldGroup label="Niche" options={NICHES} value={niche} onChange={setNiche} />
        <FieldGroup label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />
        <FieldGroup label="Content Style" options={STYLES} value={style} onChange={setStyle} />
        <FieldGroup label="Target Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
      </div>

      <Button
        variant="glow"
        size="lg"
        className="w-full"
        disabled={!canSubmit}
        onClick={() => onGenerate({ niche, platform, style, audience })}
      >
        {isLoading ? (
          <><Loader2 className="animate-spin" /> Generating...</>
        ) : (
          <><Sparkles /> Generate Content Ideas</>
        )}
      </Button>
    </motion.div>
  );
}

function FieldGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              value === opt
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
