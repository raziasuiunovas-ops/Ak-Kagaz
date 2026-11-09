-- Скрипт для аккуратного объединения похожих товаров в варианты

-- 1. ПЕНАЛЫ: Объединяем в один товар с вариантами цветов
-- Оставляем синий как основной, добавляем красный и зеленый как варианты

-- Получаем ID основного товара (синий пенал)
DO $$
DECLARE
  blue_pencil_id UUID;
  red_pencil_id UUID;
  green_pencil_id UUID;
BEGIN
  -- Находим ID пеналов
  SELECT id INTO blue_pencil_id FROM products WHERE sku = 'AK-PENCIL-MVP-BLUE';
  SELECT id INTO red_pencil_id FROM products WHERE sku = 'AK-PENCIL-MVP-RED';
  SELECT id INTO green_pencil_id FROM products WHERE sku = 'AK-PENCIL-MVP-GREEN';
  
  -- Создаем варианты для синего пенала
  IF blue_pencil_id IS NOT NULL THEN
    -- Вариант: Синий
    INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, stock, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      blue_pencil_id,
      'Blue',
      'Синий',
      'Көк',
      'AK-PENCIL-MVP-BLUE',
      100,
      NOW(),
      NOW()
    ) ON CONFLICT (sku) DO NOTHING;
    
    -- Вариант: Красный (если есть красный товар)
    IF red_pencil_id IS NOT NULL THEN
      INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, stock, "createdAt", "updatedAt")
      SELECT 
        gen_random_uuid(),
        blue_pencil_id,
        'Red',
        'Красный',
        'Кызыл',
        'AK-PENCIL-MVP-RED',
        COALESCE((SELECT stock FROM products WHERE id = red_pencil_id), 100),
        NOW(),
        NOW()
      WHERE red_pencil_id IS NOT NULL
      ON CONFLICT (sku) DO NOTHING;
      
      -- Переносим фотографии красного пенала
      UPDATE product_photos SET product_id = blue_pencil_id WHERE product_id = red_pencil_id;
      
      -- Обновляем корзины с красным пеналом
      UPDATE cart_items SET product_id = blue_pencil_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-PENCIL-MVP-RED')
      WHERE product_id = red_pencil_id;
      
      -- Удаляем красный товар
      DELETE FROM products WHERE id = red_pencil_id;
    END IF;
    
    -- Вариант: Зеленый (если есть зеленый товар)
    IF green_pencil_id IS NOT NULL THEN
      INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, stock, "createdAt", "updatedAt")
      SELECT 
        gen_random_uuid(),
        blue_pencil_id,
        'Green',
        'Зеленый',
        'Жашыл',
        'AK-PENCIL-MVP-GREEN',
        COALESCE((SELECT stock FROM products WHERE id = green_pencil_id), 100),
        NOW(),
        NOW()
      WHERE green_pencil_id IS NOT NULL
      ON CONFLICT (sku) DO NOTHING;
      
      -- Переносим фотографии зеленого пенала
      UPDATE product_photos SET product_id = blue_pencil_id WHERE product_id = green_pencil_id;
      
      -- Обновляем корзины с зеленым пеналом
      UPDATE cart_items SET product_id = blue_pencil_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-PENCIL-MVP-GREEN')
      WHERE product_id = green_pencil_id;
      
      -- Удаляем зеленый товар
      DELETE FROM products WHERE id = green_pencil_id;
    END IF;
  END IF;
END $$;

-- 2. ГЛОБУСЫ: Объединяем в один товар с вариантами размеров
DO $$
DECLARE
  small_globe_id UUID;
  large_globe_id UUID;
  main_globe_id UUID;
