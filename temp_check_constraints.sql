SELECT conname FROM pg_constraint WHERE conrelid = 'cart_items'::regclass AND contype = 'u';
