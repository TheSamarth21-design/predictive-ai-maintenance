import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/twilio@0.3.0/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, alertType } = await req.json()

    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER")

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Initialize Twilio client
    const twilio = new Client({ accountSid, authToken })

    // Send SMS
    const result = await twilio.messages.create({
      from: twilioPhoneNumber,
      to: phoneNumber,
      body: `[${alertType.toUpperCase()}] ${message}`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.sid,
        status: result.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
