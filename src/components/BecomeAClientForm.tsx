"use client";

import { useState } from "react";
import { signupCta } from "@/config/signupCta";
import {
  ASSET_BANDS,
  BELOW_MINIMUM_BAND,
  US_STATES,
  HOME_STATE,
} from "@/config/becomeAClient";

type Status = "idle" | "submitting" | "sent" | "error";

const FIELD_CLASS =
  "min-h-[48px] w-full rounded-lg border border-[#C6D3DF] bg-white px-4 text-base text-[#10233A] transition focus:border-[#064B84] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#064B84]";
const LABEL_CLASS = "block text-sm font-bold text-[#10233A]";

export function BecomeAClientForm() {
  const [status, setStatus] = useState<Status>("idle");
  /** Whether the agreement actually went out, so the confirmation never
   *  promises an email that isn't there. */
  const [agreementSent, setAgreementSent] = useState(false);
  const [assetBand, setAssetBand] = useState("");
  const [state, setState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const belowMinimum = assetBand === BELOW_MINIMUM_BAND;
  const outOfState = state !== "" && state !== HOME_STATE;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/become-a-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          state: formData.get("state"),
          assetBand: formData.get("assetBand"),
          notes: formData.get("notes"),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; agreementSent?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Something went wrong.");
      }

      setAgreementSent(Boolean(payload?.agreementSent));
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[#0A5633] bg-[#F3F8F6] p-6 sm:p-8">
        <h2 className="text-2xl font-black leading-tight text-[#10233A]">
          {agreementSent ? "Got it — check your email." : "Got it."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#31465F] sm:text-base">
          {agreementSent
            ? "One email is on its way with the advisory agreement to sign, along with the firm's Form ADV Part 2 and Form CRS. Opening it and signing is all that's left — there is no separate confirmation step."
            : "David will email you the advisory agreement to sign, along with the firm's Form ADV Part 2 and Form CRS. Signing it is all that's left — there is no separate confirmation step."}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#31465F] sm:text-base">
          Nothing is owed and nothing begins until you sign.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={LABEL_CLASS} htmlFor="fullName">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className={`${FIELD_CLASS} mt-2`}
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`${FIELD_CLASS} mt-2`}
        />
        <p className="mt-2 text-xs leading-5 text-[#5A6B80]">
          This is where the agreement goes, so use one you check.
        </p>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="state">
          What state do you live in?
        </label>
        <select
          id="state"
          name="state"
          required
          value={state}
          onChange={(event) => setState(event.target.value)}
          className={`${FIELD_CLASS} mt-2`}
        >
          <option value="">Select your state</option>
          {US_STATES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        {outOfState ? (
          <p className="mt-2 rounded-lg bg-[#FFF7E6] px-4 py-3 text-xs leading-5 text-[#6B4E12]">
            Smarter Way Wealth is registered in {HOME_STATE}. Most states let an
            out-of-state adviser serve a limited number of residents without
            separate registration, so this is usually fine — David will confirm
            before anything is signed.
          </p>
        ) : null}
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="assetBand">
          Roughly how much is in your investment accounts?
        </label>
        <select
          id="assetBand"
          name="assetBand"
          required
          value={assetBand}
          onChange={(event) => setAssetBand(event.target.value)}
          className={`${FIELD_CLASS} mt-2`}
        >
          <option value="">Select a range</option>
          {ASSET_BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-5 text-[#5A6B80]">
          A rough range is fine. No account numbers, ever.
        </p>
        {belowMinimum ? (
          <div className="mt-2 rounded-lg bg-[#FFF7E6] px-4 py-3 text-xs leading-5 text-[#6B4E12]">
            <p>
              The standard minimum is $250,000 in investable assets, though the
              firm can waive it at its discretion. You can still sign up and
              David will tell you honestly either way — but if you&apos;d rather
              ask first,{" "}
              <a
                href={signupCta.secondary.href}
                className="font-bold !text-[#6B4E12] underline underline-offset-2"
                data-posthog-cta="true"
                data-posthog-cta-label="Talk to David first — below minimum"
                data-posthog-cta-location="signup_form_below_minimum"
              >
                take the 15 minutes instead
              </a>
              .
            </p>
          </div>
        ) : null}
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="notes">
          Anything David should know? <span className="font-normal text-[#5A6B80]">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={`${FIELD_CLASS} mt-2 py-3`}
        />
        <p className="mt-2 text-xs leading-5 text-[#5A6B80]">
          Please don&apos;t include account numbers, passwords, or other
          sensitive information.
        </p>
      </div>

      {status === "error" ? (
        <p
          role="alert"
          className="rounded-lg bg-[#FDECEC] px-4 py-3 text-sm leading-5 text-[#8A2020]"
        >
          {errorMessage} Nothing was sent — you can try again, or{" "}
          <a
            href={signupCta.secondary.href}
            className="font-bold !text-[#8A2020] underline underline-offset-2"
          >
            book 15 minutes with David
          </a>{" "}
          instead.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-[52px] w-full rounded-full bg-[#064B84] px-6 text-base font-bold text-white transition hover:bg-[#053E6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064B84] disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send me the agreement"}
      </button>

      <p className="text-xs leading-5 text-[#5A6B80]">
        {signupCta.disclosure} Signing the agreement is what starts the
        relationship — submitting this form does not obligate you to anything.
      </p>
    </form>
  );
}
