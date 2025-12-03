export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>SOWAL Renovations API</h1>
      <p>Backend is running ✅</p>
      <h2>Endpoints:</h2>
      <ul>
        <li><code>POST /api/contact</code> - Quick inquiry</li>
        <li><code>POST /api/request-now</code> - Urgent contact request</li>
        <li><code>POST /api/bookings</code> - Create booking</li>
        <li><code>GET /api/bookings</code> - List bookings</li>
        <li><code>PATCH /api/bookings</code> - Update booking status</li>
      </ul>
    </main>
  );
}
