import { supabase } from '@/integrations/supabase/client';

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

export const sendTwilioAlert = async (payload: AlertPayload): Promise<AlertResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-alert', {
      body: payload,
    });

    if (error) {
      console.error('Alert send error:', error);
      throw new Error(error.message || 'Failed to send alert');
    }

    console.log('Alert sent successfully:', data);
    return data as AlertResponse;
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
