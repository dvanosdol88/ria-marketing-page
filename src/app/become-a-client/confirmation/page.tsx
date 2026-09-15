import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Request received | Smarter Way Wealth",
  description: "What happens next after requesting your advisory agreement.",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ agreement?: string }>;
}) {
  const agreementSent = (await searchParams).agreement === "sent";
  const steps = [
    {
      title: agreementSent ? "Check your email" : "David reviews your request",
      description: agreementSent
        ? "Your advisory agreement and the firm's Form ADV Part 2 and Form CRS have been sent to the email address you provided."
        : "David will review the information you shared and follow up at the email address you provided. Your agreement has not been emailed yet.",
    },
    {
      title: "Review your agreement and disclosures",
      description: "Read the documents when they arrive. You can ask David any questions before deciding whether to sign.",
    },
    {
      title: "Take the next step when you are ready",
      description: "If you choose to proceed, follow the signing instructions in the email. David will guide you through the next steps.",
    },
  ];

  return (
    <main className="min-h-[75vh] bg-[#EEF0F5] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#D8E2EA] bg-white p-6 shadow-sm sm:p-10">
        <CheckCircle2 className="h-12 w-12 text-[#007A2F]" aria-hidden="true" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#007A2F]">Request received</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-[#10233A] sm:text-4xl">Thank you. Here’s what happens next.</h1>
        <p className="mt-4 text-base leading-7 text-[#31465F]">Your request has been saved. You do not need to submit it again or book a call to continue.</p>
        <ol className="mt-8 space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3 sm:gap-4">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064B84] text-sm font-bold text-white">{index + 1}</span>
              <div>
                <h2 className="text-lg font-bold text-[#10233A]">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#31465F] sm:text-base">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 rounded-lg bg-[#F3F8F6] p-4 text-sm leading-6 text-[#31465F]">Submitting your request does not commit you to becoming a client. Personalized investment advice begins only after becoming a client.</p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-[#064B84] underline underline-offset-4">Return to the calculator</Link>
      </div>
    </main>
  );
}
