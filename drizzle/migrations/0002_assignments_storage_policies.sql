create policy "assignments own read" on storage.objects for select to authenticated
  using (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assignments admin read" on storage.objects for select to authenticated
  using (bucket_id = 'assignments' and public.is_admin());
create policy "assignments own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assignments admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'assignments' and public.is_admin());
create policy "assignments admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'assignments' and public.is_admin());