# Google Stitch Design Prompts — Indlela (Android, 360 × 800 px)

Reuse the style guide and shared components exactly across all prompts. Keep header and bottom nav bar identical on every screen.

## 0. Style Guide Prompt

Design a style guide for an Android app called Indlela, 360 × 800 px, using ONLY the following design values.

**Color palette (Section 9.1):**
- Primary: #1a73e8 (primary buttons, links, active nav tab)
- Secondary: #34a853 (success states, positive net gain)
- Background: #ffffff (screen background)
- Surface: #f8f9fa (cards, input backgrounds)
- Text primary: #202124 (headings, body text)
- Text secondary: #5f6368 (captions, hints, secondary labels)
- Error: #ea4335 (error messages, negative states)
- Warning: #fbbc04 (stale fare indicators, fuel alerts)
- Border: #dadce0 (input borders, dividers)
- Disabled: #bdc1c6 (disabled buttons, inactive elements)

**Typography (Section 9.2):**
- Font family: System default (Roboto on Android)
- H1: 24px / 32px, Bold (700) — screen titles
- H2: 20px / 28px, Semibold (600) — section headers
- H3: 16px / 24px, Semibold (600) — card titles, subsection headers
- Body: 14px / 20px, Regular (400) — body text, descriptions
- Caption: 12px / 16px, Regular (400) — hints, timestamps, secondary info
- Button: 14px / 20px, Medium (500) — button labels
- Input: 14px / 20px, Regular (400) — input field text

**Spacing (Section 9.3):**
- xs: 4px (tight gaps, icon padding)
- sm: 8px (between related elements)
- md: 16px (standard padding, card margins)
- lg: 24px (section spacing)
- xl: 32px (screen-level padding top/bottom)
- Touch target minimum: 48px (all tappable elements)

