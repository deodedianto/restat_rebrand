# Google Calendar Integration - Troubleshooting Guide

## Issue: "Failed to create calendar event"

If availability checking works but booking fails with "Failed to create calendar event", follow these diagnostic steps:

### Step 1: Check Server Logs

Look at your Next.js terminal/console for detailed error messages. The logs will show:

```
[Google Calendar] Error creating consultation event: {
  message: "...",
  code: 403/404/401,
  ...
}
```

### Step 2: Common Error Codes

#### Error 403 - Permission Denied

**Cause:** Calendar not shared with service account OR insufficient permissions

**Solution:**
1. Open [Google Calendar](https://calendar.google.com)
2. Click on your calendar settings (three dots → Settings and sharing)
3. Scroll to "Share with specific people or groups"
4. Verify the service account email is listed (from `.env.local`: `GOOGLE_CLIENT_EMAIL`)
5. **CRITICAL:** Ensure permission is set to **"Make changes to events"** (not just "See all event details")
6. If not present, add it again:
   - Click "Add people and groups"
   - Enter service account email
   - Select "Make changes to events"
   - Click "Send"
7. Wait 2-3 minutes for permissions to propagate
8. Try booking again

#### Error 404 - Calendar Not Found

**Cause:** `ADMIN_CALENDAR_EMAIL` doesn't match the actual calendar owner

**Solution:**
1. Open `.env.local`
2. Verify `ADMIN_CALENDAR_EMAIL` matches your Google Calendar email exactly
3. It should be the email address of the Google account that owns the calendar
4. Restart your Next.js server after changing environment variables

#### Error 401 - Authentication Failed

**Cause:** Invalid service account credentials

**Solution:**
1. Check `.env.local` has all three required variables:
   ```env
   GOOGLE_CLIENT_EMAIL=...
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=...
   ```

2. **CRITICAL:** Verify `GOOGLE_PRIVATE_KEY` format:
   - Must start with `-----BEGIN PRIVATE KEY-----\n`
   - Must end with `\n-----END PRIVATE KEY-----\n`
   - All newlines must be `\n` (escaped)
   - Must be wrapped in double quotes
   
   **Correct format:**
   ```env
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```
   
   **Incorrect format:**
   ```env
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
   -----END PRIVATE KEY-----
   ```

3. Re-download the JSON key from Google Cloud Console if needed
4. Restart your Next.js server

### Step 3: Verify Service Account Setup

1. **Check Google Cloud Console:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Navigate to "APIs & Services" > "Enabled APIs & services"
   - Verify "Google Calendar API" is enabled
   - If not, enable it and wait a few minutes

2. **Check Service Account Exists:**
   - Go to "IAM & Admin" > "Service Accounts"
   - Verify your service account is listed
   - Click on it and check "Keys" tab has an active key

3. **Verify Service Account Email:**
   - The service account email should match `GOOGLE_CLIENT_EMAIL` in your `.env.local`
   - Format: `service-name@project-id.iam.gserviceaccount.com`

### Step 4: Test Environment Variables

Create a test API route to verify credentials are loaded:

**File:** `app/api/test-calendar-config/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY
  const projectId = process.env.GOOGLE_PROJECT_ID
  const adminEmail = process.env.ADMIN_CALENDAR_EMAIL

  return NextResponse.json({
    hasClientEmail: !!clientEmail,
    clientEmail: clientEmail?.substring(0, 20) + '...', // Show first 20 chars
    hasPrivateKey,
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length,
    privateKeyStartsWith: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 27), // "-----BEGIN PRIVATE KEY-----"
    hasProjectId: !!projectId,
    projectId,
    hasAdminEmail: !!adminEmail,
    adminEmail,
  })
}
```

Visit: `http://localhost:3000/api/test-calendar-config`

**Expected output:**
```json
{
  "hasClientEmail": true,
  "clientEmail": "restat-calendar-serv...",
  "hasPrivateKey": true,
  "privateKeyLength": 1704,
  "privateKeyStartsWith": "-----BEGIN PRIVATE KEY-----",
  "hasProjectId": true,
  "projectId": "your-project-id",
  "hasAdminEmail": true,
  "adminEmail": "admin@example.com"
}
```

If any value is `false` or `undefined`, that environment variable is not loaded properly.

### Step 5: Restart Development Server

Environment variables are only loaded when the server starts:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Check Calendar API Quotas

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" > "Dashboard"
3. Click on "Google Calendar API"
4. Check "Quotas" tab
5. Ensure you haven't exceeded API limits (unlikely for new projects)

### Step 7: Verify Google Meet Creation

If events are created but no Meet link is generated:

1. Check that your Google Workspace or Google account has Google Meet enabled
2. For personal Gmail accounts (@gmail.com), Meet should be automatically available
3. For Google Workspace accounts, ensure Meet is enabled in admin settings

### Step 8: Common Setup Mistakes

❌ **Mistake 1:** Using the wrong email as `ADMIN_CALENDAR_EMAIL`
- Should be: The email that **owns** the calendar
- Not: The service account email

❌ **Mistake 2:** Calendar shared with "See all event details" only
- Must be: "Make changes to events"

❌ **Mistake 3:** Private key not properly escaped
- Newlines must be `\n` not actual line breaks

❌ **Mistake 4:** Forgetting to restart server after changing `.env.local`

❌ **Mistake 5:** Using wrong calendar (not "primary")
- The `ADMIN_CALENDAR_EMAIL` should point to the primary calendar of that account

### Step 9: Test with Minimal Event

If still failing, test with a simpler event creation. Add this debug endpoint:

**File:** `app/api/test-calendar-simple/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const calendarId = process.env.ADMIN_CALENDAR_EMAIL

    if (!clientEmail || !privateKey || !calendarId) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Create minimal event
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: 'Test Event - Delete Me',
        start: {
          dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: 'Asia/Jakarta',
        },
        end: {
          dateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
          timeZone: 'Asia/Jakarta',
        },
      },
    })

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      message: 'Test event created! Check your calendar and delete it.',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.errors?.[0] || error.response?.data,
    }, { status: 500 })
  }
}
```

Visit: `http://localhost:3000/api/test-calendar-simple`

- If this succeeds, the issue is with the consultation booking logic
- If this fails, the issue is with credentials/permissions

### Step 10: Contact Support

If none of the above works, gather this information:

1. Error code from server logs (403, 404, 401, etc.)
2. Full error message from console
3. Screenshot of calendar sharing settings
4. Confirmation that all environment variables are set
5. Output from test-calendar-config endpoint

Then check:
- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Service Account Troubleshooting](https://developers.google.com/identity/protocols/oauth2/service-account#troubleshooting)

## Quick Checklist

Use this checklist to verify your setup:

- [ ] Google Calendar API is enabled in Google Cloud Console
- [ ] Service account created and JSON key downloaded
- [ ] Calendar shared with service account email
- [ ] Permission set to "Make changes to events"
- [ ] All 4 environment variables in `.env.local`:
  - [ ] `ADMIN_CALENDAR_EMAIL` (your email)
  - [ ] `GOOGLE_CLIENT_EMAIL` (service account email)
  - [ ] `GOOGLE_PRIVATE_KEY` (properly escaped with `\n`)
  - [ ] `GOOGLE_PROJECT_ID` (project ID)
- [ ] Development server restarted after setting environment variables
- [ ] Waited 2-3 minutes after sharing calendar (propagation delay)
- [ ] Tested with test-calendar-config endpoint
- [ ] Checked server console logs for specific error codes

## Still Having Issues?

The improved logging will now show detailed error messages in your terminal. Try booking a consultation and check your Next.js console for messages starting with:
- `[Google Calendar]` - from the service layer
- `[Booking API]` - from the API route

These logs will tell you exactly what's failing and why.
