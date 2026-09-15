/**
 * Sign-up form vocabulary, shared by the form and the API route so the two
 * can't drift apart.
 */

/** Where the firm is registered. Drives the out-of-state note on the form. */
export const HOME_STATE = "Connecticut";

/**
 * Standard minimum is $250,000 in investable assets (Form ADV Part 2A), and
 * the firm may waive it at its discretion. The form surfaces this rather than
 * blocking — see the FAQ entry `account-minimum`.
 */
export const BELOW_MINIMUM_BAND = "Under $250,000";

export const ASSET_BANDS = [
  BELOW_MINIMUM_BAND,
  "$250,000 – $500,000",
  "$500,000 – $1 million",
  "Over $1 million",
] as const;

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
] as const;
