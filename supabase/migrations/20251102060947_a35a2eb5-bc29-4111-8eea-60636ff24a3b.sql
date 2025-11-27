-- Create assignment mode enum
CREATE TYPE assignment_mode AS ENUM ('automatic', 'manual');

-- Create driver status enum
CREATE TYPE driver_status AS ENUM ('available', 'busy', 'overworked', 'offline');

-- Create route status enum
CREATE TYPE route_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Create system settings table for assignment mode
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_mode assignment_mode DEFAULT 'automatic',
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO system_settings (assignment_mode) VALUES ('automatic');

-- Create route_assignments table
CREATE TABLE route_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid REFERENCES trucks(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_name text NOT NULL,
  bin_ids uuid[] NOT NULL,
  total_bins integer NOT NULL DEFAULT 0,
  estimated_distance_km numeric(10, 2),
  estimated_duration_minutes integer,
  status route_status DEFAULT 'pending',
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  assignment_type text CHECK (assignment_type IN ('automatic', 'manual')) DEFAULT 'automatic',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create driver_activity table for shift tracking
CREATE TABLE driver_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_assignment_id uuid REFERENCES route_assignments(id) ON DELETE SET NULL,
  shift_date date DEFAULT CURRENT_DATE,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  distance_km numeric(10, 2) DEFAULT 0,
  bins_collected integer DEFAULT 0,
  hours_worked numeric(5, 2) DEFAULT 0,
  fatigue_score numeric(5, 2) DEFAULT 0 CHECK (fatigue_score >= 0 AND fatigue_score <= 100),
  status driver_status DEFAULT 'available',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create driver_workload_summary view for quick checks
CREATE OR REPLACE VIEW driver_workload_today AS
SELECT 
  da.driver_id,
  da.shift_date,
  COUNT(DISTINCT da.route_assignment_id) as routes_today,
  COALESCE(SUM(da.hours_worked), 0) as hours_worked_today,
  COALESCE(SUM(da.distance_km), 0) as distance_covered_today,
  COALESCE(SUM(da.bins_collected), 0) as bins_collected_today,
  COALESCE(AVG(da.fatigue_score), 0) as avg_fatigue_score,
  CASE 
    WHEN COALESCE(SUM(da.hours_worked), 0) >= 8 THEN 'overworked'
    WHEN COUNT(DISTINCT da.route_assignment_id) >= 2 THEN 'overworked'
    WHEN COALESCE(SUM(da.distance_km), 0) >= 35 THEN 'overworked'
    WHEN COALESCE(SUM(da.bins_collected), 0) >= 25 THEN 'overworked'
    WHEN COALESCE(AVG(da.fatigue_score), 0) >= 70 THEN 'overworked'
    WHEN COUNT(DISTINCT da.route_assignment_id) > 0 THEN 'busy'
    ELSE 'available'
  END as current_status
FROM driver_activity da
WHERE da.shift_date = CURRENT_DATE
GROUP BY da.driver_id, da.shift_date;

-- Create notifications table for alerts
CREATE TABLE driver_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create function to calculate fatigue score
CREATE OR REPLACE FUNCTION calculate_fatigue_score(
  hours_worked numeric,
  routes_completed integer,
  distance_km numeric,
  bins_collected integer
)
RETURNS numeric AS $$
BEGIN
  RETURN LEAST(100, (
    (hours_worked / 8.0 * 25) +
    (routes_completed / 2.0 * 25) +
    (distance_km / 35.0 * 25) +
    (bins_collected / 25.0 * 25)
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to check if driver can accept new route
CREATE OR REPLACE FUNCTION can_driver_accept_route(driver_uuid uuid)
RETURNS boolean AS $$
DECLARE
  workload_check RECORD;
BEGIN
  SELECT * INTO workload_check
  FROM driver_workload_today
  WHERE driver_id = driver_uuid;
  
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  RETURN (
    workload_check.hours_worked_today < 8 AND
    workload_check.routes_today < 2 AND
    workload_check.distance_covered_today < 35 AND
    workload_check.bins_collected_today < 25 AND
    workload_check.avg_fatigue_score < 70
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on new tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage system settings"
ON system_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view system settings"
ON system_settings FOR SELECT
USING (true);

-- RLS Policies for route_assignments
CREATE POLICY "Admins can manage all route assignments"
ON route_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can view their assignments"
ON route_assignments FOR SELECT
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can update their assignment status"
ON route_assignments FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- RLS Policies for driver_activity
CREATE POLICY "Admins can manage all driver activity"
ON driver_activity FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can view their own activity"
ON driver_activity FOR SELECT
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can insert their own activity"
ON driver_activity FOR INSERT
WITH CHECK (driver_id = auth.uid());

-- RLS Policies for driver_notifications
CREATE POLICY "Users can view their own notifications"
ON driver_notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON driver_notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
ON driver_notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_route_assignments_updated_at
BEFORE UPDATE ON route_assignments
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_driver_activity_updated_at
BEFORE UPDATE ON driver_activity
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX idx_route_assignments_truck ON route_assignments(truck_id);
CREATE INDEX idx_route_assignments_status ON route_assignments(status);
CREATE INDEX idx_driver_activity_driver_date ON driver_activity(driver_id, shift_date);
CREATE INDEX idx_driver_notifications_user ON driver_notifications(user_id, is_read);