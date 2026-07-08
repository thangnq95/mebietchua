# Supabase setup for `mebietchua.com`

This project keeps Hugo on GitHub Pages and uses Supabase only for auth + profile storage.

## What to create

1. Create a free Supabase project.
2. Open the SQL editor and run [`schema.sql`](./schema.sql).
3. In Authentication, enable Google login.
4. Add these redirect URLs:
   - `https://mebietchua.com/cong-cu/tang-truong-who/`
   - `https://mebietchua.com/`
5. Copy the public Project URL and `anon` key into Hugo params:
   - `params.supabase.url`
   - `params.supabase.anonKey`

## How the app behaves

- If Supabase config is missing, the WHO tool stays in guest mode and saves data only in `localStorage`.
- If the user signs in with Google, the tool loads/syncs `profiles` and `children` rows for that account.
- RLS ensures each user can only see their own rows.

## Tables

- `profiles`: one row per auth user
- `children`: many child profiles per user

## Notes

- The anon key is public by design.
- Do not commit any service role key into this repo.
- The app computes age from `dob` on every load, so no age history table is needed for v1.
