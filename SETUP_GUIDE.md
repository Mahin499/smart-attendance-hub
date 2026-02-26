# Quick Setup Guide - Smart Attendance Hub

Your app is now ready to work! Follow these steps to get it fully configured.

## ⚡ Option 1: Quick Start (Immediate - For Testing)

You can enter your Supabase credentials directly in the app:

1. **Open your deployed app**: https://smart-attendance-hub-rose.vercel.app
2. **You'll see the Setup page** asking for Supabase credentials
3. **Get your credentials**:
   - Go to https://app.supabase.com
   - Click your project
   - Click **Settings** (gear icon) → **API**
   - Copy `Project URL` and paste it as "Supabase Project URL"
   - Copy `anon public` key (NOT `service_role`) and paste as "Publishable Key"
4. **Click "Save and Continue"**
5. The app will reload with your credentials loaded from localStorage

✅ **You're done for testing!** The app will work immediately.

---

## 🚀 Option 2: Production Setup (Recommended for Permanent)

For a permanent, production-ready setup:

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Click your project: `smart-attendance-hub`
3. Go to **Settings** → **Environment Variables**
4. Add two new variables:
   - **Name**: `VITE_SUPABASE_URL`
     - **Value**: `https://xxx.supabase.co` (from Supabase → Settings → API → Project URL)
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY`
     - **Value**: `eyJ0e...` (from Supabase → Settings → API → anon key, NOT service_role)
5. **Save** the variables
6. Go to **Deployments** → Click the latest deployment → Click **Redeploy** at the top
7. Wait for it to finish (check the status)

### Step 2: Configure Google OAuth in Supabase (If Using Google Login)

1. Go to your Supabase project: https://app.supabase.com
2. Click **Authentication** → **Providers**
3. Find **Google** and click to enable it
4. You'll need Google OAuth credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URIs:
     - `https://smart-attendance-hub-rose.vercel.app/auth/v1/callback` (your Vercel domain)
     - `https://xxx.supabase.co/auth/v1/callback` (your Supabase project URL)
5. Copy Google **Client ID** and **Client Secret** → paste into Supabase
6. **Save**

### Step 3: Verify Database Schema

1. In Supabase, go to **SQL Editor**
2. Run all migration scripts in `supabase/migrations/` folder from your GitHub repo
3. Or use Supabase CLI:
   ```bash
   supabase db push
   ```

---

## 📋 Checklist

- [ ] Option 1: Can access app with temporary localStorage credentials? ✅
- [ ] Option 2: Added VITE_SUPABASE_URL env var to Vercel?
- [ ] Option 2: Added VITE_SUPABASE_PUBLISHABLE_KEY env var to Vercel?
- [ ] Option 2: Redeployed Vercel after adding env vars?
- [ ] Google OAuth credentials added to Supabase (if using)?
- [ ] Database migrations run in Supabase?

---

## 🔧 How It Works

### Before (Not Working)
- App loads → Supabase client missing credentials → Error: "Missing required Supabase configuration"

### After (Now Working)
1. **First time**: Setup page asks for credentials → stores in localStorage → app loads
2. **Every visit**: App checks for stored credentials → uses them to load normally
3. **Once you set Vercel env vars**: Redeploy → app uses env vars instead of localStorage automatically

---

## 🛑 Troubleshooting

### "Still seeing setup page after entering credentials"
- Click **Save and Continue** again
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and try again

### "Login not working"
- Check that Supabase URL and key are correct
- Verify in Supabase that your project is active
- Check browser console (F12) for error messages

### "Google Sign-In not working"
- Ensure Google OAuth is enabled in Supabase → Authentication → Providers
- Verify Google OAuth credentials are correct
- Check redirect URIs include your Vercel domain

### "Database tables don't exist"
- Run migrations: In Supabase SQL Editor, copy & run SQL from `supabase/migrations/`
- Or use: `cd smart-attendance-hub && supabase db push`

---

## 📚 Additional Resources

- [Supabase Setup Docs](GOOGLE_AUTH_SETUP.md)
- [Full README](README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## ✅ What's Next

Once setup is complete:

1. **Access app**: https://smart-attendance-hub-rose.vercel.app
2. **Create account**: Use email/password OR "Sign in with Google"
3. **Set up role**: First user should set up as Principal, then create faculty registration codes
4. **Add students**: Use Faculty Management or Student Management pages
5. **Start tracking**: Use LiveAttendance page for real-time face recognition

---

**Questions?** Check the error message on the page or open browser console (F12) to see detailed logs.

**Version**: 1.0.0  
**Last Updated**: February 26, 2026
