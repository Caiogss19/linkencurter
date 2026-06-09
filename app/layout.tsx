import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spark Maxx · Encurtador de Links',
  description: 'Encurtador de links interno da Spark Maxx',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
