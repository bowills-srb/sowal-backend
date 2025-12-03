let client = null;

async function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) {
    const twilio = (await import('twilio')).default;
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

export async function sendSMS(to, message) {
  const twilioClient = await getClient();
  
  if (!twilioClient) {
    console.log('Twilio not configured, skipping SMS:', message);
    return { success: false, error: 'Twilio not configured' };
  }
  
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
}

export async function notifyOwner(message) {
  if (!process.env.NOTIFY_PHONE_NUMBER) {
    console.log('No notify number configured, skipping SMS');
    return { success: false, error: 'No notify number' };
  }
  return sendSMS(process.env.NOTIFY_PHONE_NUMBER, message);
}
