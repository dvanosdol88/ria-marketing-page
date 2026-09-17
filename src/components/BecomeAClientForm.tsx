"use client";

import { useState } from "react";
import { signupCta } from "@/config/signupCta";
import {
  US_STATES,
  HOME_STATE,
} from "@/config/becomeAClient";

type Status = "idle" | "submitting" | "sent" | "error";

const FIELD_CLASS =
  "min-h-[48px] w-full rounded-lg border border-[#C6D3DF] bg-white px-4 text-base text-[#10233A] transition focus:border-[#064B84] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#064B84]";
const LABEL_CLASS = "block text-sm font-bold text-[#10233A]";

export function BecomeAClientForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [state, setState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
          notes: formData.get("notes"),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string; agreementSent?: boolean }
        | null;

      if (!response.ok || payload?.success !== true) {
        throw new Error(payload?.error ?? "Something went wrong.");
      }

      setStatus("sent");
      window.location.replace(
        payload.agreementSent === true
          ? "/become-a-client/confirmation?agreement=sent"
          : "/become-a-client/confirmation",
      );
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
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
        disabled={status === "submitting" || status === "sent"}
        className="min-h-[52px] w-full rounded-full bg-[#064B84] px-6 text-base font-bold text-white transition hover:bg-[#053E6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064B84] disabled:opacity-60"
      >
        {status === "sent" ? "Opening confirmation…" : status === "submitting" ? "Sending…" : "Send me the agreement"}
      </button>

      <p className="text-xs leading-5 text-[#5A6B80]">
        {signupCta.disclosure} Signing the agreement is what starts the
        relationship — submitting this form does not obligate you to anything.
      </p>
    </form>
  );
}
