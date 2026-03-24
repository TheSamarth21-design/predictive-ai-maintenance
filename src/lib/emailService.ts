/**
 * Email Alert Service
 * Sends email notifications for critical machine alerts
 */

export interface EmailConfig {
  recipient: string;
  ccList?: string;
  criticalOnly: boolean;
}

export interface EmailAlertPayload {
  machineName: string;
  status: string;
  risk: number;
  health: number;
  alertType: 'warning' | 'critical';
  fault?: string;
  engineerName?: string;
  config: EmailConfig;
}

/**
 * Send email alert via backend API
 * Uses Nodemailer on the backend via Supabase Edge Function
 */
export const sendEmailAlert = async (payload: EmailAlertPayload) => {
  try {
    // Check if email alerts are enabled and filter by criticality
    if (!payload.config.recipient) {
      throw new Error('Email recipient not configured');
    }

    if (payload.config.criticalOnly && payload.alertType !== 'critical') {
      console.log('Email alert skipped - critical only mode enabled');
      return { success: false, reason: 'Critical only mode' };
    }

    // Prepare email body
    const emailBody = generateEmailBody(payload);
    const emailSubject = generateEmailSubject(payload);

    // Call backend service to send email
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.config.recipient,
        cc: payload.config.ccList || '',
        subject: emailSubject,
        htmlBody: emailBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    return { success: true, ...data };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending email:', err);
    throw new Error(`Email send failed: ${errorMessage}`);
  }
};

/**
 * Generate email subject based on alert type
 */
function generateEmailSubject(payload: EmailAlertPayload): string {
  const prefix = payload.alertType === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING';
  return `${prefix}: ${payload.machineName} Requires Attention`;
}

/**
 * Generate HTML email body
 */
function generateEmailBody(payload: EmailAlertPayload): string {
  const alertColor = payload.alertType === 'critical' ? '#ef4444' : '#f97316';
  const healthColor = payload.health > 50 ? '#22c55e' : payload.health > 25 ? '#eab308' : '#ef4444';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
        .alert-badge { display: inline-block; background: ${alertColor}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 30px; }
        .machine-info { background: #f9fafb; border-left: 4px solid ${alertColor}; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { color: #6b7280; font-weight: 500; }
        .info-value { color: #111827; font-weight: bold; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-critical { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }
        .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .metric { background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: ${healthColor}; }
        .metric-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
        .fault-section { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .fault-title { color: #991b1b; font-weight: bold; margin-bottom: 8px; }
        .action-section { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .action-title { color: #0c4a6e; font-weight: bold; margin-bottom: 8px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Predictive Maintenance Alert</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">From SyncPlant AI System</p>
        </div>

        <div class="content">
          <div class="alert-badge">${payload.alertType.toUpperCase()}</div>
          
          <h2 style="color: #111827; margin: 0 0 20px 0;">${payload.machineName} Alert</h2>

          <div class="machine-info">
            <div class="info-row">
              <span class="info-label">Machine Status:</span>
              <span class="status-badge ${payload.alertType === 'critical' ? 'status-critical' : 'status-warning'}">
                ${payload.status}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Time Detected:</span>
              <span class="info-value">${new Date().toLocaleString()}</span>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric">
              <div class="metric-value">${payload.risk}%</div>
              <div class="metric-label">Risk Level</div>
            </div>
            <div class="metric">
              <div class="metric-value">${payload.health}%</div>
              <div class="metric-label">Health Status</div>
            </div>
          </div>

          ${payload.fault ? `
            <div class="fault-section">
              <div class="fault-title">Predicted Fault</div>
              <p style="margin: 0; color: #7f1d1d;">${payload.fault}</p>
            </div>
          ` : ''}

          <div class="action-section">
            <div class="action-title">👨‍💼 Assigned Engineer</div>
            <p style="margin: 8px 0; color: #0c4a6e;">
              ${payload.engineerName || 'Maintenance Team'}<br>
              <small>Status: On Standby</small>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://syncplant.local/dashboard" class="button">View Dashboard</a>
          </div>

          <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #0c4a6e;">
            <strong>Next Steps:</strong>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Review the detailed analysis on the SyncPlant dashboard</li>
              <li>Connect with the assigned engineer if immediate action is needed</li>
              <li>Monitor the component until maintenance is scheduled</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated alert from SyncPlant Predictive Maintenance System</p>
          <p>© 2026 SyncPlant. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send batch email alerts for multiple critical machines
 */
export const sendBatchEmailAlerts = async (
  machines: Array<{ name: string; status: string; risk: number; health: number }>,
  config: EmailConfig
) => {
  try {
    const alerts = machines.map(machine =>
      sendEmailAlert({
        machineName: machine.name,
        status: machine.status,
        risk: machine.risk,
        health: machine.health,
        alertType: machine.risk > 70 || machine.status === 'Critical' ? 'critical' : 'warning',
        config,
      })
    );

    const results = await Promise.allSettled(alerts);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      totalSent: alerts.length,
      successful,
      failed,
      summary: `${successful}/${alerts.length} email alerts sent successfully`,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Batch email send failed: ${errorMessage}`);
  }
};
