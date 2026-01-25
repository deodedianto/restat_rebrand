# Google OAuth Flow Documentation

## Overview

Our Google OAuth implementation uses a **simplified direct redirect** approach that matches the behavior of email/password login.

## Flow Diagram

```
User clicks "Lanjutkan dengan Google"
         ↓
signInWithGoogle() called
         ↓
Redirect to Google authentication
         ↓
User authenticates with Google
         ↓
Google redirects to: /dashboard (directly!)
         ↓
Dashboard page loads
         ↓
Auth listener detects session
         ↓
loadUserProfile() called
         ↓
Profile loaded/created
         ↓
Dashboard shows user data
```

## Key Components

### 1. `signInWithGoogle()` (lib/supabase/auth-helpers.ts)
- Initiates OAuth flow with Google
- **Redirect URL**: `/dashboard` (not `/auth/callback`)
- This is the key difference from typical OAuth implementations

### 2. Auth Listener (lib/auth-context.tsx)
- Automatically detects OAuth session via `onAuthStateChange`
- Loads user profile from database
- Creates new profile if first-time OAuth user
- Has duplicate prevention with `isLoadingProfile` flag

### 3. Dashboard Page (app/dashboard/page.tsx)
- Shows loading state while `isLoading === true`
- Auth listener updates `isLoading` to `false` after profile loads
- No special OAuth handling needed!

### 4. Callback Page (app/auth/callback/page.tsx)
- **Fallback only** - rarely used
- Handles OAuth errors
- Redirects to dashboard if somehow reached

## Why This Approach?

### Traditional OAuth (❌ Complex)
```
Login → OAuth Provider → /auth/callback → Check session → Load profile → Redirect → Dashboard
```
**Problems:**
- Extra redirect adds latency
- Callback page needs to duplicate profile loading logic
- Race conditions between callback and auth listener
- AbortError when navigating during concurrent requests

### Our Approach (✅ Simple)
```
Login → OAuth Provider → /dashboard → Auth listener handles everything
```
**Benefits:**
- ✅ One less redirect (faster)
- ✅ Same flow as email/password login
- ✅ No duplicate logic
- ✅ No race conditions
- ✅ Auth listener handles all auth events consistently

## Comparison with Email/Password Login

### Email/Password
```typescript
// User submits form
const success = await login(email, password)  // Loads profile
if (success) {
  setTimeout(() => router.push("/dashboard"), 100)
}
```

### Google OAuth
```typescript
// User clicks button
signInWithGoogle()  // Redirects to Google, then to /dashboard

// Auth listener automatically:
// - Detects session
// - Loads/creates profile
// - Updates user state
```

**Both flows end up at dashboard with profile loaded!**

## Configuration Checklist

### Supabase Dashboard
1. Go to Authentication → URL Configuration
2. **Site URL**: `http://localhost:3000` (dev) or your production URL
3. **Redirect URLs**: Add `http://localhost:3000/dashboard`
4. Optionally keep `/auth/callback` for fallback

### Google Cloud Console
1. **Authorized JavaScript origins**: `http://localhost:3000`
2. **Authorized redirect URIs**: 
   - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - (Supabase handles the redirect to your app)

## Error Handling

If OAuth fails:
1. Google redirects to `/auth/callback?error=...`
2. Callback page detects error param
3. Shows error message to user
4. Redirects to login page after 3 seconds

## Testing

### Successful Login
1. Click "Lanjutkan dengan Google"
2. Authenticate with Google
3. Should land on dashboard with profile loaded
4. No errors in console
5. User data displays correctly

### First-Time OAuth User
1. Login with new Google account
2. Profile automatically created in `users` table
3. Name from Google metadata
4. Dashboard shows immediately

### Existing OAuth User
1. Login with previously used Google account
2. Profile loaded from database
3. All previous data intact (referrals, orders, etc.)

## Troubleshooting

### "AbortError: signal is aborted without reason"
- **Fixed!** This was caused by concurrent profile loads
- Solution: Added `isLoadingProfile` flag to prevent duplicates

### Profile not loading
1. Check browser console for errors
2. Verify Supabase RLS policies allow user access
3. Check `users` table for profile record
4. Verify OAuth redirect URL in Supabase dashboard

### Stuck on loading screen
1. Check if `isLoading` state is stuck at `true`
2. Verify auth listener is firing (check console logs)
3. Check for network errors to Supabase

## Security Notes

- OAuth tokens are handled entirely by Supabase
- No tokens stored in localStorage (Supabase manages this)
- Profile creation uses authenticated user ID only
- RLS policies prevent unauthorized access

## Future Enhancements

- [ ] Add other OAuth providers (GitHub, Facebook)
- [ ] Add profile completion step for OAuth users
- [ ] Link multiple OAuth providers to one account
- [ ] OAuth provider management in user settings
