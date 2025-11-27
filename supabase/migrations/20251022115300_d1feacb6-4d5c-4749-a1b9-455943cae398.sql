-- Create collection_history table for analytics
CREATE TABLE IF NOT EXISTS public.collection_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.collection_schedules(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES public.bins(id) ON DELETE CASCADE,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fill_level_before INTEGER,
  driver_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view collection history"
ON public.collection_history
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage collection history"
ON public.collection_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Drivers can insert their own collections"
ON public.collection_history
FOR INSERT
WITH CHECK (driver_id = auth.uid());

-- Create function to auto-create history when schedule is completed
CREATE OR REPLACE FUNCTION public.create_collection_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.collection_history (
      schedule_id,
      bin_id,
      truck_id,
      collected_at,
      fill_level_before,
      driver_id
    )
    SELECT
      NEW.id,
      NEW.bin_id,
      NEW.truck_id,
      NEW.collected_at,
      b.fill_level,
      t.driver_id
    FROM public.bins b, public.trucks t
    WHERE b.id = NEW.bin_id AND t.id = NEW.truck_id;
    
    -- Reset bin fill level
    UPDATE public.bins
    SET fill_level = 0, status = 'empty', last_collection = NEW.collected_at
    WHERE id = NEW.bin_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER on_schedule_completed
  AFTER UPDATE ON public.collection_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.create_collection_history();

-- Enable realtime for collection_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_history;