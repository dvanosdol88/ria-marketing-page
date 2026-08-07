import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { ASSET_BANDS, US_STATES } from "@/config/becomeAClient";

export const dynamic = "force-dynamic";

const LEADS_COLLECTION = "becomeAClientLeads";
const MAX_NAME = 120;
const MAX_NOTES = 2000;

type SignupBody = {
  fullName?: unknown;
  email?: unknown;
  state?: unknown;
  assetBand?: unknown;
  notes?: unknown;
};

function asTrimmedString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Deliberately permissive — this gates obvious typos, not deliverability. A
 * bounced agreement is visible to David in the lead record either way.
 */
function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type DeliveryResult = { delivered: boolean; reason: string };

/**
 * HOLE — INTENTIONALLY NOT WIRED.
 *
 * One email carries the advisory agreement for signature together with Form
 * ADV Part 2 and Form CRS. Sending the agreement IS the email verification:
 * if the visitor opens it and signs, they have proven they control the
 * address, so there is no separate confirm-your-email round trip.
 *
 * The ADV and CRS must be in the client's hands at or before the moment they
 * enter into the advisory agreement — so they ship in this same email, above
 * the signature link. Do not split them into a later message.
 *
 * Waiting on David's choice of e-signature provider. Until then this returns
 * `delivered: false` and the caller tells the visitor the truth: that David
 * will follow up, not that an email is already sitting in their inbox.
 */
async function deliverAgreementPacket(): Promise<DeliveryResult> {
  return { delivered: false, reason: "esignature_provider_not_configured" };
}

export async function POST(request: NextRequest) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = asTrimmedString(body.fullName, MAX_NAME);
  const email = asTrimmedString(body.email, MAX_NAME).toLowerCase();
  const state = asTrimmedString(body.state, MAX_NAME);
  const assetBand = asTrimmedString(body.assetBand, MAX_NAME);
  const notes = asTrimmedString(body.notes, MAX_NOTES);

  if (!fullName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "Please check the email address." },
      { status: 400 },
    );
  }
  if (!US_STATES.includes(state as (typeof US_STATES)[number])) {
    return NextResponse.json({ error: "Please select your state." }, { status: 400 });
  }
  if (!ASSET_BANDS.includes(assetBand as (typeof ASSET_BANDS)[number])) {
    return NextResponse.json({ error: "Please select a range." }, { status: 400 });
  }

  // Record the lead BEFORE attempting delivery. Someone who never signs is
  // still a person David can follow up with — losing them because a mail
  // provider hiccuped would be the worse failure.
  try {
    await getAdminDb()
      .collection(LEADS_COLLECTION)
      .add({
        fullName,
        email,
        state,
        assetBand,
        notes,
        createdAt: FieldValue.serverTimestamp(),
        agreementDelivered: false,
      });
  } catch (error) {
    // Never log the submitted values — this record is client PII.
    console.error(
      "become-a-client: lead capture failed:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "We couldn't save that just now." },
      { status: 500 },
    );
  }

  const delivery = await deliverAgreementPacket();

  return NextResponse.json({
    success: true,
    agreementSent: delivery.delivered,
  });
}
