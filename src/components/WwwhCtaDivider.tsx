import styles from "./WhatWhyWhoHow.module.css";

const dividerLinks = [
  {
    label: "Get started",
    href: "https://smarterwaywealth.com/meet",
    external: true,
  },
  {
    label: "See if SWW is a good fit",
    href: "https://smarterwaywealth.com/#fit",
    external: true,
  },
  { label: "FAQ", href: "/faq", external: false },
] as const;

export function WwwhCtaDivider({
  location = "home_wwwh_divider",
}: {
  location?: string;
}) {
  return (
    <nav className={styles.divider} aria-label="Next steps">
      {dividerLinks.map((link) => (
        <a
          key={link.href}
          className={styles.dividerLink}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noreferrer" : undefined}
          data-posthog-cta="true"
          data-posthog-cta-label={link.label}
          data-posthog-cta-location={location}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
