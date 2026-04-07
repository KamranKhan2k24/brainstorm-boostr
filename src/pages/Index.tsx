import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import AuthModal from "@/components/AuthModal";
import GeneratorForm from "@/components/GeneratorForm";
import ResultsDisplay, { GeneratedContent } from "@/components/ResultsDisplay";
import HistoryPanel, { HistoryItem } from "@/components/HistoryPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastParams, setLastParams] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Load history when user changes
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

  const handleGenerate = useCallback(async (params: { niche: string; platform: string; style: string; audience: string }) => {
    setLastParams(params);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", { body: params });
      if (error) throw error;
      setResult(data as GeneratedContent);

      // Save to history if logged in
      if (user) {
        await supabase.from("generated_content").insert({
          user_id: user.id,
          niche: params.niche,
          platform: params.platform,
          style: params.style,
          audience: params.audience,
          content: data,
        });
        loadHistory();
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("generated_content").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast({ title: "Deleted" });
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
            Generate viral video ideas, full scripts, and thumbnail concepts tailored to your niche and audience.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GeneratorForm onGenerate={handleGenerate} isLoading={loading} />
            {result && (
              <ResultsDisplay
                content={result}
                onRegenerate={() => lastParams && handleGenerate(lastParams)}
                isLoading={loading}
              />
            )}
          </div>
          <div>
            <HistoryPanel items={history} onSelect={(item) => setResult(item.content)} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
}
