import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { driver_name, customer_name, company_name, scheduled_date, scheduled_time, vehicle_plate, location, notes } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        driver_name,
        customer_name,
        company_name,
        scheduled_date,
        scheduled_time,
        vehicle_plate: vehicle_plate || null,
        location: location || null,
        notes: notes || `תיאום איסוף רכב - נקבע אוטומטית בשיחה קולית`,
        title: 'איסוף רכב מהלקוח',
        status: 'pending',
        priority: 'medium',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, work_order_id: data.id, message: `נקבע ל-${scheduled_date} בשעה ${scheduled_time}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
