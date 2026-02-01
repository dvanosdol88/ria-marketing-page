import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Cost of Complication: Investment Fee Infographic',
  description: 'Why low fees are the most reliable predictor of investment success.',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
