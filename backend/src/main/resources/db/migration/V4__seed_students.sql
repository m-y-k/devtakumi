-- Seed student accounts: shezan & arham
-- Password for both accounts: Password@123
-- Hash generated with BCryptPasswordEncoder(10)
INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES
('u0000001-0001-4000-8000-000000000001', 'Shezan', 'shezan@devtakumi.dev', NULL,
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9i',
 'STUDENT', NOW()),
('u0000001-0002-4000-8000-000000000001', 'Arham',  'arham@devtakumi.dev',  NULL,
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh9i',
 'STUDENT', NOW());

-- Enroll both students in DSA Foundations (course id: a0000001-0001-4000-8000-000000000001)
INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at) VALUES
('v0000001-0001-4000-8000-000000000001', 'u0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'ACTIVE', NOW()),
('v0000001-0002-4000-8000-000000000001', 'u0000001-0002-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'ACTIVE', NOW());
