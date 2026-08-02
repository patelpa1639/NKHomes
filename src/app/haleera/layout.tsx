import type { Metadata, Viewport } from 'next';
import './haleera.css';

export const metadata: Metadata = {
  title: 'Haleera — The creator group chat, upgraded',
  description:
    'Haleera is a private, verified community where content creators can discuss the platforms shaping their work, compare real experiences, and connect with one another. Free for creators. Coming to iOS.',
  openGraph: {
    title: 'Haleera — The creator group chat, upgraded',
    description:
      'A private, verified community for content creators. Compare real experiences, talk platforms, and connect. Free for creators — coming to iOS.',
    siteName: 'Haleera',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haleera — The creator group chat, upgraded',
    description:
      'A private, verified community for content creators. Free for creators — coming to iOS.',
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
