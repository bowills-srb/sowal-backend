import { query } from '@/lib/db';
import { notifyOwner } from '@/lib/sms';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const { serviceDescription, phone } = await request.json();

    const result = await query(
      'INSERT INTO urgent_requests (service_description, phone) VALUES ($1, $2) RETURNING id',
      [serviceDescription || 'Urgent request - no details provided', phone]
    );

    const smsResult = await notifyOwner(
      `🚨 URGENT SOWAL Request!\n\n${serviceDescription || 'Customer needs immediate assistance'}\n\nCallback: ${phone || 'Not provided'}\n\nRespond ASAP!`
    );

    if (smsResult.success) {
      await query(
        'UPDATE urgent_requests SET sms_sent = TRUE WHERE id = $1',
        [result.rows[0].id]
      );
    }

    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      smsSent: smsResult.success,
      message: 'Request sent! We will call you back shortly.' 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Urgent request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM urgent_requests ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json(result.rows, { headers: corsHeaders });
  } catch (error) {
    console.error('Fetch urgent requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500, headers: corsHeaders }
    );
  }
}
