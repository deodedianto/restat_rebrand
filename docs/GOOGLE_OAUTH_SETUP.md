# Google OAuth Setup Guide for Supabase

This guide walks you through setting up "Continue with Google" authentication for your ReStat application using Supabase.

## Prerequisites

- Supabase project created and configured
- Google Cloud Console account
- Your application running (to get the callback URL)

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create or Select a Project

1. Click the project dropdown at the top
2. Click "NEW PROJECT" or select an existing project
3. If creating new:
   - Enter project name (e.g., "ReStat")
   - Click "CREATE"

### 1.3 Enable Google+ API (Optional but Recommended)

1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### 1.4 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization)
3. Click "CREATE"

4. Fill in the required information:
   - **App name**: ReStat
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - Click "SAVE AND CONTINUE"

5. Scopes (click "SAVE AND CONTINUE" - no changes needed)

6. Test users (add your email for testing)
   - Click "ADD USERS"
   - Add your test email addresses
   - Click "SAVE AND CONTINUE"

7. Summary - Review and click "BACK TO DASHBOARD"

### 1.5 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: ReStat Web Client
5. **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

6. **Authorized redirect URIs**:
   - Get your Supabase callback URL from Step 2.2 below
   - Example: `https://your-project-id.supabase.co/auth/v1/callback`

7. Click "CREATE"

8. **IMPORTANT**: Copy your credentials:
   - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)
   - Save these securely - you'll need them in Step 2

## Step 2: Configure Supabase

### 2.1 Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Authentication** > **Providers**

### 2.2 Get Your Callback URL

1. In the Providers page, you'll see:
   ```
   Callback URL (for OAuth): https://your-project-id.supabase.co/auth/v1/callback
   ```
2. **Copy this URL** - you need it for Step 1.5 above

### 2.3 Enable Google Provider

1. Find "Google" in the list of providers
2. Toggle it to **Enabled**
3. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Step 1.5
   - **Client Secret**: Paste from Step 1.5
4. Click "SAVE"

### 2.4 Configure Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)
4. Click "SAVE"

## Step 3: Update Google Cloud Console with Supabase Callback

**IMPORTANT**: Go back to Google Cloud Console and add the Supabase callback URL:

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
4. Click "SAVE"

## Step 4: Test the Integration

### 4.1 Start Your Application

```bash
npm run dev
```

### 4.2 Test Login Flow

1. Go to `http://localhost:3000/login`
2. Click "Lanjutkan dengan Google"
3. You should be redirected to Google sign-in
4. Select your Google account
5. Grant permissions
6. You should be redirected back to your app at `/auth/callback`
7. After processing, you should land on `/dashboard`

### 4.3 Verify User Creation

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. You should see your new user with:
   - Email from Google
   - Auth provider: "google"
   - Created timestamp

3. Go to **Table Editor** > **users** table
4. Verify a user profile was created with:
   - Same ID as auth user
   - Email populated
   - Role: "user"

## Step 5: Production Deployment

Before deploying to production:

### 5.1 Update Google Cloud Console

1. Add production URLs to **Authorized JavaScript origins**:
   ```
   https://your-domain.com
   ```

2. Add production redirect URI:
   ```
   https://your-domain.com/auth/callback
   ```

### 5.2 Update Supabase

1. In **Authentication** > **URL Configuration**
2. Update Site URL to your production domain
3. Add production callback URL

### 5.3 Environment Variables

Ensure your hosting platform (Vercel, Netlify) has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The callback URL doesn't match what's registered in Google Cloud Console.

**Fix**:
1. Check the error message for the exact redirect URI being used
2. Add it to Google Cloud Console > Credentials > Authorized redirect URIs
3. Make sure there are no trailing slashes or typos

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not properly configured.

**Fix**:
1. Go to Google Cloud Console > OAuth consent screen
2. Add your email to test users
3. Make sure app is not in "Testing" mode (or add yourself as test user)

### User created but no profile in users table

**Cause**: The callback handler might have failed to create the profile.

**Fix**:
1. Check browser console for errors
2. Check Supabase logs in Dashboard > **Logs**
3. Verify RLS policies allow user creation
4. Check the callback page code at `/app/auth/callback/page.tsx`

### "Invalid login credentials" after OAuth

**Cause**: Session not properly created after OAuth.

**Fix**:
1. Clear browser cookies and localStorage
2. Try again
3. Check Supabase Dashboard > **Authentication** > **Users** to see if user was created
4. If user exists, try regular email login to verify account works

### Google button does nothing when clicked

**Cause**: JavaScript error or missing environment variables.

**Fix**:
1. Open browser DevTools console
2. Look for errors
3. Verify `.env.local` file exists with Supabase credentials
4. Restart dev server after creating `.env.local`

## Security Best Practices

1. **Never commit** your Google Client Secret or Supabase keys to version control
2. Use **environment variables** for all secrets
3. Enable **Email verification** in Supabase (optional but recommended)
4. Set up **Rate limiting** in Supabase to prevent abuse
5. Review **Row Level Security** policies to ensure data protection
6. Use **HTTPS** in production (always)

## Additional Features

### Add More OAuth Providers

The same pattern works for other providers:

```typescript
// lib/supabase/auth-helpers.ts
export async function signInWithGitHub() {
  return await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
```

Then enable the provider in Supabase Dashboard and add button to login/register pages.

### Customize User Metadata

When creating the user profile, you can add custom metadata:

```typescript
await supabase.from('users').insert({
  id: session.user.id,
  email: session.user.email!,
  whatsapp: session.user.user_metadata?.phone || '',
  phone: session.user.user_metadata?.phone || null,
  role: 'user',
  // Add custom fields from Google profile:
  avatar_url: session.user.user_metadata?.avatar_url,
  full_name: session.user.user_metadata?.full_name,
})
```

## Next Steps

After successful setup:
1. Test the flow with multiple Google accounts
2. Test on mobile devices
3. Add error handling and loading states
4. Implement account linking (if user signs up with email then tries Google)
5. Add analytics to track OAuth conversion rates

## Support

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
