# Multi-Authentication Setup Guide

This guide explains how to set up multiple OAuth providers (Google, GitHub, Microsoft, Discord) for the Smart Attendance Hub application.

## Prerequisites

- Supabase project (https://supabase.com)
- Google Cloud Console project: https://console.cloud.google.com/welcome?project=smart-attendance-487914
- (Optional) GitHub, Microsoft Azure, Discord developer accounts

---

## 1. Google OAuth Setup

### Step 1: Configure Google Cloud Console

1. Go to **Google Cloud Console** → Your Project (smart-attendance-487914)
2. Click on **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client ID**
4. Choose **Web Application**
5. Add Authorized Redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback` (for local dev)
   - `https://your-deployed-domain.com/auth/v1/callback` (for production)
6. Copy **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** (or Auth) → **Providers**
3. Find **Google** and enable it
4. Paste **Client ID** and **Client Secret** from Google Cloud
5. Save

### Testing Google OAuth

- Navigate to login page
- Click **Google** button
- You should be redirected to Google login
- After successful login, you'll be redirected to `/dashboard`

---

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to **GitHub Settings** → **Developer Settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Smart Attendance Hub
   - **Homepage URL**: `https://your-domain.com` or `http://localhost:5173`
   - **Authorization callback URL**: `https://your-supabase-project.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **GitHub** and enable it
3. Paste **Client ID** and **Client Secret**
4. Save

---

## 3. Microsoft/Azure OAuth Setup

### Step 1: Register App in Azure

1. Go to **Azure Portal** → **App registrations**
2. Click **New registration**
3. Enter **Name**: Smart Attendance Hub
4. Select **Supported account types**: Accounts in any organizational directory
5. Set **Redirect URI**: `https://your-supabase-project.supabase.co/auth/v1/callback`
6. Click **Register**
7. Go to **Certificates & secrets** → **New client secret**
8. Copy the secret value and ID

### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Azure** and enable it
3. Paste **Client ID** (Application ID) and **Client Secret**
4. Save

---

## 4. Discord OAuth Setup

### Step 1: Create Discord Application

1. Go to **Discord Developer Portal** → **Applications**
2. Click **New Application**
3. Enter **Name**: Smart Attendance Hub
4. Go to **OAuth2** → **General**
5. Copy **Client ID**
6. Scroll to **Client Secret** and click **Regenerate**, then copy it
7. Go to **redirects** and add:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
8. Save changes

### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Discord** and enable it
3. Paste **Client ID** and **Client Secret**
4. Save

---

## Verifying OAuth Configuration

### For Local Development

1. Update your `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Test all OAuth providers on the login page

### For Production

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. Ensure redirect URIs in **all OAuth providers** include your production domain

3. Deploy and test login with each provider

---

## Troubleshooting

### "Invalid redirect URI" Error

- Check that your redirect URI in each OAuth provider matches exactly
- Ensure the Supabase callback URL is included: `/auth/v1/callback`

### Login Redirects to Blank Page

- Verify environment variables are set correctly
- Check browser console for specific error messages
- Confirm OAuth app is enabled in Supabase

### Provider Not Showing on Login Page

- Verify the provider is **enabled** in Supabase Authentication settings
- Clear browser cache and reload
- Check that auth context exports the sign-in method

---

## User Flow

1. User clicks an OAuth provider button
2. Redirected to provider's login page
3. User logs in with their provider account
4. Redirected back to your app (callback URL)
5. User profile automatically created in Supabase
6. User directed to role selection (`/setup`) if this is first login
7. User can proceed to dashboard

---

## Security Notes

- Keep **Client Secrets** private — never commit them
- Use environment variables for all sensitive credentials
- Always use HTTPS in production
- Regularly rotate secrets for active applications
- Monitor OAuth provider documentation for updates

---

## Support

For issues with specific OAuth providers:

- **Google**: https://developers.google.com/identity/protocols/oauth2
- **GitHub**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Microsoft Azure**: https://docs.microsoft.com/en-us/azure/active-directory/develop/
- **Discord**: https://discord.com/developers/docs/topics/oauth2

For Supabase OAuth setup:
- https://supabase.com/docs/guides/auth/social-auth
