"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./WhatWhyWhoHow.module.css";

export const WWWH_ANSWERS = [
  {
    key: "what",
    label: "WHAT",
    body: "Smarter Way Wealth provides an investment and financial planning relationship with an experienced, highly credentialed advisor, for just $100 a month.",
  },
  {
    key: "why",
    label: "WHY",
    body: "Because not everyone needs to be paying massive, asset-based fees to get good advice.",
  },
  {
    key: "who",
    label: "WHO",
    body: "David Van Osdol, CFA charterholder and CFP® professional, with over 20 years’ experience.",
  },
  {
    key: "how",
    label: "HOW",
    body: "We use technology to automate back-office functions, have no corporate overhead, and use published asset allocation models from firms like Goldman Sachs, Fidelity, and Schwab, with low-to-no-cost mutual funds and ETFs. No need to move your accounts.",
  },
] as const;

export function WhatWhyWhoHow() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={styles.surface}
      aria-label="What, why, who, and how Smarter Way Wealth works"
    >
      {WWWH_ANSWERS.map((answer, index) => (
        <motion.section
          key={answer.key}
          className={`${styles.answer} ${styles[answer.key]}`}
          aria-labelledby={`wwwh-${answer.key}`}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8%" }}
          transition={{
            duration: reduceMotion ? 0 : 0.56,
            delay: reduceMotion ? 0 : index * 0.03,
            ease: [0.2, 0.75, 0.25, 1],
          }}
        >
          <div className={styles.spine}>
            <motion.div
              className={styles.labelSettle}
              initial={reduceMotion ? false : { y: 10 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: reduceMotion ? 0 : 0.7,
                ease: [0.2, 0.75, 0.25, 1],
              }}
            >
              <h2 className={styles.label} id={`wwwh-${answer.key}`}>
                {answer.label}
              </h2>
            </motion.div>
          </div>
          <div className={styles.copy}>
            <p className={styles.statement}>
              {answer.body}
              {answer.key === "how" ? (
                <>
                  {" "}
                  <a
                    className={styles.inlineLink}
                    href="/faq"
                    data-posthog-cta="true"
                    data-posthog-cta-label="FAQ"
                    data-posthog-cta-location="home_wwwh_how"
                  >
                    FAQ
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </motion.section>
      ))}
    </section>
  );
}
