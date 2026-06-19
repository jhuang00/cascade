import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cascade',
  description: 'Slicing through the history of orbital debris.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
