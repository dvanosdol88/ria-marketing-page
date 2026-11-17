/**
 * CFP Board's required legal tagline, word for word.
 *
 * Source: CFP Board, "How to Use the CFP Marks" > "Using the Trademark Tagline"
 * (https://www.cfp.net/for-cfp-professionals/marketing-toolkit/how-to-use-the-cfp-marks,
 * read 2026-11-17): the tagline "is required when using the certification
 * marks on all websites, marketing materials and other promotional materials."
 *
 * David's order (2026-11-17, ~11:59 AM ET): add it on all sites that need it,
 * "but ONLY where it is required, no where else." So it joins the legal small
 * print only on the pages that show the CFP® mark. The Blues page shows no
 * mark and uses its own footer, so it never gets it. smarterwaywealth.com
 * carries the same notice on its own mark-bearing pages.
 * Do not reword it; CFP Board owns the wording.
 */
export const CFP_MARKS_NOTICE =
  "Certified Financial Planner Board of Standards Center for Financial Planning, Inc. owns and licenses the certification marks CFP®, CERTIFIED FINANCIAL PLANNER®, and CFP® (with plaque design) in the United States to Certified Financial Planner Board of Standards, Inc., which authorizes individuals who successfully complete the organization’s initial and ongoing certification requirements to use the certification marks.";

/**
 * Pages that show the CFP® mark (checked on the live site 2026-11-17). When
 * the mark is added to another page, add that page here; when it is removed,
 * take the page out.
 */
export const CFP_MARK_ROUTES: readonly string[] = [
  "/",
  "/upgrade-your-advice",
  "/improve-your-tools",
];

export function CfpMarksNotice({ className = "" }: { className?: string }) {
  return (
    <p data-cfp-marks-notice="" className={className}>
      {CFP_MARKS_NOTICE}
    </p>
  );
}
