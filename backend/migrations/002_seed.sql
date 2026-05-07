INSERT INTO products (id, name, category, unit, barcode)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Huile vegetale 1L', 'Corps gras', 'litre', '619000000001'),
    ('22222222-2222-2222-2222-222222222222', 'Lait demi-ecreme 1L', 'Produits laitiers', 'litre', '619000000002'),
    ('33333333-3333-3333-3333-333333333333', 'Semoule fine 1kg', 'Cereales', 'kg', '619000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO merchants (id, name, type, address, city, region, latitude, longitude, verified)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Magasin El Baraka', 'epicerie', '12 Rue de Marseille', 'Tunis', 'Tunis', 36.806500, 10.181500, TRUE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Superette Carthage', 'supermarche', '8 Avenue Habib Bourguiba', 'Tunis', 'Tunis', 36.853200, 10.323000, TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Souk Sfax Centre', 'epicerie', '3 Rue Hedi Chaker', 'Sfax', 'Sfax', 34.740600, 10.760300, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, phone, role, points, reputation)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'citizen@soumitaw.tn', '+21620000000', 'citizen', 20, 0.70)
ON CONFLICT (id) DO NOTHING;

INSERT INTO prices (id, product_id, merchant_id, price, currency, source, confidence, status, latitude, longitude, city, region)
VALUES
    ('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 8.900, 'TND', 'merchant', 0.98, 'approved', 36.806500, 10.181500, 'Tunis', 'Tunis'),
    ('90000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 8.450, 'TND', 'merchant', 0.95, 'approved', 36.853200, 10.323000, 'Tunis', 'Tunis'),
    ('90000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1.950, 'TND', 'merchant', 0.96, 'approved', 36.806500, 10.181500, 'Tunis', 'Tunis'),
    ('90000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2.150, 'TND', 'citizen', 0.84, 'approved', 34.740600, 10.760300, 'Sfax', 'Sfax'),
    ('90000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 8.700, 'TND', 'citizen', 0.81, 'approved', 34.740600, 10.760300, 'Sfax', 'Sfax'),
    ('90000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 9.100, 'TND', 'merchant', 0.99, 'approved', 36.806500, 10.181500, 'Tunis', 'Tunis')
ON CONFLICT (id) DO NOTHING;
