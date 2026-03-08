-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  service_id uuid,
  staff_id uuid,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'no_show'::text, 'completed'::text])),
  source text NOT NULL DEFAULT 'web'::text,
  created_at timestamp with time zone DEFAULT now(),
  price_at_booking numeric,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  total_spend numeric DEFAULT 0,
  visit_count integer DEFAULT 0,
  last_visit_at timestamp with time zone,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid,
  type text NOT NULL DEFAULT 'email'::text,
  scheduled_for timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_pkey PRIMARY KEY (id),
  CONSTRAINT reminders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_min integer NOT NULL,
  price_min integer,
  price_max integer,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  description text,
  image_url text,
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  phone text,
  address text,
  timezone text NOT NULL DEFAULT 'Europe/Istanbul'::text,
  opening_hours jsonb NOT NULL,
  booking_rules jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  title text,
  image_url text,
  availability jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT staff_pkey PRIMARY KEY (id)
);