import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: 'Indian Railways Asset Management System',
  description: 'Indian Railways Asset Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
