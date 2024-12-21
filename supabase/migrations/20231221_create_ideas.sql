create table if not exists public.ideas (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    submitted_by uuid references auth.users(id) on delete cascade not null,
    idea text not null,
    reacts jsonb default '{}'::jsonb not null,
    num_reacts integer default 0 not null
);

-- Set up RLS
alter table public.ideas enable row level security;

create policy "Users can create ideas"
    on public.ideas
    for insert
    to authenticated
    with check (true);

create policy "Users can view all ideas"
    on public.ideas
    for select
    to authenticated
    using (true);

create policy "Users can update reactions"
    on public.ideas
    for update
    to authenticated
    using (true)
    with check (true);
