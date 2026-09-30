-- ============ enums ============
do $$ begin
  create type public.app_role as enum ('admin','moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('Submitted','Reviewing','Price Quoted','Payment Pending','In Progress','Quality Check','Completed','Delivered','Cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('Unpaid','Payment Submitted','Payment Verified','Refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.file_kind as enum ('student','proof','delivery');
exception when duplicate_object then null; end $$;

-- ============ helpers ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ profiles ============
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  university  text,
  student_id  text,
  avatar_url  text,
  provider    text,
  suspended   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.user_roles (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role    public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.is_active_student()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and suspended = false)
$$;

-- ============ services ============
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  icon        text not null default '📘',
  name        text not null,
  description text not null default '',
  price       integer not null default 0,
  turnaround  text not null default '',
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============ orders ============
create sequence public.order_code_seq start 10481;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique default ('PA-' || nextval('public.order_code_seq')),
  user_id        uuid not null references auth.users(id) on delete cascade,
  service_id     uuid references public.services(id) on delete set null,
  service_name   text not null default '',
  title          text not null,
  module         text not null default '',
  course         text not null default '',
  university     text not null default '',
  assign_type    text not null default 'Essay',
  description    text not null default '',
  word_count     integer,
  ref_style      text not null default 'Harvard',
  deadline       date not null,
  preferred_date date,
  budget         integer,
  phone          text not null default '',
  extra          text,
  status         public.order_status not null default 'Submitted',
  payment_status public.payment_status not null default 'Unpaid',
  price          integer,
  payment_method text,
  admin_notes    text not null default '',
  delivery_msg   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_events (
  id       uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status   public.order_status not null,
  at       timestamptz not null default now()
);
create index order_events_order_idx on public.order_events(order_id);

create table public.order_files (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  kind      public.file_kind not null default 'student',
  name      text not null,
  size      integer not null default 0,
  path      text not null,
  created_at timestamptz not null default now()
);
create index order_files_order_idx on public.order_files(order_id);

-- ============ messages / notifications / reviews ============
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  sender     text not null check (sender in ('student','admin')),
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_user_idx on public.messages(user_id);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id);

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  name       text not null,
  rating     integer not null check (rating between 1 and 5),
  body       text not null default '',
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id           integer primary key default 1 check (id = 1),
  bank_name    text not null default 'Bank of Ceylon',
  account_name text not null default 'Pahana (Pvt) Ltd',
  account_no   text not null default '0000 0000 00',
  branch       text not null default 'Colombo',
  instructions text not null default 'Use your Order ID as the payment reference, then upload the slip.',
  tiers        jsonb not null default '[["Basic Assignment",1500],["Standard Assignment",3000],["Advanced Assignment",5000],["Project / Final Year Work",0]]'::jsonb,
  updated_at   timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

-- ============ grants ============
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
revoke select on public.profiles from anon;

grant select on public.user_roles to authenticated;
grant insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;

grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;

grant select, insert on public.order_events to authenticated;
grant all on public.order_events to service_role;

grant select, insert, delete on public.order_files to authenticated;
grant all on public.order_files to service_role;

grant select, insert, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

grant usage on sequence public.order_code_seq to authenticated, service_role;

-- ============ RLS ============
alter table public.profiles      enable row level security;
alter table public.user_roles    enable row level security;
alter table public.services      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_events  enable row level security;
alter table public.order_files   enable row level security;
alter table public.messages      enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews       enable row level security;
alter table public.site_settings enable row level security;

-- profiles
create policy "profiles own read"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles admin read" on public.profiles for select to authenticated using (public.is_admin());
create policy "profiles own update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles admin update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- user_roles
create policy "roles own read"   on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "roles admin read" on public.user_roles for select to authenticated using (public.is_admin());
create policy "roles admin write" on public.user_roles for insert to authenticated with check (public.is_admin());
create policy "roles admin delete" on public.user_roles for delete to authenticated using (public.is_admin());

-- services
create policy "services public read" on public.services for select to anon, authenticated using (active = true);
create policy "services admin read"  on public.services for select to authenticated using (public.is_admin());
create policy "services admin write" on public.services for insert to authenticated with check (public.is_admin());
create policy "services admin update" on public.services for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "services admin delete" on public.services for delete to authenticated using (public.is_admin());

-- orders
create policy "orders own read"   on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "orders admin read" on public.orders for select to authenticated using (public.is_admin());
create policy "orders own insert" on public.orders for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_student()
              and status = 'Submitted' and payment_status = 'Unpaid'
              and price is null and admin_notes = '' and delivery_msg is null);
