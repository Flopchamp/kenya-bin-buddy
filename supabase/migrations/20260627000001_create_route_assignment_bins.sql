-- Replace the bin_ids uuid[] array column with a proper join table.
-- Array columns cannot carry FK constraints, make reverse-lookups expensive,
-- and break cascading deletes when a bin is removed.

-- 1. Create the join table
CREATE TABLE route_assignment_bins (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_assignment_id uuid NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
  bin_id              uuid NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  created_at          timestamp with time zone DEFAULT now(),
  UNIQUE(route_assignment_id, bin_id)
);

-- 2. Back-fill from the existing array column
--    (unnest returns zero rows when bin_ids is NULL or empty — safe to run)
INSERT INTO route_assignment_bins (route_assignment_id, bin_id)
SELECT ra.id, unnest(ra.bin_ids)
FROM   route_assignments ra
WHERE  ra.bin_ids IS NOT NULL
  AND  array_length(ra.bin_ids, 1) > 0;

-- 3. Drop the old array column
ALTER TABLE route_assignments DROP COLUMN bin_ids;

-- 4. RLS
ALTER TABLE route_assignment_bins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage route assignment bins"
ON route_assignment_bins FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can view their route assignment bins"
ON route_assignment_bins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM route_assignments ra
    WHERE  ra.id = route_assignment_bins.route_assignment_id
      AND  (ra.driver_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- 5. Indexes
CREATE INDEX idx_route_assignment_bins_assignment ON route_assignment_bins(route_assignment_id);
CREATE INDEX idx_route_assignment_bins_bin        ON route_assignment_bins(bin_id);
