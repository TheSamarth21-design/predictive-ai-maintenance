# Twilio Integration Setup Guide

## Step 1: Get Twilio Credentials

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up or log in to your account
3. In the main dashboard, copy your:
   - **Account SID** (starts with `ac`)
   - **Auth Token** 
   - Get a **Twilio Phone Number** (or use the trial number provided)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root (same level as `package.json`) with:

```env
VITE_TWILIO_ACCOUNT_SID=acXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Important:**
- Replace `acXXXX...` with your actual Account SID
- Replace with your actual Auth Token
- Replace `+1234567890` with your actual Twilio phone number

## Step 3: Restart Development Server

```bash
npm run dev
```

The server needs to restart to pick up the new environment variables.

## Step 4: Test the Integration

1. Open the Dashboard page
2. Enter a phone number in the "Send Alert" field (e.g., +1 (555) 123-4567)
3. Click "Send Alert" button
4. An SMS will be sent to all critical machines (status='Critical' or risk > 50%)

## How It Works

- **Import Excel**: Upload machine data from an Excel file
- **Send Alert**: Sends SMS to your phone for all machines with:
  - Status = "Critical" OR
  - Risk Level > 50%
- **Alert Message**: Includes machine name, fault description, and risk/health info

## Sample Alert Message Format

```
[WARNING] MAINTENANCE ALERT: Pump B requires immediate attention. 
Fault: Risk Level: 28%. Health: 62%.
Assigned Engineer: Maintenance Team
Please review dashboard for details.
```

## Troubleshooting

### "Failed to send a request to the Edge Function"
- Make sure you restarted the dev server after adding `.env.local`
- Verify all three environment variables are set correctly
- Check browser console for the exact error message

### "Twilio credentials not configured"
- Ensure `.env.local` file exists in project root
- Environment variables must start with `VITE_` to be accessible from frontend
- Run `npm run dev` again after creating `.env.local`

### SMS Not Received
- Trial accounts have limited SMS capacity
- Verify the phone number format is correct (international format: +1 for US)
- Check Twilio console logs: https://www.twilio.com/console/sms/logs
- For production, upgrade your Twilio account

### CORS Errors
- The direct API approach handles CORS properly
- If still seeing issues, check browser DevTools Network tab
- Ensure your Twilio credentials are correct

## Notes

- Trial Twilio accounts are free but limited
- Upgrade to a paid account for production use
- Phone numbers must be in valid international format (e.g., +1 for US)
- Each SMS typically costs ₹0.83 (or included in your plan)
