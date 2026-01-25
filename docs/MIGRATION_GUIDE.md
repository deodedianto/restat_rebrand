# Supabase Migration Guide

This guide explains how to migrate from localStorage to Supabase for the ReStat application.

## Overview

The application has been updated to use Supabase for:
- **Authentication**: Supabase Auth replaces localStorage-based auth
- **Database**: PostgreSQL replaces localStorage for all data
- **Real-time**: Automatic updates across all users and devices

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Database**: Supabase PostgreSQL database (created automatically with your project)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to be provisioned (2-3 minutes)
4. Note down your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create Database Tables

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the entire SQL script from `docs/SUPABASE_DATABASE_DESIGN_V3_FINAL.md`
4. Execute the script (this will create all tables, RLS policies, and triggers)

**Important:** Make sure to run the "Prerequisites" section first, which includes:
- UUID extension
- `user_role` enum type
- `update_updated_at_column()` function

### 4. Seed Initial Data

1. Start your Next.js development server:
```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin/seed`

3. Click "Seed All Data" to populate:
   - 36 analysis prices (12 methods x 3 packages)
   - 3 sample analysts

### 5. Test the Integration

1. Navigate to `http://localhost:3000/test-supabase`
2. Click each test button to verify:
   - ✅ Connection works
   - ✅ All tables are accessible
   - ✅ Data can be read

### 6. Create Your First User

1. Go to `http://localhost:3000/register`
2. Create an account with:
   - WhatsApp number (format: `+62xxxxxxxxx`)
   - Email
   - Phone number
   - Password
3. You'll be automatically logged in after registration

### 7. Verify Features

Test each feature to ensure it works:

#### User Dashboard
- [ ] View work history (orders and consultations)
- [ ] Create a new order
- [ ] Book a consultation
- [ ] Generate referral code
- [ ] Update profile settings
- [ ] Add bank account details

#### Admin Dashboard
- [ ] View financial statistics
- [ ] Manage orders (CRUD)
- [ ] Manage expenses (CRUD)
- [ ] Manage analysis prices (CRUD)
- [ ] Manage analysts (CRUD)
- [ ] View real-time updates

## Key Changes from localStorage

### Authentication

**Before (localStorage):**
```typescript
const user = JSON.parse(localStorage.getItem('restat_user') || '{}')
```

**After (Supabase):**
```typescript
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

**New Feature - Google OAuth:**
```typescript
// Users can now sign in with Google
await signInWithGoogle()
// See docs/GOOGLE_OAUTH_SETUP.md for configuration
```

### Data Storage

**Before (localStorage):**
```typescript
localStorage.setItem('work_history_123', JSON.stringify(history))
```

**After (Supabase):**
```typescript
await supabase.from('orders').insert({ user_id, research_title, ... })
```

### Real-time Updates

**New Feature** - Automatic updates across all devices:
```typescript
supabase
  .channel('orders')
  .on('postgres_changes', { event: '*', table: 'orders' }, () => {
    loadData()
  })
  .subscribe()
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:** Ensure your `.env.local` file exists and contains the correct credentials.

### Error: "type 'user_role' does not exist"

**Solution:** Run the Prerequisites section of the SQL script first, before creating any tables.

### Error: "function update_updated_at_column() does not exist"

**Solution:** Ensure you've created the trigger function in the Prerequisites section.

### Error: "permission denied for table users"

**Solution:** Check that RLS policies are enabled and correctly configured. Re-run the RLS section of the SQL script.

### Error: "row level security policy violation"

**Solution:** This usually means you're trying to access data you don't have permission for. Check:
1. Are you logged in?
2. Are you trying to access your own data?
3. For admin actions, does your user have `role = 'admin'`?

### No data showing in tables

**Solution:**
1. Check the test page (`/test-supabase`) to verify tables are accessible
2. Run the seed script (`/admin/seed`) to populate initial data
3. Check browser console for errors

## Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database tables created (SQL script executed)
- [ ] RLS policies enabled
- [ ] Initial data seeded (analysis prices and analysts)
- [ ] Test page verified all tables are accessible
- [ ] Test user registered successfully
- [ ] User can create orders
- [ ] User can book consultations
- [ ] User can generate referral code
- [ ] Admin can manage all data
- [ ] Real-time updates work
- [ ] Production environment variables set (for deployment)

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Add your Supabase credentials to your hosting provider (Vercel, Netlify, etc.)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-production-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   ```

2. **Database**: Use a separate Supabase project for production (don't use the same one as development)

3. **Seed Data**: Run the seed script on production after deployment

4. **Admin User**: Manually create an admin user via Supabase dashboard:
   - Register a user normally
   - Go to Supabase Authentication > Users
   - Find the user and click "Edit"
   - Update the user record in the `users` table to set `role = 'admin'`

## Benefits of Supabase Migration

### For Users
- ✅ **Data Persistence**: No more lost data when clearing browser cache
- ✅ **Cross-Device**: Access your data from any device
- ✅ **Real-time**: See updates instantly without refreshing
- ✅ **Secure**: Industry-standard authentication and encryption

### For Admins
- ✅ **Centralized Data**: Manage all user data from one place
- ✅ **Analytics**: Query data for insights and reporting
- ✅ **Backup**: Automatic backups and point-in-time recovery
- ✅ **Scalability**: Handles thousands of users without performance issues

### For Developers
- ✅ **Type Safety**: TypeScript types generated from database schema
- ✅ **RLS**: Built-in security with Row Level Security
- ✅ **Real-time**: WebSocket subscriptions for live updates
- ✅ **API**: REST and GraphQL APIs auto-generated

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase documentation: https://supabase.com/docs
3. Check the SQL script in `docs/SUPABASE_DATABASE_DESIGN_V3_FINAL.md`

## Next Steps

After successful migration:
1. Monitor the Supabase dashboard for usage and performance
2. Set up backups (Supabase Pro plan)
3. Configure custom email templates for auth (optional)
4. Add analytics and monitoring (optional)
