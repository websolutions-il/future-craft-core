
-- Allow drivers to update odometer on their assigned vehicle
CREATE POLICY "Drivers can update own vehicle odometer"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (assigned_driver_id = auth.uid())
WITH CHECK (assigned_driver_id = auth.uid());
