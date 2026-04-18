const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const FROM_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { to, agentId, message } = body;

    if (!to || typeof to !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Phone number (to) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize Israeli phone (05X-XXXXXXX → +9725X-XXXXXXX)
    let normalizedTo = to.replace(/[\s-]/g, '');
    if (normalizedTo.startsWith('0')) {
      normalizedTo = '+972' + normalizedTo.slice(1);
    } else if (!normalizedTo.startsWith('+')) {
      normalizedTo = '+' + normalizedTo;
    }

    // Escape XML special characters to prevent TwiML parse failures
    const escapeXml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    // Build TwiML. Use Google's Hebrew voice (Polly.Carmit was deprecated by Twilio).
    let twiml: string;
    if (agentId) {
      const safeMsg = escapeXml(message || 'שלום, מתקשר אליך סוכן AI לתיאום פגישה');
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="he-IL" voice="Google.he-IL-Standard-A">${safeMsg}</Say>
  <Pause length="2"/>
  <Say language="he-IL" voice="Google.he-IL-Standard-A">לחיבור מלא לסוכן הקולי, יש להגדיר מספר טוויליו בתוך ElevenLabs.</Say>
</Response>`;
    } else {
      const safeMsg = escapeXml(message || 'שלום, זוהי שיחת בדיקה ממערכת ניהול הצי');
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="he-IL" voice="Google.he-IL-Standard-A">${safeMsg}</Say>
</Response>`;
    }

    const auth = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
    const formData = new URLSearchParams({
      To: normalizedTo,
      From: FROM_NUMBER,
      Twiml: twiml,
    });

    const twRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data = await twRes.json();

    if (!twRes.ok) {
      console.error('Twilio error:', twRes.status, data);
      return new Response(
        JSON.stringify({ error: 'Twilio call failed', details: data }),
        { status: twRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        callSid: data.sid,
        status: data.status,
        to: normalizedTo,
        from: FROM_NUMBER,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
