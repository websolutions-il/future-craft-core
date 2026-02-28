import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { email, password, full_name, role, action } = await req.json()

  if (action === 'update-password') {
    // Find user by email
    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
    if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 400 })
    const user = users.users.find(u => u.email === email)
    if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }

  // Create user
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, role }
  })

  if (createError) return new Response(JSON.stringify({ error: createError.message }), { status: 400 })

  if (role && role !== 'driver') {
    await supabaseAdmin.from('user_roles').update({ role }).eq('user_id', userData.user.id)
  }

  return new Response(JSON.stringify({ success: true, user_id: userData.user.id }), { status: 200 })
})
