-- Script pour ajouter les nouveaux champs aux produits et catégories
-- À exécuter manuellement dans votre base de données

-- Ajout des nouveaux champs à la table products
ALTER TABLE products 
ADD COLUMN short_description TEXT NULL,
ADD COLUMN compare_price DECIMAL(10,2) NULL,
ADD COLUMN brand VARCHAR(255) NULL,
ADD COLUMN specifications TEXT NULL,
ADD COLUMN sizes TEXT NULL,
ADD COLUMN colors TEXT NULL,
ADD COLUMN color VARCHAR(100) NULL,
ADD COLUMN size VARCHAR(50) NULL;

-- Ajout des nouveaux champs à la table categories
ALTER TABLE categories 
ADD COLUMN parent_id INT NULL,
ADD COLUMN sort_order INT DEFAULT 0,
ADD COLUMN slug VARCHAR(255) NULL;

-- Ajout de la contrainte de clé étrangère pour les sous-catégories
ALTER TABLE categories 
ADD CONSTRAINT fk_categories_parent 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Création d'un index pour améliorer les performances
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_color ON products(color);
CREATE INDEX idx_products_size ON products(size);

-- Mise à jour des colonnes existantes pour s'assurer qu'elles sont compatibles
-- (au cas où elles n'existent pas déjà)
-- Ces commandes peuvent être ignorées si les colonnes existent déjà

-- Vérification et mise à jour des colonnes si nécessaire
-- ALTER TABLE products MODIFY COLUMN price DECIMAL(10,2) NOT NULL;
-- ALTER TABLE products MODIFY COLUMN stock_quantity INT DEFAULT 0;
-- ALTER TABLE products MODIFY COLUMN is_active BOOLEAN DEFAULT TRUE;
-- ALTER TABLE products MODIFY COLUMN is_featured BOOLEAN DEFAULT FALSE;
-- ALTER TABLE products MODIFY COLUMN view_count INT DEFAULT 0;
-- ALTER TABLE products MODIFY COLUMN sales_count INT DEFAULT 0;

-- Commentaire : Ce script ajoute tous les nouveaux champs nécessaires pour :
-- 1. Les variantes de produits (tailles, couleurs)
-- 2. Les informations supplémentaires (marque, spécifications)
-- 3. Les sous-catégories
-- 4. Les index pour optimiser les performances 