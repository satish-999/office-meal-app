CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY,
  employee_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  default_diet VARCHAR(16) NOT NULL,
  role VARCHAR(16) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS meal_schedules (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(16) NOT NULL,
  menu_veg_items JSONB NOT NULL DEFAULT '[]',
  menu_non_veg_items JSONB NOT NULL DEFAULT '[]',
  menu_veg TEXT,
  menu_non_veg TEXT,
  cutoff_at TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (date, meal_type)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  schedule_id UUID NOT NULL REFERENCES meal_schedules(id),
  date DATE NOT NULL,
  meal_type VARCHAR(16) NOT NULL,
  diet_type VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  booked_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_employee_date ON bookings(employee_id, date);

CREATE TABLE IF NOT EXISTS serve_events (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  meal_type VARCHAR(16) NOT NULL,
  diet_type VARCHAR(16) NOT NULL,
  served_at TIMESTAMPTZ NOT NULL,
  served_by UUID NOT NULL,
  counter_id VARCHAR(64),
  manual BOOLEAN NOT NULL DEFAULT FALSE,
  manual_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_serve_events_date ON serve_events(date);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  meal_type VARCHAR(16) NOT NULL,
  diet_type VARCHAR(16) NOT NULL,
  rating INT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  comment TEXT,
  facility_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(date);

CREATE TABLE IF NOT EXISTS escalations (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  level INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_escalations_employee ON escalations(employee_id);
