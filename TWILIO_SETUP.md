# Twilio Integration Setup Guide

## Step 1: Get Twilio Credentials

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up or log in to your account
3. In the main dashboard, copy your:
   - **Account SID**
   - **Auth Token**
4. Get a Twilio Phone Number (or use the trial number provided)

## Step 2: Configure Supabase Secrets

Add your Twilio credentials to Supabase as secrets for the Edge Functions:

```bash
supabase secrets set TWILIO_ACCOUNT_SID "your_account_sid"
supabase secrets set TWILIO_AUTH_TOKEN "your_auth_token"
supabase secrets set TWILIO_PHONE_NUMBER "+1XXXXXXXXXX"  # Your Twilio phone number
```

Or add them through the Supabase dashboard:
1. Go to Settings → Secrets in your Supabase project
2. Add the three secrets listed above

## Step 3: Test the Integration

1. Open the Dashboard page in your app
2. Enter a phone number in the "Send Alert" field (e.g., +1 (555) 123-4567)
3. Click "Send Alert" button
4. An SMS will be sent to all critical machines (status='Critical' or risk > 50%)

## How It Works

- **Import Excel**: Upload machine data from an Excel file
- **Send Alert**: Sends SMS to your phone for all machines with:
  - Status = "Critical" OR
  - Risk Level > 50%
- **Alert Message**: Includes machine name, fault description, and assigned engineer

## Sample Alert Message Format

```
[CRITICAL] MAINTENANCE ALERT: {MachineName} requires immediate attention. 
Fault: Risk Level: {risk}%. Health: {health}%.
Assigned Engineer: Maintenance Team
Please review dashboard for details.
```

## Notes

- Trial accounts have limited SMS capacity
- For production, upgrade your Twilio account
- Ensure phone numbers are in valid international format (e.g., +1 for US)
- Check Twilio logs for delivery status
