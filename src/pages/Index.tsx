import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import AuthModal from "@/components/AuthModal";
import GeneratorForm from "@/components/GeneratorForm";
import IdeasDisplay, { VideoIdea } from "@/components/IdeasDisplay";
import MaterialsDisplay, { GeneratedMaterials } from "@/components/MaterialsDisplay";
import HistoryPanel, { HistoryItem } from "@/components/HistoryPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

type Step = "form" | "ideas" | "materials";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [materials, setMaterials] = useState<GeneratedMaterials | null>(null);
  const [formParams, setFormParams] = useState<{ niche: string; platform: string; style: string; audience: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadHistory();
    else setHistory([]);
  }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("generated_content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as HistoryItem[]);
  };

  const handleGenerateIdeas = useCallback(async (params: { niche: string; platform: string; style: string; audience: string }) => {
    setFormParams(params);
    setLoadingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", { body: params });
      if (error) throw error;
      setIdeas(data.ideas || []);
      setStep("ideas");
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingIdeas(false);
    }
  }, []);

  const handleSelectIdea = useCallback(async (idea: VideoIdea) => {
    if (!formParams) return;
    setSelectedIdea(idea);
    setLoadingMaterials(true);
    setStep("materials");
    try {
      const { data, error } = await supabase.functions.invoke("generate-materials", {
        body: { ...formParams, selectedIdea: idea },
      });
      if (error) throw error;
      setMaterials(data as GeneratedMaterials);

      // Save to history if logged in
      if (user) {
        await supabase.from("generated_content").insert({
          user_id: user.id,
          niche: formParams.niche,
          platform: formParams.platform,
          style: formParams.style,
          audience: formParams.audience,
          content: { selectedIdea: idea, materials: data },
        });
        loadHistory();
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
      setStep("ideas");
    } finally {
      setLoadingMaterials(false);
    }
  }, [formParams, user]);

  const handleRegenerateMaterials = useCallback(() => {
    if (selectedIdea) handleSelectIdea(selectedIdea);
  }, [selectedIdea, handleSelectIdea]);

  const handleDelete = async (id: string) => {
    await supabase.from("generated_content").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast({ title: "Deleted" });
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const content = item.content as any;
    if (content?.selectedIdea && content?.materials) {
      setSelectedIdea(content.selectedIdea);
      setMaterials(content.materials);
      setStep("materials");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} onLogout={() => supabase.auth.signOut()} onLogin={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="text-gradient">AI-Powered</span> Content Ideas
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Generate viral video ideas, pick your favorite, then get a full script, thumbnail concept, and posting strategy.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === "form" && (
              <GeneratorForm onGenerate={handleGenerateIdeas} isLoading={loadingIdeas} />
            )}

            {step === "ideas" && (
              <IdeasDisplay
                ideas={ideas}
                onSelect={handleSelectIdea}
                isLoading={loadingMaterials}
                onRegenerate={() => formParams && handleGenerateIdeas(formParams)}
              />
            )}

            {step === "materials" && materials && selectedIdea && (
              <MaterialsDisplay
                ideaTitle={selectedIdea.title}
                materials={materials}
                onBack={() => setStep("ideas")}
                onRegenerate={handleRegenerateMaterials}
                isLoading={loadingMaterials}
              />
            )}

            {step === "materials" && !materials && (
              <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground text-sm">Generating full materials for your idea...</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <HistoryPanel items={history} onSelect={handleHistorySelect} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
}
