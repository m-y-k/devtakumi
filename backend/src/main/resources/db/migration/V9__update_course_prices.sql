-- Update course prices to final specifications: DSA-999, Backend-1499, FS-1999
UPDATE courses SET price_inr = 999 WHERE slug = 'dsa-foundations';
UPDATE courses SET price_inr = 1499 WHERE slug = 'backend-engineering';
UPDATE courses SET price_inr = 1999 WHERE slug = 'full-stack-development';
