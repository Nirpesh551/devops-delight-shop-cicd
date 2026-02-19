
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  address TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can create order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Insert sample DevOps products
INSERT INTO public.products (name, short_description, description, price, image_url, category) VALUES
('Kubernetes T-Shirt', 'Rep the container orchestrator', 'Premium cotton tee featuring the iconic Kubernetes helm wheel logo. Perfect for cluster admins and cloud-native enthusiasts. Available in all sizes.', 29.99, null, 'apparel'),
('Docker Mug', 'Morning coffee, containerized', 'Ceramic 11oz mug with the Docker whale logo. Dishwasher safe. Start every morning with a properly containerized brew.', 14.99, null, 'accessories'),
('Terraform Hoodie', 'Infrastructure as warmth', 'Cozy zip-up hoodie with the Terraform logo. Stay warm while you provision your infrastructure. 80% cotton, 20% polyester.', 49.99, null, 'apparel'),
('CI/CD Sticker Pack', '12 premium vinyl stickers', 'Collection of 12 die-cut vinyl stickers featuring popular CI/CD tools: Jenkins, GitHub Actions, GitLab CI, CircleCI, and more. Waterproof and laptop-safe.', 9.99, null, 'accessories'),
('Prometheus Poster', 'Monitor your walls', 'High-quality 18x24 poster featuring Prometheus fire-bearer artwork with monitoring metrics aesthetic. Printed on premium matte paper.', 19.99, null, 'prints'),
('Ansible Notebook', 'Automate your notes', 'Hardcover A5 notebook with Ansible branding. 200 dot-grid pages perfect for architecture diagrams and runbook notes.', 16.99, null, 'accessories'),
('Linux Penguin Plush', 'Tux for your desk', 'Adorable 8-inch Tux plush toy. The perfect desk companion for any Linux enthusiast. Soft polyester fill.', 24.99, null, 'collectibles'),
('Git Commit Enamel Pin', 'Wear your commits', 'Gold-plated enamel pin shaped like a git branch graph. Includes butterfly clutch backing. A subtle flex for version control pros.', 12.99, null, 'accessories');
