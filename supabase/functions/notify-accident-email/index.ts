import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { record } = await req.json();

    if (!record || !record.company_name) {
      return new Response(JSON.stringify({ error: 'Missing record data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find fleet managers in the same company
    const { data: managers, error: managersError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'fleet_manager');

    if (managersError || !managers) {
      throw new Error('Failed to fetch managers: ' + managersError?.message);
    }

    // Get profiles for these managers to filter by company and get emails
    const managerIds = managers.map(m => m.user_id);
    if (managerIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, company_name')
      .in('id', managerIds)
      .eq('company_name', record.company_name);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get emails from auth.users via admin API
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error('Failed to list users: ' + usersError.message);

    const profileIds = new Set(profiles.map(p => p.id));
    const targetUsers = users.filter(u => profileIds.has(u.id) && u.email);

    // Send emails
    const emailPromises = targetUsers.map(async (manager) => {
      const profile = profiles.find(p => p.id === manager.id);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'דליה מערכות <onboarding@resend.dev>',
          to: [manager.email],
          subject: `🚨 תאונה חדשה דווחה - רכב ${record.vehicle_plate || ''}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
              <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">🚨 דיווח תאונה חדש</h1>
              <p style="color: #333; font-size: 16px;">שלום ${profile?.full_name || 'מנהל'},</p>
              <p style="color: #333; font-size: 16px;">התקבל דיווח תאונה חדש במערכת דליה:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #666;">נהג</td>
                  <td style="padding: 10px;">${record.driver_name || '—'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #666;">רכב</td>
                  <td style="padding: 10px;">${record.vehicle_plate || '—'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #666;">מיקום</td>
                  <td style="padding: 10px;">${record.location || '—'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #666;">תיאור</td>
                  <td style="padding: 10px;">${record.description || '—'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #666;">עלות משוערת</td>
                  <td style="padding: 10px;">₪${(record.estimated_cost || 0).toLocaleString()}</td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px;">היכנס למערכת לפרטים נוספים וטיפול.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">הודעה זו נשלחה אוטומטית ממערכת דליה לניהול ציי רכב.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`Failed to send email to ${manager.email}: ${res.status} ${errBody}`);
      }
      return res;
    });

    await Promise.allSettled(emailPromises);

    return new Response(JSON.stringify({ sent: targetUsers.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
