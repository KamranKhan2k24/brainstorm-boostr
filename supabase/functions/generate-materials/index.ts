import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, platform, style, audience, selectedIdea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist and scriptwriter. Create detailed, production-ready content materials. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: `Create full production materials for this video idea:

Title: "${selectedIdea.title}"
Description: "${selectedIdea.description}"

Context:
- Niche: ${niche}
- Platform: ${platform}
- Target Audience: ${audience}
- Content Style: ${style}

Return a JSON object with this EXACT structure:
{
  "script": {
    "hook": "An attention-grabbing opening (2-3 sentences) that stops the scroll",
    "body": "The main content (4-6 paragraphs) with storytelling, value, and engagement hooks. Include scene directions in [brackets].",
    "cta": "A compelling call-to-action (2-3 sentences)"
  },
  "thumbnail": {
    "text": "Bold text overlay for the thumbnail (max 5 words)",
    "visualIdea": "Detailed description of the visual composition, subject positioning, and expression",
    "colors": "Suggested color palette with 3-4 hex codes and their usage"
  },
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "postCaption": "A compelling post caption/description optimized for ${platform} (2-3 sentences with emojis)",
  "bestPostingTime": "Recommended posting time and day for maximum reach",
  "estimatedLength": "Recommended video duration for this content"
}

Rules:
- Script should use proven storytelling frameworks
- Thumbnail must be designed for maximum click-through rate
- Make everything platform-specific for ${platform}
- ONLY return the JSON object, no markdown or extra text`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-materials error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
