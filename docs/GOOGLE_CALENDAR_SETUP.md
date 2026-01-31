# Google Calendar Integration Setup Guide

This guide explains how to set up Google Calendar integration for the consultation booking system.

## Prerequisites

1. Google Cloud Project with Calendar API enabled
2. Service Account created with JSON key downloaded
3. Admin Google Calendar shared with the service account

## Environment Variables

Add the following variables to your `.env.local` file:

```env
# Admin calendar email (the Google account that owns the calendar)
ADMIN_CALENDAR_EMAIL=admin@restat.com

# Google Service Account Credentials
# Extract these from the downloaded JSON key file
GOOGLE_CLIENT_EMAIL=restat-calendar-service@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id
```

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Note down the Project ID

### 2. Enable Google Calendar API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter details:
   - Name: `restat-calendar-service`
   - Description: `Service account for ReStat consultation booking`
4. Grant role: "Service Account User"
5. Click "Done"

### 4. Create and Download Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose **JSON** format
5. Click "Create" - the JSON file will download automatically
6. **IMPORTANT**: Keep this file secure! Never commit it to git!

### 5. Extract Credentials from JSON Key

Open the downloaded JSON file and extract the following values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",              // → GOOGLE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----...", // → GOOGLE_PRIVATE_KEY
  "client_email": "...@....iam.gserviceaccount.com", // → GOOGLE_CLIENT_EMAIL
  ...
}
```

**Note for GOOGLE_PRIVATE_KEY**: 
- Copy the entire private key including the BEGIN and END markers
- Replace literal newlines with `\n` 
- Wrap in double quotes
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...rest of key...\n-----END PRIVATE KEY-----\n"`

### 6. Share Google Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com)
2. On the left side, find your calendar (usually your email)
3. Click the three dots next to your calendar name
4. Select "Settings and sharing"
5. Scroll to "Share with specific people or groups"
6. Click "Add people and groups"
7. Enter the `GOOGLE_CLIENT_EMAIL` from the JSON file (looks like: `restat-calendar-service@project-id.iam.gserviceaccount.com`)
8. Select permission: **"Make changes to events"**
9. Click "Send"

### 7. Configure Environment Variables

Create or update `.env.local` in the project root:

```env
ADMIN_CALENDAR_EMAIL=your-admin-email@gmail.com
GOOGLE_CLIENT_EMAIL=restat-calendar-service@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id
```

**Replace**:
- `your-admin-email@gmail.com` with the Google account email that owns the calendar
- Values with those from your downloaded JSON key file

### 8. Test the Integration

After deployment:

1. Navigate to the consultation booking page
2. Select a date - it should fetch available time slots from Google Calendar
3. Book a consultation
4. Check:
   - Event appears in admin's Google Calendar
   - Google Meet link is generated
   - Both admin and user receive email invitations
   - User can see the Meet link in their dashboard

## Troubleshooting

### Error: "Calendar not found"
- Ensure the admin calendar is shared with the service account email
- Verify `ADMIN_CALENDAR_EMAIL` matches the calendar owner's email

### Error: "Authentication failed"
- Check that `GOOGLE_PRIVATE_KEY` includes all newlines as `\n`
- Verify the private key starts with `-----BEGIN PRIVATE KEY-----`
- Ensure no extra spaces or line breaks in the environment variable

### Error: "Insufficient permissions"
- Ensure service account has "Make changes to events" permission on the calendar
- Wait a few minutes after sharing the calendar (propagation delay)

### Events not showing in calendar
- Verify the Calendar API is enabled in Google Cloud Console
- Check that the service account email is correctly added to calendar sharing

## Security Best Practices

1. **Never commit** `.env.local` or the JSON key file to version control
2. **Rotate keys** periodically (every 90 days recommended)
3. **Limit service account permissions** to only Calendar API
4. **Use separate service accounts** for production and development
5. **Monitor usage** in Google Cloud Console

## Features Enabled

Once configured, the system will:

- ✅ Check real-time calendar availability
- ✅ Block already-booked time slots
- ✅ Automatically create calendar events
- ✅ Generate Google Meet links
- ✅ Send email invitations to both participants
- ✅ Sync consultations to Supabase database
- ✅ Display Meet links in user dashboard

## Support

For issues with Google Calendar API:
- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Service Account Authentication](https://developers.google.com/identity/protocols/oauth2/service-account)
