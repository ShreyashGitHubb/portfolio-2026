
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "roles readable by self"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Profile (singleton)
create table public.profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  tagline text not null default '',
  bio text not null default '',
  avatar_url text,
  email text,
  github text,
  linkedin text,
  twitter text,
  resume_url text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profile enable row level security;
create trigger profile_updated before update on public.profile for each row execute function public.set_updated_at();

create policy "profile public read" on public.profile for select using (true);
create policy "profile admin insert" on public.profile for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "profile admin update" on public.profile for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "profile admin delete" on public.profile for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.profile (name, role, tagline, bio) values ('Your Name', 'Developer & GDG Lead', 'Building for the web, organizing for the community.', 'Edit this bio in your admin dashboard.');

-- Skills
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'general',
  level int not null default 80,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.skills enable row level security;
create policy "skills public read" on public.skills for select using (true);
create policy "skills admin all" on public.skills for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  link text,
  repo text,
  image_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create policy "projects public read" on public.projects for select using (true);
create policy "projects admin all" on public.projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Experience
create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  start_date text not null,
  end_date text,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.experience enable row level security;
create policy "experience public read" on public.experience for select using (true);
create policy "experience admin all" on public.experience for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Events / talks
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_name text not null default '',
  event_date text not null default '',
  location text,
  description text not null default '',
  link text,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "events public read" on public.events for select using (true);
create policy "events admin all" on public.events for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Blog
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create trigger blog_updated before update on public.blog_posts for each row execute function public.set_updated_at();
create policy "blog public read published" on public.blog_posts for select using (published = true or public.has_role(auth.uid(),'admin'));
create policy "blog admin all" on public.blog_posts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Contact messages (public can insert)
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (
  length(name) between 1 and 100 and length(email) between 3 and 255 and length(message) between 1 and 2000
);
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update messages" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));
