import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'WatchMyPrice',
  description: 'One stop place to track all your favorite product deals!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
