create extension if not exists "uuid-ossp";

create table if not exists public.contestants (
  id uuid primary key default uuid_generate_v4(),
  contestant_number text not null unique,
  name text not null,
  department text not null,
  faculty text not null,
  bio text not null,
  photo_url text not null,
  votes integer not null default 0 check (votes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.contestants(id) on delete restrict,
  transaction_reference text not null unique,
  payer_name text not null,
  payer_email text not null,
  payer_phone text not null,
  vote_quantity integer not null check (vote_quantity > 0),
  amount_paid integer not null check (amount_paid >= 0),
  verified boolean not null default false,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.vote_logs (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.contestants(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  votes_added integer not null check (votes_added > 0),
  created_at timestamptz not null default now()
);

alter table public.contestants enable row level security;
alter table public.payments enable row level security;
alter table public.vote_logs enable row level security;

create policy "Public can view contestants"
  on public.contestants for select
  using (true);

create policy "Admins can manage contestants"
  on public.contestants for all
  using (auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')))
  with check (auth.jwt() ->> 'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

create or replace function public.process_verified_vote(
  p_candidate_id uuid,
  p_payment_id uuid,
  p_votes_added integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  already_processed boolean;
begin
  select processed into already_processed
  from payments
  where id = p_payment_id
  for update;

  if already_processed then
    raise exception 'Payment has already been processed';
  end if;

  update contestants
  set votes = votes + p_votes_added
  where id = p_candidate_id;

  insert into vote_logs(candidate_id, payment_id, votes_added)
  values (p_candidate_id, p_payment_id, p_votes_added);

  update payments
  set processed = true, verified = true
  where id = p_payment_id;
end;
$$;

alter publication supabase_realtime add table public.contestants;
