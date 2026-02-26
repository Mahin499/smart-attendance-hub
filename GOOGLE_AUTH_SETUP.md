# Google Authentication Setup Guide

## Overview
Google OAuth authentication has been successfully integrated into the Smart Attendance Hub application. This guide explains how to configure Google OAuth in Supabase and test the authentication flow.

## Changes Made

### 1. Updated Authentication Context
**File:** [src/lib/auth-context.tsx](src/lib/auth-context.tsx)
- Replaced Lovable custom OAuth implementation with Supabase's native `signInWithOAuth` method
- Google sign-in now uses: `supabase.auth.signInWithOAuth({ provider: "google", ... })`
- Properly handles redirects to `/dashboard` after successful authentication

### 2. Enhanced Supabase Client Configuration
**File:** [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
- Added `detectSessionInUrl: true` - automatically handles OAuth redirects
- Added `flowType: 'pkce'` - enables PKCE (Proof Key for Code Exchange) for better security

### 3. Login UI Component
**File:** [src/pages/Login.tsx](src/pages/Login.tsx)
- Google sign-in button is already integrated on the login page
- Uses proper Google SVG icon
- Integrated with the authentication context

### 4. Environment Configuration Template
**File:** [.env.example](.env.example)
- Created example environment variables file
- Documents required Supabase configuration

## Setting Up Google OAuth in Supabase

### Step 1: Create a Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials:
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8080` (for local development)
     - `https://yourapp.com` (replace with your production domain)
     - `https://[project-ref].supabase.co/auth/v1/callback` (Supabase callback URL)
5. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find and enable **Google**
4. Paste the Google OAuth **Client ID** and **Client Secret**
5. Save the configuration

### Step 3: Set Environment Variables
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Testing Google Authentication

### Local Testing (Development)

1. **Start the development server:**
   ```bash
   npm install
   npm run dev
   ```
   The application will be available at `http://localhost:8080`

2. **Test the Login Page:**
   - Navigate to the login page
   - You should see a "Sign in with Google" button below the password login form
   - Click the button to initiate Google OAuth flow

3. **Google OAuth Flow:**
   - You'll be redirected to Google's login page
   - Sign in with a Google account
   - Grant the required permissions
   - You'll be redirected back to the application at `/dashboard`

4. **User Profile Creation:**
   - On first sign-in, a user profile is created in the database
   - The system will attempt to assign a role (principal/faculty)
   - If no role exists, you need to manually assign one via database or use the registration flow

### Testing the Full Authentication Flow

1. **Email/Password Login:**
   - Use the "Sign In" tab
   - Enter email and password
   - Verify dashboard access

2. **Google Sign-In:**
   - Click "Sign in with Google"
   - Complete the Google OAuth flow
   - Verify you're redirected to dashboard

3. **Registration with Code:**
   - Use the "Register" tab
   - Enter a valid registration code
   - Complete registration
   - Sign in with the new account

4. **Logout:**
   - From the dashboard, logout should return you to login page
   - Try signing in again with Google

## Troubleshooting

### "Invalid redirect URI" Error
- Ensure the redirect URI in Google Cloud Console matches your Supabase callback URL
- For local development, use `http://localhost:8080`
- For production, use your actual domain

### Google Sign-In Button Not Appearing
- Clear browser cache and local storage
- Ensure JavaScript is enabled
- Check browser console for errors (F12 → Console tab)

### Redirect Loop
- Verify `detectSessionInUrl: true` is set in Supabase client config
- Check that environment variables are correctly set
- Ensure Supabase API keys are correct

### User Not Created After Google Sign-In
- Verify the `profiles` table has the correct schema
- Check database triggers for auto-profile creation
- Review Supabase logs for detailed errors

## Production Deployment

Before deploying to production:

1. **Add Production Redirect URI:**
   - In Google Cloud Console: Add your production domain
   - In Supabase: Authorize the production domain

2. **Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://[your-project].supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

3. **Security:**
   - Never expose Client Secret in frontend code
   - Use environment variables for sensitive data
   - Enable HTTPS for all production URLs

## Technical Details

### PKCE Flow
- The configuration uses PKCE (Proof Key for Code Exchange) flow
- This is the recommended OAuth 2.0 flow for single-page applications
- More secure than implicit flow as it doesn't expose tokens in URLs

### Session Management
- Sessions are persisted in browser's localStorage
- Auto-refresh tokens enabled
- Session detection from URL enabled for OAuth redirects

### User Data
When a user signs in with Google:
1. Supabase creates/updates an auth user
2. User metadata (name, email) is synced from Google
3. Application fetches user profile from `profiles` table
4. User role is fetched from `user_roles` table
5. Complete user object is available in `useAuth()` context

## Next Steps

- [ ] Configure Google OAuth credentials
- [ ] Test local development
- [ ] Set up production environment
- [ ] Test Google sign-in entirely
- [ ] Monitor authentication logs in Supabase
- [ ] Implement role assignment after Google sign-in (currently returns null)

## Support
For issues or questions about Supabase OAuth:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
