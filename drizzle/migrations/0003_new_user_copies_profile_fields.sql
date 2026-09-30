create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, university, student_id, avatar_url, provider)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,'user@'),'@',1)),
    nullif(new.raw_user_meta_data->>'phone',''),
    nullif(new.raw_user_meta_data->>'university',''),
    nullif(new.raw_user_meta_data->>'student_id',''),
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

revoke all on function public.handle_new_user() from public, anon, authenticated;

update public.profiles p
set phone      = coalesce(p.phone, nullif(u.raw_user_meta_data->>'phone','')),
    university = coalesce(p.university, nullif(u.raw_user_meta_data->>'university','')),
    student_id = coalesce(p.student_id, nullif(u.raw_user_meta_data->>'student_id',''))
from auth.users u
where u.id = p.id;