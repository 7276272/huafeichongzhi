
-- Enable RLS on payment_addresses table
ALTER TABLE IF EXISTS public.payment_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_addresses
CREATE POLICY "public_read_payment_addresses"
ON public.payment_addresses
FOR SELECT USING (true);

CREATE POLICY "public_insert_payment_addresses"
ON public.payment_addresses
FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_payment_addresses"
ON public.payment_addresses
FOR UPDATE USING (true);

CREATE POLICY "public_delete_payment_addresses"
ON public.payment_addresses
FOR DELETE USING (true);
