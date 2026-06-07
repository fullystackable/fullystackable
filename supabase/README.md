# Supabase Setup

For this Next.js app, the actual runtime keys go in the root `.env.local` file:

`C:\Users\Wesm1\fullystackable\.env.local`

Use the template in `supabase/keys.example.env` and copy those lines into `.env.local`.

Required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` is safe for the browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be your public client key only.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only and must not use `NEXT_PUBLIC_`.

Do not store your service role key in a public variable.