**Iconography (Section 9.4):**
- Style: Material Design outlined icons
- Size: 24px default, 20px in compact areas
- Color: Text primary (#202124) default, Primary (#1a73e8) for active states

**Shared components (Section 8.3):**
1. Button — Primary, secondary, text, disabled, loading (spinner)
2. TextInput — Default, focused, error (red border + message), disabled
3. Card — Job card (title, company, wage, transport cost, net gain), Fare card (route, amount, staleness)
4. Banner — Alert (fuel increase), info (stale fares), error, success
5. Toggle — On/off (affordability filter)
6. Filter chip — Selected / unselected
7. List item — Default, selected, disabled
8. Spinner — Small (inline), large (full-screen loading)
9. Empty state — Icon + message + optional action button
10. Top app bar — Title, back button, optional action
11. Bottom navigation bar — 5 tabs: Home, Fares, Alerts, Activity, Profile

Show each component in all its variants side by side with labels. Do not invent additional components or styles.

---

## 1. S1 — Welcome

Design screen "S1" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Entry point. Primary action: Sign up or Log in. Features: F1. Notes: Data-light, logo + pitch + 2 buttons.

**Layout (Normal):**
- Top app bar: "Indlela" (H1, centered)
- Logo placeholder (grey box labelled "TODO: app logo")
- Pitch text (Body): "Find jobs you can afford to reach. Track minibus taxi fares from your rank."
- Button: "Sign up" (Primary)
- Button: "Log in" (Secondary, below)

**States (8.2):**
- Normal: as above
- Empty: N/A
- Loading: N/A
- Error: N/A
- Offline: N/A
- Success: N/A

**Sample content:** None required beyond pitch.

---

## 2. S2 — Sign Up

Design screen "S2" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Create account. Primary action: Register. Features: F1. Notes: Email, password, age checkbox, privacy checkbox.

**Layout (Normal):**
- Top app bar: "Sign up" with back button
- TextInput: label "Email", placeholder "you@example.com"
- TextInput: label "Password", placeholder "At least 8 characters, including a number", secure
- Checkbox: "I confirm I am 18 years or older"
- Checkbox: "I agree to the privacy policy"
- Button: "Sign up" (Primary, enabled when all fields valid)
- Text link: "Already have an account? Log in" (text button)

**States (8.2):**
- Normal: form with all fields, Sign up button enabled when valid
- Empty: N/A
- Loading: Spinner on button
- Error: "This email already has an account. Log in instead?" with link; red border + "At least 8 characters, including a number" on password
- Offline: Not specified
- Success: Account created → S3 with banner "Account created. Please verify your email."

**Sample content:** Email: "lerato.mokoena@gmail.com", password field filled.

**TODOs:** privacy policy screen not in PRD.

---

## 3. S3 — Log In

Design screen "S3" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Authenticate. Primary action: Log in. Features: F1. Notes: Email, password, forgot password link.

**Layout (Normal):**
- Top app bar: "Log in" with back button
- TextInput: label "Email", placeholder "you@example.com"
- TextInput: label "Password", placeholder "Enter your password", secure
- Text link: "Forgot password?" (text button)
- Button: "Log in" (Primary)
- Text link: "Don't have an account? Sign up" (text button)

**States (8.2):**
- Normal: Email + password form, Log in button
- Empty: N/A
- Loading: Spinner on button
- Error: "Please verify your email first." + "Resend email" link; "Too many attempts. Try again in 15 minutes."
- Offline: Not specified
- Success: Verified → S4 or S7

**Sample content:** Email: "lerato.mokoena@gmail.com".

---

## 4. S4 — Set Nearest Rank

Design screen "S4" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Onboarding. Primary action: Select rank. Features: F1. Notes: Required before feed works fully.

**Layout (Normal):**
- Top app bar: "Set your nearest rank" with back button
- Body text (Body): "Choose the taxi rank closest to you so we can show fares from your rank."
- List of ranks (List items, single select, with radio indicator):
  - "Rustenburg Taxi Rank — Rustenburg CBD"
  - "Boitekong Taxi Rank — Boitekong"
  - "Tlhabane Taxi Rank — Tlhabane"
  - "Phokeng Taxi Rank — Phokeng"
  - "Geelhout Park Rank — Geelhout Park"
- Button: "Confirm" (Primary, enabled when selection made)

**States (8.2):**
- Normal: List of ranks, selection highlighted, Confirm enabled
- Empty: "No ranks available. Please try again later." + "Retry" button
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load ranks. Try again." + "Retry" button
- Offline: Not specified
- Success: Rank saved → S7

**Sample content:** "Rustenburg Taxi Rank — Rustenburg CBD" selected.

---

## 5. S5 — Fares

Design screen "S5" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: View fares by route. Primary action: View/Report. Features: F2, F4, F5. Notes: Staleness, offline banner, fuel alert.

**Layout (Normal):**
- Top app bar: "Fares" with rank name "Rustenburg Taxi Rank" as subtitle
- Banner (alert, if fuel condition met): "Fares may increase soon. Check updated fares for your rank."
- Banner (info, if stale): "Some fares are out of date. Report current fares to stay accurate."
- Section header (H2): "Routes from your rank"
- List of Fare cards:
  - Card: route "Rustenburg → Johannesburg Park Station", amount "R180", staleness "Reported 3 days ago"
  - Card: route "Rustenburg → Pretoria CBD", amount "R150", staleness "Reported 1 day ago"
  - Card: route "Rustenburg → Brits", amount "R45", staleness "Reported 8 days ago (stale)" (warning color)
  - Card: route "Rustenburg → Sun City", amount "R60", staleness "Reported 2 days ago"
- Button (text): "Report a fare" → S6

**States (8.2):**
- Normal: routes with fares, staleness per BR2
- Empty: "No fares reported for this rank yet. Be the first to report." + "Report fare" button
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load fares. Try again." + "Retry" button
- Offline: "Offline - showing cached fares" banner + cached list; if no cache: "No cached fares available. Connect to internet to load fares."
- Success: N/A (view screen)

**Sample content:** 4 routes as above.

---

## 6. S6 — Report Fare

Design screen "S6" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Submit fare. Primary action: Submit report. Features: F2. Notes: Daily limit enforced (BR3).

**Layout (Normal):**
- Top app bar: "Report a fare" with back button
- Body text (Body): "Report the current fare for a route from your rank."
- TextInput: label "Route", placeholder "Select route"
- TextInput: label "Fare amount (ZAR)", placeholder "e.g. 180"
- Button: "Submit report" (Primary)
- Caption: "You can report up to 5 fares per day."

**States (8.2):**
- Normal: Form (rank, route, amount), Submit enabled
- Empty: N/A
- Loading: Spinner on Submit button
- Error: "You've reported 5 fares today. Try again tomorrow." (BR3); "Failed to submit. Try again."
- Offline: "No connection. Connect to internet to report fares."
- Success: "Thanks! Fare reported for [Route]." → M2 → S5

**Sample content:** Route: "Rustenburg → Johannesburg Park Station", Amount: "180".

---

## 7. S7 — Home Feed

Design screen "S7" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Jobs feed. Primary action: Browse/filter. Features: F3, F4. Notes: Sorted by Net Gain, affordability filter.

**Layout (Normal):**
- Top app bar: "Home" with profile icon action
- Toggle: "Jobs I can afford this week" (on/off) (F3)
- Filter chips: "All jobs", "Affordable", "High net gain" (selected/unselected)
- Section header (H2): "Jobs sorted by net gain"
- List of Job cards:
  - Card: title "Retail Assistant", company "Shoprite Rustenburg", wage "R3,500/month", transport cost "R450", net gain "+R3,050" (positive, green)
  - Card: title "Call Centre Agent", company "Teleperformance", wage "R6,000/month", transport cost "R720", net gain "+R5,280" (positive, green)
  - Card: title "Warehouse Packer", company "Logistics Co.", wage "R4,200/month", transport cost "R540", net gain "+R3,660" (positive, green)
  - Card: title "Security Guard", company "Securitas", wage "R5,500/month", transport cost "R900", net gain "+R4,600" (positive, green)
- Each card tappable → S8

**States (8.2):**
- Normal: Job cards with net gain, toggle visible
- Empty: "No jobs available. Check back later." OR "No affordable jobs this week. Try increasing budget or reporting fares." + empty state icon
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load jobs. Try again." + "Retry" button
- Offline: Cached jobs if available; transport costs flagged unknown
- Success: N/A (feed screen)

**Sample content:** 4 job cards as above.

---

## 8. S8 — Job Details

Design screen "S8" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Job + transport breakdown. Primary action: View details. Features: F3. Notes: Fare source, staleness, net gain.

**Layout (Normal):**
- Top app bar: "Job details" with back button
- H1: "Retail Assistant"
- Body: "Shoprite Rustenburg" (company)
- Body: "R3,500/month" (wage)
- Body: "Rustenburg CBD, North West" (location)
- Section header (H2): "Transport cost breakdown"
- Body: "Nearest rank: Rustenburg Taxi Rank"
- Body: "Route: Rustenburg → Rustenburg CBD (local)"
- Body: "Estimated transport cost: R450 (return)"
- Body: "Fare source: FareReport, reported 3 days ago"
- Body: "Net gain: +R3,050" (green, bold)
- Button: "Apply" (text link, external) — TODO: application flow not in PRD

**States (8.2):**
- Normal: Full job details + transport breakdown
- Empty: N/A
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load job details. Try again." + "Retry" button
- Offline: Cached details if available; transport cost flagged if fare stale/unknown
- Success: N/A (detail screen)

**Sample content:** Retail Assistant at Shoprite Rustenburg, R3,500/month, R450 transport, net gain +R3,050.

**TODOs:** "Apply" button external link flow not specified in PRD.

---

## 9. S9 — Fare Alerts

Design screen "S9" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: Fuel-aware alerts. Primary action: View alerts. Features: F4. Notes: Shows fare increase warnings.

**Layout (Normal):**
- Top app bar: "Fare Alerts"
- List of alert items (List item):
  - "Fares may increase soon. Check updated fares for your rank." — "2 days ago" — route "Rustenburg → Johannesburg Park Station"
  - "Fares may increase soon. Check updated fares for your rank." — "5 days ago" — route "Rustenburg → Pretoria CBD"
- Caption: "Alerts shown when fuel prices rise by 5% or more in 30 days."

**States (8.2):**
- Normal: List of alerts with fare increase warnings
- Empty: "No fare alerts. Your routes are stable." + empty state icon
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load alerts. Try again." + "Retry" button
- Offline: "Offline - showing cached alerts"
- Success: N/A (view screen)

**Sample content:** 2 alerts as above.

---

## 10. S10 — Activity

Design screen "S10" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: User activity log. Primary action: View activity. Features: —. Notes: Fare reports submitted, alerts received.

**Layout (Normal):**
- Top app bar: "Activity"
- Section header (H2): "Recent activity"
- List of activity items (List item):
  - "Reported fare: Rustenburg → Johannesburg Park Station, R180" — "24 Oct 2026, 14:32"
  - "Reported fare: Rustenburg → Brits, R45" — "22 Oct 2026, 09:15"
  - "Fare alert received: Rustenburg → Johannesburg Park Station" — "20 Oct 2026, 08:00"
  - "Reported fare: Rustenburg → Pretoria CBD, R150" — "18 Oct 2026, 11:45"

**States (8.2):**
- Normal: List of user activity (fare reports, alerts received)
- Empty: "No activity yet. When you report fares or receive alerts, you'll see them here." + empty state icon
- Loading: Spinner (large, full-screen)
- Error: "Couldn't load activity. Try again." + "Retry" button
- Offline: "Offline - showing cached activity"
- Success: N/A (view screen)

**Sample content:** 4 activity items as above.

---

## 11. S11 — Profile / Settings

Design screen "S11" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1):** Purpose: User settings. Primary action: Budget/rank/logout. Features: F1, F4. Notes: Budget input (ZAR), change rank, delete account.

