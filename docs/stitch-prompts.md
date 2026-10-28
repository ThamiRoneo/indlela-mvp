# Google Stitch Design Prompts — Indlela

All prompts are consistent: mobile-first (Android), data-light, low-bandwidth friendly. Sample content uses Rustenburg, North West context with ZAR amounts. No design values or shared components are defined in the PRD, so those gaps are flagged in the Questions section.

---

## Style Guide Prompt

Design a style guide for a mobile-first Android app called "Indlela" (isiZulu for "path"). The app helps unemployed youth (18-35) in Rustenburg, North West affordably reach job opportunities by showing minibus taxi fares per rank/route and filtering jobs by transport affordability. Users have low-to-medium tech comfort and use prepaid data on low-end Android phones. The style guide must be data-light, high-contrast, and readable on small screens. Include: color palette, typography scale, spacing system, iconography style, and component states (default, pressed, disabled, loading). Note: the PRD (Section 9) contains the data model, not design values (colors, fonts, spacing). The PRD does not define a Section 8.3 with shared components. Please use sensible defaults that fit a low-data, high-contrast, mobile-first aesthetic and confirm before finalizing.

---

## S1 — Welcome

Design the Welcome screen (S1) for Indlela. Purpose: entry point. Primary action: Sign up or Log in. Features: F1 (Onboarding & Accounts).

Layout: full-screen mobile (Android). Top: app logo and app name "Indlela". Middle: one-line pitch "Indlela helps unemployed youth (18-35) in Rustenburg, North West to affordably reach job opportunities so that transport costs do not block them from attending interviews." Bottom: two buttons stacked — "Create account" (primary) and "Log in" (secondary).

States:
- Normal: logo, pitch, both buttons visible and tappable.
- Loading: not applicable (no data fetch on this screen).
- Empty: not applicable.
- Error: not applicable.
- Offline: not applicable.
- Success: not applicable.

---

## S2 — Sign Up / Log In

Design the Sign Up / Log In screen (S2) for Indlela. Purpose: authentication. Primary action: Authenticate. Features: F1.

Layout: mobile form. Tabs or toggle at top: "Sign up" / "Log in". Sign-up form fields: Email (text input), Password (text input with show/hide eye icon), checkbox "I am 18 or older", checkbox "I agree to the Privacy Notice". "Sign up" button (greyed out until both checkboxes ticked and password is 8+ chars with at least 1 number). Log-in form: Email, Password, "Forgot password?" link, "Log in" button. Error banner area below form.

States:
- Normal: form visible, buttons enabled when valid.
- Empty: not applicable.
- Loading: spinner on button during submit.
- Error: "This email already has an account. Log in instead?" with "Log in" link (duplicate email). Red border on password field with "At least 8 characters, including a number" when invalid. "Too many attempts. Try again in 15 minutes." after 5 failed log-ins.
- Offline: not specified in PRD.
- Success: account created → navigate to S3 with banner "Check your email and tap the link to verify your account." (if verification enabled).

---

## S3 — Set Nearest Rank

Design the Set Nearest Rank screen (S3) for Indlela. Purpose: onboarding. Primary action: Select rank. Features: F1.

Layout: mobile. Title: "Set your nearest rank". Subtitle: "Fares will be shown from this rank." Scrollable list of Rustenburg ranks (e.g., "Rustenburg Taxi Rank", "Boitekong"). Each row: rank name, location hint. "Confirm" button at bottom (disabled until a rank is selected). "Skip" link (small, top-right or bottom).

States:
- Normal: list of ranks, selection highlighted, Confirm enabled.
- Empty: "No ranks available. Please try again later."
- Loading: spinner while fetching ranks.
- Error: "Couldn't load ranks. Try again."
- Offline: not specified in PRD (ranks may be cached).
- Success: rank saved → navigate to S6 Home Feed.

---

## S4 — Fares

Design the Fares screen (S4) for Indlela. Purpose: view fares by route. Primary action: View/Report. Features: F2, F4, F5.

Layout: mobile. Top: selected rank name (e.g., "Rustenburg Taxi Rank") with "Change" link. Fuel-aware alert banner (if applicable): "Fares may increase soon. Check updated fares for your rank." List of routes: each row shows destination, fare amount (ZAR), last reported date, staleness indicator. "Report fare" button per route or floating action. Bottom: "Offline - showing cached fares" banner when offline.

States:
- Normal: list of routes with fares, staleness per BR2 (valid if reported within 14 days).
- Empty: "No fares reported for this rank yet. Be the first to report." with "Report fare" button.
- Loading: spinner while fetching fares.
- Error: "Couldn't load fares. Try again."
- Offline: "Offline - showing cached fares" banner + cached list if available (BR8). If no cache: "No cached fares available. Connect to internet to load fares."
- Success: not applicable (view screen).

---

## S5 — Report Fare

