import { query } from '@/lib/db';
import { notifyOwner } from '@/lib/sms';
import { NextResponse } from 'next/server';

// POST - Submit quick inquiry from home page
export async function POST(request) {
  try {
    const { name, phone, message } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Save to database
    const result = await query(
      'INSERT INTO inquiries (name, phone, message) VALUES ($1, $2, $3) RETURNING id',
      [name, phone, message]
    );

    // Send SMS notification
    await notifyOwner(
      `📩 New SOWAL Inquiry\n\nFrom: ${name}\nPhone: ${phone}\n\n${message || 'No message'}`
    );

    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Inquiry submitted successfully' 
    });

  } catch (error) {
    console.error('Inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

// GET - List all inquiries (for admin)
export async function GET(request) {
  try {
    const result = await query(
      'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
