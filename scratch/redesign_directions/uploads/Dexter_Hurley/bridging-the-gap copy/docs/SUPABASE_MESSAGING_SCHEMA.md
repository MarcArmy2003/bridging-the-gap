# Supabase Messaging Schema (Case Messages)

This document describes a simple schema and recommended RLS rules for the `case_messages` table used by the app.

SQL schema

```sql
create table case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  sender_id uuid not null,
  sender_role text not null check (sender_role in ('counselor','parent','teacher')),
  recipient_role text not null check (recipient_role in ('counselor','parent','teacher')),
  body text not null,
  created_at timestamptz not null default now()
);
```

Indexing

```sql
create index on case_messages (case_id, created_at desc);
```

RLS guidance

- Enable RLS on `case_messages` and create helper functions that check whether the current JWT `auth.uid` is allowed to view or insert messages for the given case.

- A simple visibility policy:
  - `counselor` role: can `select` all messages for the case.
  - `parent` (guardian) role: can `select` messages where `sender_role = 'parent' OR recipient_role = 'parent'` for cases belonging to that guardian.
  - `teacher` role: similar to `parent` but for `teacher` role.

Example policies (pseudo-SQL / Postgres functions)

```sql
-- function to check whether user is guardian of the case
create function is_guardian_of_case(uid uuid, case_uuid uuid) returns boolean language sql stable as $$
  select guardian_id = uid from cases where id = case_uuid
$$;

-- function to check whether user is teacher assigned to the case
create function is_teacher_of_case(uid uuid, case_uuid uuid) returns boolean language sql stable as $$
  select exists (
    select 1 from case_assignments where case_id = case_uuid and teacher_id = uid
  );
$$;

-- policy: select by counselors
create policy select_by_counselors on case_messages for select using (
  auth.role() = 'counselor' and exists (select 1 from case_assignments where case_id = case_messages.case_id and counselor_id = auth.uid())
);

-- policy: select for guardians
create policy select_by_guardians on case_messages for select using (
  is_guardian_of_case(auth.uid(), case_messages.case_id) and (
    sender_role = 'parent' or recipient_role = 'parent'
  )
);

-- policy: select for teachers
create policy select_by_teachers on case_messages for select using (
  is_teacher_of_case(auth.uid(), case_messages.case_id) and (
    sender_role = 'teacher' or recipient_role = 'teacher'
  )
);

-- policy: insert: allow when auth.uid is the sender
create policy insert_messages on case_messages for insert with check (
  sender_id = auth.uid()
);
```

Notes

- Adapt `auth.role()` usage to your JWT/claims shape. You may store a `role` claim in the JWT to simplify policies.
- Consider adding a `visible_to_all boolean` or `recipient_user_id` for one-off messages targeted at a specific user rather than a role.
- When migrating from `fakeApi`, keep `case_messages` IDs in a string-friendly format (UUIDs) and ensure client mapping is consistent.
