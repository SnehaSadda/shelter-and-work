
-- Seed demo NGO and Employer users in auth.users so RLS-protected inserts have valid owners.
-- Using fixed UUIDs so re-runs are idempotent.
DO $$
DECLARE
  ngo_id uuid := '11111111-1111-1111-1111-111111111111';
  emp_id uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Insert into auth.users only if missing (minimal columns; passwords are placeholder hashes — these are display-only seed accounts).
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = ngo_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (ngo_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-ngo@haven.app', crypt('SeedDemo!2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Hope Foundation","org_name":"Hope Foundation","role":"ngo"}'::jsonb, false, '', '', '', '');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = emp_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (emp_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-employer@haven.app', crypt('SeedDemo!2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"CityWorks Co.","org_name":"CityWorks Co.","role":"employer"}'::jsonb, false, '', '', '', '');
  END IF;

  -- Profiles (insert if missing — handle_new_user trigger may have already created them)
  INSERT INTO public.profiles (id, name, org_name)
  VALUES (ngo_id, 'Hope Foundation', 'Hope Foundation')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, name, org_name)
  VALUES (emp_id, 'CityWorks Co.', 'CityWorks Co.')
  ON CONFLICT (id) DO NOTHING;

  -- Roles
  INSERT INTO public.user_roles (user_id, role) VALUES (ngo_id, 'ngo')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (emp_id, 'employer')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Resources (8 entries) — owned by demo NGO
INSERT INTO public.resources (owner_id, type, name, address, hours, capacity, status, description, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'shelter', 'Sunrise Night Shelter', '142 Elm Street, Downtown', '7pm – 7am', '60 beds', 'available', 'Safe overnight stay with hot showers and a warm bed. Walk-ins welcome.', 12.9716, 77.5946),
('11111111-1111-1111-1111-111111111111', 'shelter', 'Harmony Family Refuge', '88 Park Lane, West End', '24 hours', '20 family rooms', 'available', 'Family-friendly shelter for parents and children. Childcare on-site.', 12.9750, 77.6010),
('11111111-1111-1111-1111-111111111111', 'food', 'Community Soup Kitchen', '17 Market Road, Midtown', 'Lunch 12pm – 2pm, Dinner 6pm – 8pm', NULL, 'available', 'Free hot meals, no questions asked. Vegetarian options available.', 12.9680, 77.5900),
('11111111-1111-1111-1111-111111111111', 'food', 'Daily Bread Pantry', '305 River Walk', 'Mon–Sat 9am – 5pm', NULL, 'available', 'Grocery distribution: rice, lentils, vegetables, milk. Bring a bag.', 12.9810, 77.5880),
('11111111-1111-1111-1111-111111111111', 'medical', 'Free Health Clinic', '50 Hospital Avenue', 'Mon–Fri 9am – 6pm', NULL, 'available', 'Walk-in primary care, first aid, and basic medications. No ID needed.', 12.9700, 77.5970),
('11111111-1111-1111-1111-111111111111', 'medical', 'Mobile Medical Van', 'Rotates: Central Park (Tue), East Square (Thu)', '10am – 4pm', NULL, 'available', 'Free check-ups, vaccinations, and referrals. Schedule on our feed.', 12.9760, 77.5950),
('11111111-1111-1111-1111-111111111111', 'clothing', 'Warm Hands Donation Center', '23 Charity Lane', 'Tue, Thu, Sat — 10am – 4pm', NULL, 'available', 'Donated clothing, blankets, and shoes. Winter jackets in stock.', 12.9690, 77.5995),
('11111111-1111-1111-1111-111111111111', 'shelter', 'Safe Harbor Women''s Shelter', '210 Maple Drive', '24 hours', '40 beds', 'full', 'Women-only shelter. Currently full — call ahead for waitlist.', 12.9740, 77.5860);

-- Feed posts (6 entries) — authored by demo NGO
INSERT INTO public.feed_posts (author_id, title, body) VALUES
('11111111-1111-1111-1111-111111111111', 'Soup kitchen open tonight 7pm 🍲', 'Community Soup Kitchen on Market Road is serving hot dinner tonight from 7pm to 9pm. Plenty of space — bring a friend.'),
('11111111-1111-1111-1111-111111111111', 'Free flu vaccinations this Saturday', 'The Mobile Medical Van will be at Central Park this Saturday, 10am – 2pm, offering free flu shots. No appointment needed.'),
('11111111-1111-1111-1111-111111111111', 'Winter jackets just arrived', 'Warm Hands Donation Center received a fresh stock of winter jackets and blankets today. Open 10am – 4pm tomorrow.'),
('11111111-1111-1111-1111-111111111111', 'Sunrise Shelter has 12 beds open tonight', 'If you or someone you know needs a safe place to sleep, Sunrise Night Shelter has 12 beds available tonight. Doors open at 7pm.'),
('11111111-1111-1111-1111-111111111111', 'Job fair next Wednesday — daily wage opportunities', 'Local employers are hosting a hiring drive at the Community Hall next Wednesday from 9am – 1pm. Bring any ID if you have one (not required).'),
('11111111-1111-1111-1111-111111111111', 'Free legal aid clinic this Friday', 'Volunteer lawyers will be at our office this Friday from 11am – 3pm to help with ID recovery, housing rights, and benefits applications.');

-- Jobs (6 entries) — posted by demo Employer
INSERT INTO public.jobs (employer_id, title, org, location, type, pay, contact, description, active) VALUES
('22222222-2222-2222-2222-222222222222', 'Warehouse Loader (Daily)', 'CityWorks Co.', 'Industrial Park, Sector 7', 'daily', '₹700/day + lunch', '+91 98765 43210', 'Loading and unloading boxes. No experience needed. Show up by 8am, paid in cash same day.', true),
('22222222-2222-2222-2222-222222222222', 'Restaurant Dishwasher', 'Green Leaf Cafe', 'Brigade Road', 'short-term', '₹500/day', '+91 98123 45678', 'Evening shift 4pm – 11pm. One free meal included. Hiring for the next 2 weeks.', true),
('22222222-2222-2222-2222-222222222222', 'Construction Helper', 'BuildRight Contractors', 'MG Road site', 'daily', '₹800/day', '+91 99887 66554', 'Site cleaning and material handling. Safety boots provided. Daily pay.', true),
('22222222-2222-2222-2222-222222222222', 'Delivery Rider (own bike)', 'QuickShip Logistics', 'Citywide', 'short-term', '₹15/delivery + petrol', '+91 90000 11111', 'Pickup and drop within city. Must have own bike and basic phone. Flexible hours.', true),
('22222222-2222-2222-2222-222222222222', 'Event Setup Crew', 'EventPro Services', 'Convention Center', 'daily', '₹900/day', '+91 91234 56789', 'Set up chairs, tables, and decorations for weekend events. Strong lifting required.', true),
('22222222-2222-2222-2222-222222222222', 'Garden Maintenance', 'Greenview Apartments', 'Whitefield', 'short-term', '₹600/day', '+91 98765 11223', 'Watering plants, trimming hedges, and basic cleaning. Mornings only, 7am – 12pm.', true);
