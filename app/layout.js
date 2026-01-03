import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import AuthListener from '@/components/AuthListener';

export const metadata = {
  title: 'WatchMyPrice',
  description: 'One stop place to track all your favorite product deals!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        {children}
        <AuthListener />
        <Toaster richColors />
      </body>
    </html>
  );
}