Design the Report Fare screen (S5) for Indlela. Purpose: submit fare. Primary action: Submit report. Features: F2.

Layout: mobile. Title: "Report a fare". Fields: Rank (pre-filled from nearest rank, dropdown to change), Route (dropdown), Amount (ZAR, numeric input). "Submit" button. Confirmation message area.

States:
- Normal: form visible, Submit enabled when all fields filled.
- Empty: not applicable.
- Loading: spinner on Submit during submission.
- Error: "You've reported 5 fares today. Try again tomorrow." (BR3 daily limit). "Failed to submit. Try again." (network error).
- Offline: "No connection. Connect to internet to report fares."
- Success: "Thanks! Fare reported for [Route]." → return to S4.

---

## S6 — Home Feed (Affordability-First)

Design the Home Feed screen (S6) for Indlela. Purpose: jobs feed. Primary action: Browse/filter. Features: F3, F4.

Layout: mobile. Top: toggle "Jobs I can afford this week" + weekly transport budget display (ZAR). Stale fares banner (if applicable): "Some fares are out of date. Report current fares to stay accurate." Scrollable list of job cards. Each card: job title, company, estimated wage (ZAR), transport cost (ZAR), net gain (ZAR). Sort: highest net gain first. Bottom nav: Home, Fares, Profile.

States:
- Normal: job cards with net gain, toggle visible.
- Empty: "No jobs available. Check back later." or "No affordable jobs this week. Try increasing budget or reporting fares."
- Loading: spinner while fetching jobs.
- Error: "Couldn't load jobs. Try again."
- Offline: show cached jobs if available; transport costs flagged as unknown.
- Success: not applicable (feed screen).

---

## S7 — Job Details

Design the Job Details screen (S7) for Indlela. Purpose: job details + transport breakdown. Primary action: View details. Features: F3.

Layout: mobile. Job title, company, location, estimated wage (ZAR). Transport breakdown section: "Transport cost (to and from): R[X]" using nearest rank fare, "Net gain: R[Y]" (wage - transport). Fare source note: "Fare from [Rank] for [Route]. Last reported [date]." If stale: "Last reported X days ago (stale)". If no fare: "Transport cost unknown". Back button.

States:
- Normal: full job details with transport breakdown.
- Empty: not applicable.
- Loading: spinner while fetching job details.
- Error: "Couldn't load job details. Try again."
- Offline: show cached details if available; transport cost flagged if fare stale/unknown.
- Success: not applicable (detail screen).

---

## S10 — Profile / Settings

Design the Profile / Settings screen (S10) for Indlela. Purpose: settings. Primary action: Budget/rank/logout. Features: F1, F4.

Layout: mobile. Sections: "Nearest rank" (current rank with "Change" → S3), "Weekly transport budget" (ZAR input, default unset), "Log out" button, "Delete account" link (small, bottom). App version info.

States:
- Normal: settings visible, inputs editable.
- Empty: not applicable.
- Loading: spinner during save actions.
- Error: "Couldn't save. Try again."
- Offline: "No connection. Changes will not be saved."
- Success: "Saved." confirmation (e.g., after budget update).

---

## Questions (missing or unclear in PRD)

1. **Section 8.2 (Key UI states) does not exist** in the PRD. The prompts above use states derived from Section 6.2 (Edge cases), 4.5 (Notifications), and 4.4 (Business rules). Please confirm these match your intended 8.2 spec.
2. **Section 8.3 (Shared components) does not exist** in the PRD. The style guide prompt has no component list to reference. Please provide shared components (e.g., Button, Input, Card, Banner) or confirm I should use sensible defaults.
3. **Section 9 (Design values) does not exist** — Section 9 is "Data model." The style guide prompt has no colors, fonts, spacing, or iconography values. Please provide a design token set or confirm defaults.
4. **No modal/pop-up screens** are listed in Section 8.1. The PRD template mentions modals (M#) but none are defined. Are there any pop-ups (e.g., delete account confirmation, report fare success)?
5. **S8 (New Post) and S9 (Activity)** appear in the example PRD but not in Indlela's Section 8.1. Should they be added, or is the screen list final?
6. **S2 Sign Up / Log In** combines two screens into one. Should they be separate screens (S2 Sign Up, S3 Log In) or remain combined?
7. **Offline state messages** for S1, S2, S3, S7, S10 are not specified in the PRD. The prompts above mark them as "not specified." Please confirm or provide exact text.
8. **Success state messages** for most screens are not explicitly defined. The prompts use inferred messages. Please confirm.
9. **Sample job listing content** (titles, companies, wage ranges) is not in the PRD. Prompts use placeholder structure. Please provide sample data if available.
10. **Rank list content** (exact Rustenburg rank names beyond "Rustenburg Taxi Rank") is not specified. Please provide the full list.
EOF
echo "done"