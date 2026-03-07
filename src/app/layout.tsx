import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NK Homes | ARM Lead Intelligence',
  description: 'ARM Lead Intelligence System for NK Homes — Brokered by Samson Properties',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
