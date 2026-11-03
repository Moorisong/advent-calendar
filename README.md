# Dear Choco — Pixel Advent Calendar

This is the **design-faithful UI prototype** with Korean / English UI and social sign-in integration points for **Kakao** and **Google**.

The original, unaltered twelve-screen prototype is kept in `public/design-reference.html`.

## Local development

Requires Node.js 22+.

```bash
cp .env.example .env.local
# Fill in your own Supabase project's URL and publishable key.
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Configure social sign-in (required)

Use a dedicated Supabase project for Dear Choco. Do **not** copy another app's service-role token into the client.

1. In the Supabase dashboard, open **Authentication → Sign In / Providers**, enable **Google** and **Kakao**.
2. Create a Google Cloud OAuth web client. Register the **Supabase callback** `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI. Enter the Google client ID and secret in Supabase, not in this repository.
3. Create a Kakao Developers application, enable Kakao Login, obtain its REST API key (client ID) and client secret, and register the **same Supabase callback** in Kakao Developers. Enter those credentials into Supabase.
4. In Supabase **Authentication → URL Configuration**, set the production Site URL and allow the exact frontend callback `https://YOUR-SITE.example/auth/callback`. For local development also allow `http://localhost:5173/auth/callback`.
5. Put only these **public** values into local or deployment environment:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy `VITE_SUPABASE_ANON_KEY`).
6. Production hosting needs SPA rewrite to `index.html`, including `/auth/callback`.

See the official [Google guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google) and [Kakao guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-kakao).

**Without the provider application credentials and allowed callbacks, the buttons display an unavailable/error state and cannot complete real OAuth.** Both providers must be configured before live testing.

## UX / access rules

- Public: landing `/`, friend calendar `/c/demo`, first-visit tutorial, finished-season preview.
- Sign-in page: `/login`; return callback: `/auth/callback`.
- Login required for `/create`, `/created`, `/c/demo/write`, `/c/demo/sent`, and owner/read/empty/locked preview pages.
- Visitors can **view** a friend's calendar without login, but must sign in to **leave a chocolate**.
- Sign-in intent is stored in sessionStorage on the same origin so the app returns to the selected action, month and day after OAuth.
- Header includes sign-out when signed in.
- Owner view contains both **Share with friends** and **Create another calendar** actions.
- Korean/English labels and all original pixel SVGs, drawer UI, motion, snow and responsive design are preserved.

## Important scope limitation

**The calendar itself is still a UI prototype.** Its sample nickname, owner route, messages, secret link, dates and share-toasts are placeholders inherited from the original design. Calendar creation and note submission do **not** persist anything yet. OAuth wiring is real **only after provider setup**, but the availability of a user session is currently used for frontend UI routing, not for data authorization.

When backend implementation starts, **verify the authenticated user on the server** and enforce calendar ownership with RLS or equivalent server-side checks. Do not trust frontend guards, owner URLs, or user-editable profile metadata as authorization.

The original date examples still show December 12, 2026, not a live time check.

## Verification

Static JavaScript syntax check and offline browser preview of login screens and route guards were performed. Google/Kakao end-to-end OAuth and package build could not be verified here because no dedicated Supabase project/provider credentials or installed npm dependencies were available. Dependencies are pinned in package.json; generate/commit a lockfile on a connected development machine after installing.
