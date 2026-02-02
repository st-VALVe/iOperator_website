import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Config API Edge Function
 * 
 * Provides bot configuration (system prompt, business settings) to authenticated bots.
 * 
 * Authentication: Bearer token with API key (hashed with SHA-256 in bot_api_keys table)
 * 
 * Response:
 * - systemPrompt: Active prompt from prompt_templates
 * - promptVersion: Version number of the prompt
 * - promptUpdatedAt: Last update timestamp
 * - businessProfile: Business settings (name, working hours, etc.)
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the API key and look it up
    const apiKeyHash = await hashApiKey(apiKey);
    
    const { data: keyData, error: keyError } = await supabase
      .from("bot_api_keys")
      .select("business_id, revoked_at")
      .eq("api_key_hash", apiKeyHash)
      .single();

    if (keyError || !keyData) {
      console.log("API key lookup failed:", keyError?.message || "No matching key");
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (keyData.revoked_at) {
      return new Response(
        JSON.stringify({ error: "API key has been revoked" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const businessId = keyData.business_id;

    // Update last_used_at
    await supabase
      .from("bot_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("api_key_hash", apiKeyHash);

    // Fetch active prompt template
    const { data: promptData, error: promptError } = await supabase
      .from("prompt_templates")
      .select("content, version, updated_at")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .single();

    if (promptError || !promptData) {
      console.log("Prompt lookup failed:", promptError?.message || "No active prompt");
      return new Response(
        JSON.stringify({ error: "No active prompt found for business" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch business profile (optional)
    const { data: businessData } = await supabase
      .from("business_profiles")
      .select("name, working_hours, settings")
      .eq("id", businessId)
      .single();

    // Build response
    const response = {
      systemPrompt: promptData.content,
      promptVersion: promptData.version,
      promptUpdatedAt: promptData.updated_at,
      businessProfile: businessData ? {
        name: businessData.name,
        workingHours: businessData.working_hours,
        settings: businessData.settings
      } : undefined
    };

    console.log("Config API success for business:", businessId, "prompt version:", promptData.version);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Config API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Hash API key using SHA-256
 * Must match the hashing used when storing keys in bot_api_keys table
 */
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