**Layout (Normal):**
- Top app bar: "Profile & Settings"
- Section header (H2): "Account"
- Body: "lerato.mokoena@gmail.com" (email, read-only)
- Button: "Log out" (text button)
- Section header (H2): "Transport"
- Body: "Nearest rank: Rustenburg Taxi Rank" + text link "Change" → S4
- TextInput: label "Weekly transport budget (ZAR)", placeholder "e.g. 500"
- Button: "Save" (Primary)
- Section header (H2): "Danger zone"
- Button: "Delete account" (text button, error color) → M1

**States (8.2):**
- Normal: Settings visible, inputs editable
- Empty: N/A
- Loading: Spinner during save
- Error: "Couldn't save. Try again." + "Retry"
- Offline: "No connection. Changes will not be saved."
- Success: "Saved." confirmation

**Sample content:** Email: "lerato.mokoena@gmail.com", budget: "500", rank: "Rustenburg Taxi Rank".

---

## 12. M1 — Delete Account Modal

Design screen "M1" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1 Modals):** Trigger: Profile → "Delete account". Purpose: Confirm permanent deletion.

**Layout (Normal):**
- Modal overlay (semi-transparent dark background)
- Modal card (Surface, centered):
  - H2: "Delete account?"
  - Body: "Are you sure? This will permanently delete your account and all data."
  - Button: "Cancel" (secondary)
  - Button: "Delete" (error color, primary style)

