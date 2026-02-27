import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { email, password, full_name, role } = await req.json()

  // Create user
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role }
  })

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 })
  }

  // Update role to super_admin (trigger sets default, we override)
  if (role && role !== 'driver') {
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .update({ role })
      .eq('user_id', userData.user.id)

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), { status: 400 })
    }
  }

  return new Response(JSON.stringify({ success: true, user_id: userData.user.id }), { status: 200 })
})
