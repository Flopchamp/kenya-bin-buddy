-- Cast assignment_type column from TEXT to the assignment_mode enum.
-- The assignment_mode enum already exists: ('automatic', 'manual')

ALTER TABLE route_assignments
  DROP CONSTRAINT IF EXISTS route_assignments_assignment_type_check;

ALTER TABLE route_assignments
  ALTER COLUMN assignment_type TYPE assignment_mode
  USING assignment_type::assignment_mode;