**States (8.2):**
- Normal: Confirmation dialog: "Are you sure? This will permanently delete your account and all data." with "Cancel" and "Delete" buttons
- Empty: N/A
- Loading: Spinner on Delete
- Error: "Couldn't delete account. Try again."
- Offline: "No connection. Try again when online."
- Success: "Account deleted." → S1

**Sample content:** None.

---

## 13. M2 — Report Success Modal

Design screen "M2" for my Android app at 360 × 800 px.
- Reuse the style guide and shared components exactly. Keep the header and tab bar identical to my other screens.
- Include every element in the order listed in the spec. Use the exact labels, placeholder text and messages in quotation marks.
- Fill the screen with the sample content given. Use South African names, places, rand and dates. Never use lorem ipsum.
- Design the Normal state first, then one extra frame for each other state in the spec (Empty, Loading, Error, Offline, Success).
- Do not invent features, buttons, screens or text. If something you need is missing, put a grey box labelled "TODO: [what is missing]" and list all TODOs under the design.

**Spec (Section 8.1 Modals):** Trigger: After fare report submitted. Purpose: Confirm report received.

**Layout (Normal):**
- Modal overlay (semi-transparent dark background)
- Modal card (Surface, centered):
  - Icon: checkmark (success color #34a853)
  - H2: "Report received"
  - Body: "Thanks! Fare reported for Rustenburg → Johannesburg Park Station."
  - Button: "OK" (Primary)

**States (8.2):**
- Normal: Modal: "Thanks! Fare reported for [Route]." with "OK" button
- Empty: N/A
- Loading: N/A
- Error: N/A
- Offline: N/A
- Success: Dismiss → S5

**Sample content:** Route: "Rustenburg → Johannesburg Park Station".

---

## Questions / Missing or Unclear Items

1. **Privacy policy screen** — S2 references a privacy policy checkbox but no screen is listed in Section 8.1. Added as TODO in S2.
2. **"Apply" button flow** — S8 references an "Apply" action but no application flow or screen is defined in the PRD. Added as TODO in S8.
3. **Forgot password flow** — S3 links to "Forgot password?" but no reset screen is listed in Section 8.1. Added as TODO in S3.
4. **Offline state for S2, S3, S4** — Section 8.2 lists "Not specified" for offline on these screens. Confirm whether offline handling is needed or if they should show a generic "No connection" message.
5. **Job card wage format** — PRD says "wage_zar" but does not specify display format (monthly vs daily vs hourly). Used "R3,500/month" as sample; confirm.
6. **Activity screen data model** — S10 (Activity) is not backed by any entity in Section 10 (Data model). Confirm if a new "UserActivity" entity is needed or if it derives from FareReport + notifications.
7. **Fare Alerts trigger** — S9 shows alerts but Section 4.5 notifications table only defines in-app banners, not a dedicated alerts screen. Confirm S9 is intended or if alerts should only appear as banners on S5.
8. **Bottom nav on auth screens** — S1, S2, S3 do not list bottom nav in Section 8.1 notes. Assumed no bottom nav on auth/onboarding screens; confirm.
EOF
echo "done"