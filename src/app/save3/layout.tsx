import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Cost of Complication: Investment Fee Analysis',
  description: 'Why a "small" 1% or 2% fee is the single largest threat to your financial future.',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
