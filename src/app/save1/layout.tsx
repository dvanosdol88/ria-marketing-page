import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Silent Wealth Killer: Investment Fee Infographic',
  description: 'Why Average Returns minus Controllable Costs equals your Net Reality.',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
