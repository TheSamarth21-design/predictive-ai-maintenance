import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sensorData, columns } = await req.json();
    
    if (!sensorData || !Array.isArray(sensorData) || sensorData.length === 0) {
      return new Response(JSON.stringify({ error: "No sensor data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit data sent to AI to avoid token limits
    const dataSlice = sensorData.slice(0, 50);
    const totalRows = sensorData.length;

    const systemPrompt = `You are an expert industrial predictive maintenance AI for the SyncPlant system. You analyze machine sensor data (temperature, vibration, pressure, RPM, load, etc.) to predict failures, identify anomalies, and recommend maintenance actions.

Given the uploaded sensor data, provide a comprehensive analysis in the following JSON structure:
{
  "summary": "Brief overall assessment",
  "machines": [
    {
      "id": "machine identifier from data",
      "riskScore": 0-100,
      "status": "Normal|Warning|Critical",
      "predictedFailure": "description or null",
      "failureTimeframe": "e.g. '3-5 days' or null",
      "anomalies": ["list of detected anomalies"],
      "recommendations": ["maintenance actions to take"],
      "affectedParts": ["parts likely to fail"],
      "repairSteps": ["ordered repair steps if failure predicted"],
      "impactIfIgnored": "what happens if not maintained"
    }
  ],
  "overallRisk": 0-100,
  "costSavingsEstimate": "$X,XXX",
  "criticalAlerts": ["urgent items"],
  "patterns": ["historical patterns detected"]
}

Analyze sensor values against standard industrial thresholds:
- Temperature: Normal <70°C, Warning 70-85°C, Critical >85°C
- Vibration: Normal <0.3g, Warning 0.3-0.5g, Critical >0.5g
- Pressure: Normal 100-120 PSI, Warning 120-135 PSI, Critical >135 PSI
- RPM: Check for unusual fluctuations
- Load: Warning >85%, Critical >95%

Be specific, actionable, and realistic in your analysis.`;

    const userPrompt = `Analyze this sensor data (${totalRows} total rows, showing first ${dataSlice.length}):

Columns detected: ${columns.join(", ")}

Data:
${JSON.stringify(dataSlice, null, 2)}

Provide predictive maintenance analysis with failure predictions, risk scores, and repair recommendations.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "predictive_analysis",
              description: "Return structured predictive maintenance analysis",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  machines: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        riskScore: { type: "number" },
                        status: { type: "string", enum: ["Normal", "Warning", "Critical"] },
                        predictedFailure: { type: "string" },
                        failureTimeframe: { type: "string" },
                        anomalies: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        affectedParts: { type: "array", items: { type: "string" } },
                        repairSteps: { type: "array", items: { type: "string" } },
                        impactIfIgnored: { type: "string" },
                      },
                      required: ["id", "riskScore", "status", "anomalies", "recommendations"],
                    },
                  },
                  overallRisk: { type: "number" },
                  costSavingsEstimate: { type: "string" },
                  criticalAlerts: { type: "array", items: { type: "string" } },
                  patterns: { type: "array", items: { type: "string" } },
                },
                required: ["summary", "machines", "overallRisk", "criticalAlerts", "patterns"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "predictive_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add funds in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try to parse from content
      const content = aiResult.choices?.[0]?.message?.content || "";
      try {
        analysis = JSON.parse(content);
      } catch {
        analysis = { summary: content, machines: [], overallRisk: 0, criticalAlerts: [], patterns: [] };
      }
    }

    return new Response(JSON.stringify({ analysis, rowsAnalyzed: totalRows }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-sensor-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
