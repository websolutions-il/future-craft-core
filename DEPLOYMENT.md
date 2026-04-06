# Deployment Guide — future-craft-core
## Hostinger VPS + Supabase + dalia-car.online

---

## Architecture Overview

```
GitHub (main branch)
       │
       ▼ push triggers
GitHub Actions
  → npm install + build
  → rsync dist/ → VPS
  → nginx reload
       │
       ▼
Hostinger VPS — https://dalia-car.online
  Nginx serves /var/www/future-craft-core/
       │
       ▼
Supabase Cloud (project: qasomfndnjuixgjmjwcm)
  + 8 Edge Functions (deployed)
  + Storage bucket: documents
```

---

## Step 1 — Point DNS to your VPS

In your **Hostinger hPanel → Domains → dalia-car.online → DNS Zone**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `72.60.36.182` | 300 |
| A | www | `72.60.36.182` | 300 |

> Find your VPS IP in **hPanel → VPS → Manage → Overview**.
> DNS propagation takes 5–30 minutes.

---

## Step 2 — Prepare the VPS

SSH into your Hostinger VPS:

```bash
ssh root@72.60.36.182
```

Upload and run the setup script (run once):

```bash
# On your LOCAL machine:
scp vps-setup.sh nginx.conf root@72.60.36.182:~/

# On the VPS:
bash ~/vps-setup.sh
```

This installs Nginx + Certbot, creates the web root, and automatically gets the SSL certificate for `dalia-car.online`.

---

## Step 3 — Create SSH Deploy Key for GitHub Actions

On the VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy   # Copy this — you'll need it next
```

---

## Step 4 — Add GitHub Repository Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret Name | Value |
|---|---|
| `VPS_HOST` | Your VPS IP (e.g. `123.45.67.89`) |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Private key from Step 3 (full content) |
| `VITE_SUPABASE_URL` | `https://qasomfndnjuixgjmjwcm.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc29tZm5kbmp1aXhnam1qd2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDY3MTMsImV4cCI6MjA5MDM4MjcxM30.52KlgpHd4RCO2DnT1_Hoz4bCOWFTeQw7FwDIRxEKr6I` |
| `VITE_SUPABASE_PROJECT_ID` | `qasomfndnjuixgjmjwcm` |

---

## Step 5 — Update Supabase Auth URLs

Go to: **[Supabase Dashboard](https://supabase.com/dashboard/project/qasomfndnjuixgjmjwcm/auth/url-configuration)**

Set:
- **Site URL** → `https://dalia-car.online`
- **Redirect URLs** → add `https://dalia-car.online/**` and `https://www.dalia-car.online/**`

---

## Step 6 — Deploy!

```bash
git add .
git commit -m "deploy: configure dalia-car.online production deployment"
git push origin main
```

Track progress at: `https://github.com/websolutions-il/future-craft-core/actions`

Once done, visit **https://dalia-car.online** ✅

---

## Supabase Project Details

| Key | Value |
|---|---|
| Project | `dalia-new` |
| Project ID | `qasomfndnjuixgjmjwcm` |
| Region | ap-south-1 |
| URL | `https://qasomfndnjuixgjmjwcm.supabase.co` |
| Storage bucket | `documents` (public) |
| Edge Functions | 8 deployed & ACTIVE |

### Edge Function Secrets needed (set in Supabase Dashboard):
- `RESEND_API_KEY` ✅ already set
- `PAYPAL_CLIENT_ID` ⚠️ add if using PayPal
- `PAYPAL_SECRET` ⚠️ add if using PayPal

---

## SSL Renewal

Certbot auto-renews Let's Encrypt certificates. No action needed.
To manually test renewal: `certbot renew --dry-run`

---

## Troubleshooting

**Blank page / routing issues:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

**SSL certificate issues:**
```bash
certbot --nginx -d dalia-car.online -d www.dalia-car.online
```

**Build fails in GitHub Actions:**
Check that all 6 secrets are set correctly in GitHub repo settings.

**Cannot SSH from GitHub Actions:**
```bash
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```