BEGIN
  -- Находим ID глобусов
  SELECT id INTO small_globe_id FROM products WHERE sku = 'AK-GLOBE-SMALL' LIMIT 1;
  SELECT id INTO large_globe_id FROM products WHERE sku = 'AK-GLOBE-LARGE' LIMIT 1;
  
  -- Если нет с такими SKU, ищем по названию
  IF small_globe_id IS NULL THEN
    SELECT id INTO small_globe_id FROM products WHERE name ILIKE '%глобус%' AND price = 400 LIMIT 1;
  END IF;
  
  IF large_globe_id IS NULL THEN
    SELECT id INTO large_globe_id FROM products WHERE name ILIKE '%глобус%' AND price = 700 LIMIT 1;
  END IF;
  
  -- Используем первый найденный как основной
  main_globe_id := COALESCE(small_globe_id, large_globe_id);
  
  IF main_globe_id IS NOT NULL THEN
    -- Обновляем основной товар
    UPDATE products SET 
      name = 'Globe',
      "nameRu" = 'Глобус',
      "nameKy" = 'Глобус',
      sku = 'AK-GLOBE',
      price = 400,
      "updatedAt" = NOW()
    WHERE id = main_globe_id;
    
    -- Вариант: Маленький (400 сом)
    INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, price, stock, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      main_globe_id,
      'Small',
      'Маленький',
      'Кичине',
      'AK-GLOBE-SMALL',
      400,
      100,
      NOW(),
      NOW()
    ) ON CONFLICT (sku) DO NOTHING;
    
    -- Вариант: Большой (700 сом)
    INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, price, stock, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      main_globe_id,
      'Large',
      'Большой',
      'Чоң',
      'AK-GLOBE-LARGE',
      700,
      100,
      NOW(),
      NOW()
    ) ON CONFLICT (sku) DO NOTHING;
    
    -- Если есть второй глобус, переносим его данные
    IF large_globe_id IS NOT NULL AND large_globe_id != main_globe_id THEN
      -- Переносим фотографии
      UPDATE product_photos SET product_id = main_globe_id WHERE product_id = large_globe_id;
      
      -- Обновляем корзины
      UPDATE cart_items SET product_id = main_globe_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-GLOBE-LARGE')
      WHERE product_id = large_globe_id;
      
      -- Удаляем второй товар
      DELETE FROM products WHERE id = large_globe_id;
    END IF;
    
    IF small_globe_id IS NOT NULL AND small_globe_id != main_globe_id THEN
      -- Переносим фотографии
      UPDATE product_photos SET product_id = main_globe_id WHERE product_id = small_globe_id;
      
      -- Обновляем корзины
      UPDATE cart_items SET product_id = main_globe_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-GLOBE-SMALL')
      WHERE product_id = small_globe_id;
      
      -- Удаляем второй товар
      DELETE FROM products WHERE id = small_globe_id;
    END IF;
  END IF;
END $$;

-- 3. ЗНАЧКИ: Объединяем в один товар с вариантами
DO $$
DECLARE
  kinder_badge_id UUID;
  first_badge_id UUID;
  main_badge_id UUID;
BEGIN
  -- Находим ID значков
  SELECT id INTO kinder_badge_id FROM products WHERE sku = 'AK-BADGE-KINDER' LIMIT 1;
  SELECT id INTO first_badge_id FROM products WHERE sku = 'AK-BADGE-FIRST' LIMIT 1;
  
  -- Если нет с такими SKU, ищем по названию
  IF kinder_badge_id IS NULL THEN
    SELECT id INTO kinder_badge_id FROM products WHERE name ILIKE '%детс%' OR name ILIKE '%садик%' OR "nameRu" ILIKE '%детс%' LIMIT 1;
  END IF;
  
  IF first_badge_id IS NULL THEN
    SELECT id INTO first_badge_id FROM products WHERE (name ILIKE '%1%класс%' OR "nameRu" ILIKE '%1%класс%') AND id != kinder_badge_id LIMIT 1;
  END IF;
  
  -- Используем первый найденный как основной
  main_badge_id := COALESCE(kinder_badge_id, first_badge_id);
  
  IF main_badge_id IS NOT NULL THEN
    -- Обновляем основной товар
    UPDATE products SET 
      name = 'School Badge',
      "nameRu" = 'Школьный значок',
      "nameKy" = 'Мектеп значоги',
      sku = 'AK-BADGE',
      "updatedAt" = NOW()
    WHERE id = main_badge_id;
    
    -- Вариант: Детский сад
    INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, stock, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      main_badge_id,
      'Kindergarten',
      'Детский сад',
      'Балдар бакчасы',
      'AK-BADGE-KINDER',
      100,
      NOW(),
      NOW()
    ) ON CONFLICT (sku) DO NOTHING;
    
    -- Вариант: 1 класс
    INSERT INTO product_variants (id, product_id, name, "nameRu", "nameKy", sku, stock, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      main_badge_id,
      '1st Grade',
      '1 класс',
      '1 класс',
      'AK-BADGE-FIRST',
      100,
      NOW(),
      NOW()
    ) ON CONFLICT (sku) DO NOTHING;
    
    -- Если есть второй значок, переносим его данные
    IF first_badge_id IS NOT NULL AND first_badge_id != main_badge_id THEN
      -- Переносим фотографии
      UPDATE product_photos SET product_id = main_badge_id WHERE product_id = first_badge_id;
      
      -- Обновляем корзины
      UPDATE cart_items SET product_id = main_badge_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-BADGE-FIRST')
      WHERE product_id = first_badge_id;
      
      -- Удаляем второй товар
      DELETE FROM products WHERE id = first_badge_id;
    END IF;
    
    IF kinder_badge_id IS NOT NULL AND kinder_badge_id != main_badge_id THEN
      -- Переносим фотографии
      UPDATE product_photos SET product_id = main_badge_id WHERE product_id = kinder_badge_id;
      
      -- Обновляем корзины
      UPDATE cart_items SET product_id = main_badge_id, variant_id = (SELECT id FROM product_variants WHERE sku = 'AK-BADGE-KINDER')
      WHERE product_id = kinder_badge_id;
      
      -- Удаляем второй товар
      DELETE FROM products WHERE id = kinder_badge_id;
    END IF;
  END IF;
END $$;

-- Итоговый отчет
SELECT 'Migration completed!' AS status;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_variants FROM product_variants;
