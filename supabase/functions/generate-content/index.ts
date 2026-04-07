import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, platform, style, audience } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert content strategist and viral content creator. You specialize in creating platform-specific content that maximizes engagement. Always respond with valid JSON matching the exact schema requested.`;

    const userPrompt = `Generate content ideas for a ${niche} content creator on ${platform}.
Target audience: ${audience}
Content style: ${style}

Return a JSON object with this EXACT structure:
{
  "videoIdeas": ["idea1", "idea2", "idea3", "idea4", "idea5"],
  "script": {
    "hook": "An attention-grabbing opening line (2-3 sentences) that stops the scroll",
    "body": "The main content (4-6 paragraphs) with storytelling, value, and engagement hooks",
    "cta": "A compelling call-to-action (2-3 sentences)"
  },
  "thumbnail": {
    "text": "Bold text overlay for the thumbnail",
    "visualIdea": "Description of the visual composition",
    "colors": "Suggested color palette with hex codes"
  }
}

Rules:
- Video ideas must be specific, actionable, and optimized for ${platform}
- Each idea should have a compelling hook angle
- Script should use proven storytelling frameworks
- Thumbnail must be designed for maximum click-through rate
- Make content trendy and shareable
- ONLY return the JSON object, no markdown or extra text`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from the response, handling potential markdown wrapping
    let parsed;
    try {
      const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
