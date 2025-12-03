import { query } from '@/lib/db';
import { notifyOwner } from '@/lib/sms';
import { NextResponse } from 'next/server';

// POST - Urgent contact request (Contact Now button)
export async function POST(request) {
  try {
    const { serviceDescription, phone } = await request.json();

    // Save to database
    const result = await query(
      'INSERT INTO urgent_requests (service_description, phone) VALUES ($1, $2) RETURNING id',
      [serviceDescription || 'Urgent request - no details provided', phone]
    );

    // Send immediate SMS notification
    const smsResult = await notifyOwner(
      `🚨 URGENT SOWAL Request!\n\n${serviceDescription || 'Customer needs immediate assistance'}\n\nCallback: ${phone || 'Not provided'}\n\nRespond ASAP!`
    );

    // Update SMS status
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
    });

  } catch (error) {
    console.error('Urgent request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

// GET - List urgent requests (for admin)
export async function GET(request) {
  try {
    const result = await query(
      'SELECT * FROM urgent_requests ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch urgent requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
