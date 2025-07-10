import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN");
    if (!HF_API_TOKEN) {
      console.error("HF_API_TOKEN not set in environment");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: HF_API_TOKEN is not set.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { text = "", voice = "ef_dora", speed = 1.0, split_pattern } = await req.json();
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "'text' field is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = {
      inputs: text,
      parameters: { voice, speed, ...(split_pattern && { split_pattern }) },
    };

    const res = await fetch(
      "https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const errorBody = await res.json();
      console.error("Hugging Face API Error:", errorBody);
      return new Response(JSON.stringify(errorBody), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const wav = await res.arrayBuffer();
    return new Response(wav, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (e) {
    console.error("Internal Function Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
