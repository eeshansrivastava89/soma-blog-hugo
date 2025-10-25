// Supabase Edge Function to receive PostHog webhooks
// Deploy this to: Supabase Dashboard → Edge Functions → Create new function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse PostHog webhook payload
    const payload = await req.json()

    // PostHog webhook structure: { event: {...}, person: {...}, groups: {...}, project: {...} }
    const eventPayload = payload.event

    console.log('Received PostHog webhook:', {
      event: eventPayload.event,
      distinct_id: eventPayload.distinct_id,
      timestamp: eventPayload.timestamp
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract event data from PostHog webhook
    const eventData = {
      uuid: eventPayload.uuid,
      event: eventPayload.event,
      distinct_id: eventPayload.distinct_id,
      timestamp: eventPayload.timestamp,
      properties: eventPayload.properties || {},
      session_id: eventPayload.properties?.$session_id || null,
      window_id: eventPayload.properties?.$window_id || null,
    }

    // Insert into posthog_events table
    const { data, error } = await supabase
      .from('posthog_events')
      .insert([eventData])
      .select()

    if (error) {
      console.error('Error inserting event:', error)

      // If error is due to duplicate uuid, that's OK (idempotent)
      if (error.code === '23505') { // PostgreSQL unique violation
        console.log('Event already exists (duplicate uuid), skipping')
        return new Response(
          JSON.stringify({ status: 'ok', message: 'duplicate event skipped' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

      throw error
    }

    console.log('Successfully inserted event:', data)

    return new Response(
      JSON.stringify({ status: 'ok', inserted: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)

    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
