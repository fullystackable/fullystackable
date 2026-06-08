# Supabase Setup

For this Next.js app, the actual runtime keys go in the root `.env.local` file:

`C:\Users\Wesm1\fullystackable\.env.local`

Use the template in `supabase/keys.example.env` and copy those lines into `.env.local`.

Required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-browser-safe-publishable-key
SUPABASE_SECRET_KEY=your-server-only-secret-key
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` is safe for the browser.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` should be your public client key only.
- `SUPABASE_SECRET_KEY` must stay server-only and must not use `NEXT_PUBLIC_`.
- The helper layer also supports legacy fallback names: `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

Do not store your service role key in a public variable.

## Local Schema Files

- `supabase/migrations/20260607223000_initial_brand_workspace_schema.sql` defines the initial database schema.
- `supabase/seed.sql` provides realistic starter data for brands, campaigns, tasks, contacts, assets, upcoming items, and notes.
- `lib/supabase/` contains the minimal browser/server/admin client helpers and env validation.

The seed data is intentionally metadata-first for assets, so most sample assets are external links and only one sample row uses an upload-style `storage_path`.
