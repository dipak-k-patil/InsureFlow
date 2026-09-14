# InsureFlow → Production-Ready Build

Turning the mock CRM into a real, single-agent SaaS product with strong auth, real database, backend cron reminders, notifications, file uploads, and full mobile responsiveness.

## 1. Backend Foundation (Lovable Cloud)

Enable Lovable Cloud. Create schema (all tables owned by `user_id = auth.uid()` — strict per-user RLS):

- `profiles` — full_name, phone, agency_name, avatar_url, timezone (auto-created on signup via trigger)
- `leads` — name, phone, email, source, status (kanban), notes, value
- `policies` — client, phone, email, provider, policy_no, type, premium, commission_rate, start_date, end_date, pdf_url, status
- `commission_rules` — provider, default_rate (per user)
- `reminder_settings` — per-user JSON: milestones enabled + channels
- `reminder_log` — policy_id, milestone, sent_at, channel, wa_link
- `notifications` — title, body, type, read, link, created_at (realtime enabled)

Every table: `GRANT`s, RLS `USING (auth.uid() = user_id)`, indexes on `user_id` + `end_date`.

Storage buckets: `avatars` (public), `policy-docs` (private, per-user path).

## 2. Authentication

- Email/password + Google OAuth (Lovable Cloud managed)
- `/auth` page — sign in / sign up / forgot password tabs, Google button
- `/reset-password` page (recovery flow)
- `ProtectedRoute` wrapper — redirects unauthed users to `/auth`, uses `onAuthStateChange` + `getUser()`
- Auto-create profile row via DB trigger on signup
- Auto-seed default commission rules for new user

## 3. Real Data Wiring

Replace mock arrays in Leads, Policies, Renewals, Commissions with Supabase queries via React Query. Add create/edit/delete dialogs for leads and policies. Keep existing UI/UX — just swap the data source.

## 4. Backend Cron Reminder Scheduler

Edge function `reminder-scheduler` runs hourly via `pg_cron`:
- For every user's active policies compute `daysLeft`
- Fire once per milestone (60/30/15/7/5) and daily after 5
- Insert into `reminder_log` + `notifications`
- WhatsApp = mock (deep link stored in log; no external send)

Removes browser dependency — works even when app is closed.

## 5. Notifications (In-App Bell)

- Topbar bell shows unread count from `notifications` table
- Realtime subscription for new inserts (toast + counter bump)
- Dropdown panel with list, mark-as-read, mark-all-read

## 6. Profile & Settings (Real)

- Profile page: edit name, phone, agency, avatar upload to `avatars` bucket
- Security: change password
- Commission rules moved to Settings (persisted in DB)
- Reminder settings persisted in DB (replace localStorage)

## 7. File Uploads

- Policy add/edit dialog → PDF upload to `policy-docs/{user_id}/{policy_id}.pdf`
- Signed URL for download
- Avatar upload with crop-free preview

## 8. Mobile Responsive

- Sidebar → drawer (Sheet) on mobile, hamburger in Topbar
- Tables → card layout below `md` breakpoint (Renewals, Policies, Leads)
- Stat grids already responsive; audit dialog widths, form stacking
- Bottom padding for mobile safe area

## Technical Details

- Stack additions: `@supabase/supabase-js` (via Cloud), `@tanstack/react-query` (already installed)
- Session pattern: `onAuthStateChange` listener + synchronous `setSession`; use `getUser()` for trust-required checks
- RLS-first: every query implicitly scoped by `auth.uid()`; never trust client-supplied `user_id`
- Cron: `pg_cron` + `pg_net` to invoke edge function; idempotency via unique `(policy_id, milestone, date-for-daily)` check in log
- Realtime: enable `REPLICA IDENTITY FULL` + publication on `notifications`
- React Query keys per resource; invalidate on mutation
- Zod validation on all forms

## Out of Scope (explicit)

- Real WhatsApp API sending (mock-only per your choice — easy to add later)
- Team members / roles (single-agent only per your choice)
- Marketing/Automation AI features remain UI-only stubs
- Payments/subscription (existing UI stays as-is)

## Order of Delivery

1. Enable Cloud + schema + RLS + triggers
2. Auth pages + protected routes + profile
3. Wire Leads, Policies, Renewals, Commissions to real data
4. Notifications + realtime bell
5. Reminder cron edge function
6. File uploads (avatar, policy PDF)
7. Mobile responsive pass across all pages

Approve karo to main step-by-step build karna shuru karta hoon.