create policy "orders own update" on public.orders for update to authenticated
  using (auth.uid() = user_id and public.is_active_student())
  with check (auth.uid() = user_id);
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders admin delete" on public.orders for delete to authenticated using (public.is_admin());

-- students may not touch privileged order columns
create or replace function public.guard_order_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  new.status         := old.status;
  new.price          := old.price;
  new.admin_notes    := old.admin_notes;
  new.delivery_msg   := old.delivery_msg;
  new.code           := old.code;
  new.user_id        := old.user_id;
  if new.payment_status not in (old.payment_status, 'Payment Submitted') then
    new.payment_status := old.payment_status;
  end if;
  return new;
end $$;
create trigger orders_guard before update on public.orders
  for each row execute function public.guard_order_update();

create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- first status event for every new order
create or replace function public.order_first_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.order_events (order_id, status) values (new.id, new.status);
  return new;
end $$;
create trigger orders_first_event after insert on public.orders
  for each row execute function public.order_first_event();

-- order_events
create policy "events own read" on public.order_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "events admin read" on public.order_events for select to authenticated using (public.is_admin());
create policy "events admin insert" on public.order_events for insert to authenticated with check (public.is_admin());

-- order_files
create policy "files own read" on public.order_files for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "files admin read" on public.order_files for select to authenticated using (public.is_admin());
create policy "files own insert" on public.order_files for insert to authenticated
  with check (auth.uid() = user_id and kind <> 'delivery'
              and exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "files admin insert" on public.order_files for insert to authenticated with check (public.is_admin());
create policy "files admin delete" on public.order_files for delete to authenticated using (public.is_admin());

-- messages
create policy "messages own read" on public.messages for select to authenticated using (auth.uid() = user_id);
create policy "messages admin read" on public.messages for select to authenticated using (public.is_admin());
create policy "messages own insert" on public.messages for insert to authenticated
  with check (auth.uid() = user_id and sender = 'student' and public.is_active_student());
create policy "messages admin insert" on public.messages for insert to authenticated
  with check (public.is_admin() and sender = 'admin');
create policy "messages own update" on public.messages for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages admin update" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "messages admin delete" on public.messages for delete to authenticated using (public.is_admin());

-- notifications
create policy "notes own read" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notes admin all" on public.notifications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "notes own update" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews
create policy "reviews public read" on public.reviews for select to anon, authenticated using (approved = true);
create policy "reviews own read" on public.reviews for select to authenticated using (auth.uid() = user_id);
create policy "reviews admin read" on public.reviews for select to authenticated using (public.is_admin());
create policy "reviews own insert" on public.reviews for insert to authenticated
  with check (auth.uid() = user_id and approved = false and public.is_active_student());
create policy "reviews admin update" on public.reviews for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reviews admin delete" on public.reviews for delete to authenticated using (public.is_admin());

-- site_settings
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "settings admin update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ new-user trigger ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,'user@'),'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider','email')
  )
  on conflict (id) do nothing;

  if lower(coalesce(new.email,'')) = 'dsathsara405@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill existing accounts
insert into public.profiles (id, email, full_name, avatar_url, provider)
select u.id, coalesce(u.email,''),
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(coalesce(u.email,'user@'),'@',1)),
       u.raw_user_meta_data->>'avatar_url',
       coalesce(u.raw_app_meta_data->>'provider','email')
from auth.users u
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'dsathsara405@gmail.com'
on conflict (user_id, role) do nothing;

-- ============ seed services ============
insert into public.services (icon, name, description, price, turnaround, sort_order) values
('✍️','Assignment Writing','Structured, well-researched drafts tailored to your brief.',1500,'3–5 days',1),
('🧩','Assignment Formatting','Clean layout, headings, contents pages and styling.',800,'1–2 days',2),
('📊','Report Writing','Professional reports with clear analysis and structure.',3000,'4–6 days',3),
('🔎','Research Assistance','Source finding and literature summaries.',2000,'2–4 days',4),
('🖥️','Presentation Design','Polished PowerPoint slides for your talk.',1800,'2–3 days',5),
('💻','Programming Help','Guidance and solutions for coding assignments.',3500,'3–7 days',6),
('🗄️','Database Assignments','Schema design, SQL and documentation.',3000,'3–5 days',7),
('🌐','Web Development','Front-end and full-stack assignment support.',5000,'5–10 days',8),
('📝','Proofreading','Grammar, clarity and consistency checks.',700,'1 day',9),
('📚','Referencing & Citations','APA, Harvard, IEEE and more.',600,'1 day',10),
('🎓','Final Year Project Support','Documentation and project guidance.',0,'Custom',11);