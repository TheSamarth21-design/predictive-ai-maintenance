export interface AlertPayload {
  phoneNumber: string;
  message: string;
  alertType: 'critical' | 'warning' | 'info';
}

interface AlertResponse {
  success: boolean;
  messageId: string;
  status: string;
  error?: string;
}

// Direct Twilio API call (no Edge Function needed)
export const sendTwilioAlert = async (payload: AlertPayload): Promise<AlertResponse> => {
  try {
    // Get Twilio credentials from environment variables
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error(
        'Twilio credentials not configured. Set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_PHONE_NUMBER in .env.local'
      );
    }

    // Create Basic Auth header
    const auth = btoa(`${accountSid}:${authToken}`);

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', payload.phoneNumber);
    formData.append('Body', `[${payload.alertType.toUpperCase()}] ${payload.message}`);

    // Call Twilio REST API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      messageId: data.sid,
      status: data.status,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending alert:', err);
    throw new Error(errorMessage);
  }
};

export const sendMachineAlert = async (
  phoneNumber: string,
  machineName: string,
  faultDescription: string,
  engineerName: string,
  alertType: 'critical' | 'warning' | 'info' = 'warning'
) => {
  const message = `MAINTENANCE ALERT: ${machineName} requires immediate attention. 
Fault: ${faultDescription}
Assigned Engineer: ${engineerName}
Please review dashboard for details.`;

  return sendTwilioAlert({
    phoneNumber,
    message,
    alertType,
  });
};
