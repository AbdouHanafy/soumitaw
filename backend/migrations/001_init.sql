CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50),
    barcode VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'citizen',
    points INTEGER DEFAULT 0,
    reputation DECIMAL(3, 2) DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    merchant_id UUID REFERENCES merchants(id),
    price DECIMAL(10, 3) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TND',
    source VARCHAR(20),
    confidence DECIMAL(3, 2),
    status VARCHAR(20) DEFAULT 'approved',
    photo_url TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    city VARCHAR(100),
    region VARCHAR(100),
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    target_price DECIMAL(10, 3),
    condition VARCHAR(10),
    region VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

