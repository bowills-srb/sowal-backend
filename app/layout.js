export const metadata = {
  title: 'SOWAL Renovations API',
  description: 'Backend API for SOWAL Renovations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
