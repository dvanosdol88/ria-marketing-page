import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mailer Audit: Visual Roadmap | Smarter Way Wealth",
  description:
    "A clear, centralized design brief and visual roadmap for Smarter Way Wealth's mailer campaigns.",
};

export default function MailerAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Mailer Audit: Visual Roadmap",
            description:
              "A clear, centralized design brief and visual roadmap for Smarter Way Wealth's mailer campaigns.",
            publisher: {
              "@type": "Organization",
              name: "Smarter Way Wealth",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
