
# How to develop

We're using Supabase! Super easy to use, look:

Edit the tables in the online editor, and dump the schema here:
```
npx supabase db pull
```

This will give you files in `supabase/migrations/`, and you can then
run those migrations in the Supabase UI, or with `npx supabase db migrate`.
