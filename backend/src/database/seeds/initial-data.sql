-- Création de la base de données
CREATE DATABASE IF NOT EXISTS dental_ecommerce;
USE dental_ecommerce;

-- Insertion des rôles par défaut
INSERT INTO roles (name, description, createdAt, updatedAt) VALUES 
('admin', 'Administrateur avec tous les privilèges', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('client', 'Client standard avec accès limité', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insertion d'un utilisateur administrateur par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT INTO users (email, password, firstName, lastName, roleId, isActive, notificationsEnabled, createdAt, updatedAt) 
SELECT 
  'admin-dentalecommerce@yopmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hOvJe7Ej6',
  'Admin',
  'System',
  r.id,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM roles r 
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE firstName = VALUES(firstName);

-- Insertion de catégories par défaut
INSERT INTO categories (name, description, isActive, createdAt, updatedAt) VALUES 
('Instruments dentaires', 'Instruments et outils pour les soins dentaires', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Matériaux de restauration', 'Matériaux pour les obturations et restaurations', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Équipements de protection', 'Équipements de protection individuelle', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Produits d\'hygiène', 'Produits pour l\'hygiène bucco-dentaire', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Matériel d\'orthodontie', 'Matériel spécialisé pour l\'orthodontie', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insertion de produits d'exemple
INSERT INTO products (name, description, price, stockQuantity, sku, isActive, isFeatured, viewCount, salesCount, brand, createdAt, updatedAt) VALUES 
('Miroir dentaire', 'Miroir dentaire de haute qualité avec manche ergonomique', 15.99, 100, 'MIRROR-001', true, true, 0, 0, 'DentalPro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sonde dentaire', 'Sonde dentaire pour l\'examen et le diagnostic', 12.50, 150, 'PROBE-001', true, false, 0, 0, 'DentalPro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Amalgame dentaire', 'Amalgame pour obturations dentaires', 45.00, 50, 'AMALGAM-001', true, true, 0, 0, 'DentalRestore', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gants latex', 'Boîte de 100 gants en latex pour protection', 8.99, 200, 'GLOVES-LAT-001', true, false, 0, 0, 'SafeGloves', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Brosse à dents électrique', 'Brosse à dents électrique rechargeable', 89.99, 25, 'BRUSH-ELEC-001', true, true, 0, 0, 'OralCare', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Association des produits aux catégories
INSERT INTO product_categories (productId, categoryId)
SELECT p.id, c.id
FROM products p, categories c
WHERE (p.sku = 'MIRROR-001' AND c.name = 'Instruments dentaires')
   OR (p.sku = 'PROBE-001' AND c.name = 'Instruments dentaires')
   OR (p.sku = 'AMALGAM-001' AND c.name = 'Matériaux de restauration')
   OR (p.sku = 'GLOVES-LAT-001' AND c.name = 'Équipements de protection')
   OR (p.sku = 'BRUSH-ELEC-001' AND c.name = 'Produits d\'hygiène')
ON DUPLICATE KEY UPDATE productId = VALUES(productId);

