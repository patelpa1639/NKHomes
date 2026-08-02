import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/archivo';
import '@fontsource-variable/hanken-grotesk';
import './haleera.css';

export const metadata: Metadata = {
  title: 'Haleera — The creator group chat, upgraded',
  description:
    'A private, verified community where creators compare real numbers, swap what’s working, and say the things they can’t post. No brands. No bots. Free for creators — coming to iOS.',
  openGraph: {
    title: 'Haleera — The creator group chat, upgraded',
    description:
      'No brands. No bots. Verified creators talking honestly about the platforms. Free for creators — coming to iOS.',
    siteName: 'Haleera',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haleera — The creator group chat, upgraded',
    description:
      'No brands. No bots. Verified creators talking honestly about the platforms. Coming to iOS.',
  },
};

export const viewport: Viewport = {
  themeColor: '#e52a5d',
};

export default function HaleeraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
