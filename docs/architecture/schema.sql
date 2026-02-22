CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE households (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Dublin',
  owner_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE household_members (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id)
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority SMALLINT NOT NULL DEFAULT 3,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  grace_hours INTEGER NOT NULL DEFAULT 12,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_schedules (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'custom')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  days_of_week SMALLINT[],
  day_of_month SMALLINT,
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  next_due_at TIMESTAMPTZ
);

CREATE TABLE task_occurrences (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'skipped', 'overdue')) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_logs (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  occurrence_id UUID REFERENCES task_occurrences(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('started', 'completed', 'skipped', 'reopened')),
  at_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER,
  note TEXT
);

CREATE TABLE task_assignments (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_from TIMESTAMPTZ NOT NULL,
  assigned_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE share_links (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('public_dashboard', 'room_view')),
  expires_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_household ON rooms(household_id);
CREATE INDEX idx_tasks_room ON tasks(room_id);
CREATE INDEX idx_occurrences_due ON task_occurrences(due_at);
CREATE INDEX idx_occurrences_task ON task_occurrences(task_id);
