-- Zomato Clone Database Schema and Seed Data

-- 1. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    cuisines TEXT[] NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.0,
    delivery_time INTEGER NOT NULL, -- in minutes
    cost_for_two NUMERIC NOT NULL,
    discount_text TEXT,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISHES TABLE
CREATE TABLE IF NOT EXISTS dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Veg', 'Non-Veg')),
    course TEXT NOT NULL CHECK (course IN ('Recommended', 'Starters', 'Main Course', 'Desserts', 'Beverages')),
    is_available BOOLEAN DEFAULT TRUE,
    customization_options JSONB DEFAULT '[]'::jsonb, -- Options for size, addons, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    items JSONB NOT NULL, -- Array of items with selected customizations: [{dish_id, name, price, quantity, customizations: []}]
    subtotal NUMERIC NOT NULL,
    discount_applied NUMERIC DEFAULT 0,
    delivery_charge NUMERIC DEFAULT 40,
    total_amount NUMERIC NOT NULL,
    delivery_pincode TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'UPI', 'CARD')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    order_status TEXT NOT NULL DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    max_discount NUMERIC NOT NULL,
    min_order_value NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) OR SEED DATA DIRECTLY
-- For public read/write ease in development:
-- ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- SEED DATA FOR OFFERS
INSERT INTO offers (code, description, discount_percentage, max_discount, min_order_value, is_active) VALUES
('ZOMATO50', '50% OFF up to ₹100 on all orders above ₹150', 50, 100, 150, TRUE),
('INDIA100', 'Flat 30% OFF up to ₹150 on your favorite meals', 30, 150, 200, TRUE),
('WELCOME200', 'Flat ₹200 OFF on orders above ₹500', 40, 200, 500, TRUE),
('FREEDEL', '100% Delivery discount up to ₹40 on orders above ₹199', 100, 40, 199, TRUE)
ON CONFLICT (code) DO UPDATE SET 
    description = EXCLUDED.description,
    discount_percentage = EXCLUDED.discount_percentage,
    max_discount = EXCLUDED.max_discount,
    min_order_value = EXCLUDED.min_order_value,
    is_active = EXCLUDED.is_active;

-- SEED DATA FOR RESTAURANTS AND DISHES WILL BE POPULATED VIA THE NODEJS SERVER OR DIRECTLY IN EXPRESS SETUP.
