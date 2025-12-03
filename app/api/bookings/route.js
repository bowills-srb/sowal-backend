import { query } from '@/lib/db';
import { notifyOwner } from '@/lib/sms';
import { NextResponse } from 'next/server';

// POST - Create new booking
export async function POST(request) {
  try {
    const { 
      serviceDescription, 
      date, 
      time, 
      name, 
      phone, 
      email, 
      notes 
    } = await request.json();

    if (!serviceDescription || !date || !time) {
      return NextResponse.json(
        { error: 'Service description, date and time are required' },
        { status: 400 }
      );
    }

    // Save to database
    const result = await query(
      `INSERT INTO bookings 
       (service_description, booking_date, booking_time, customer_name, customer_phone, customer_email, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [serviceDescription, date, time, name, phone, email, notes]
    );

    // Format date for SMS
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    // Send SMS notification
    await notifyOwner(
      `📅 New SOWAL Booking!\n\n${serviceDescription}\n\n📆 ${formattedDate} at ${time}\n👤 ${name || 'Not provided'}\n📞 ${phone || 'Not provided'}\n\nConfirm within 2 hours!`
    );

    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Booking request submitted! We will confirm within 2 hours.' 
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET - List bookings (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    let queryText = 'SELECT * FROM bookings';
    let params = [];

    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    } else if (upcoming === 'true') {
      queryText += ' WHERE booking_date >= CURRENT_DATE AND status != $1';
      params.push('cancelled');
    }

    queryText += ' ORDER BY booking_date ASC, booking_time ASC LIMIT 100';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status
export async function PATCH(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    let queryText = 'UPDATE bookings SET status = $1';
    let params = [status, id];

    if (status === 'confirmed') {
      queryText += ', confirmed_at = CURRENT_TIMESTAMP';
    }

    queryText += ' WHERE id = $2 RETURNING *';

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      booking: result.rows[0] 
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
