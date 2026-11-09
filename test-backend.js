// Простой тест - проверяем что backend запустился
const http = require('http');

function testBackend() {
  console.log('🔍 Проверяю backend на http://localhost:4000/api/health...\n');

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`✅ Backend работает! Статус: ${res.statusCode}`);
      console.log(`Ответ: ${data}\n`);
      
      // Теперь проверим /api/recommendations/popular
      testPopular();
    });
  });

  req.on('error', (error) => {
    console.log('❌ Backend не отвечает!');
    console.log(`Ошибка: ${error.message}\n`);
    console.log('Запусти backend командой:');
    console.log('  cd backend');
    console.log('  npm run dev');
  });

  req.on('timeout', () => {
    console.log('⏱️  Timeout - backend не отвечает');
    req.destroy();
  });

  req.end();
}

function testPopular() {
  console.log('🔍 Проверяю /api/recommendations/popular...\n');

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/recommendations/popular?limit=3',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const products = JSON.parse(data);
        console.log(`✅ Популярные товары загружаются! Найдено: ${products.length}`);
        console.log('\nПервые товары:');
        products.slice(0, 3).forEach((p, i) => {
          const name = p.translations?.find(t => t.locale === 'ru')?.name || 'Без названия';
          console.log(`  ${i + 1}. ${p.sku}: ${name}`);
        });
      } else {
        console.log(`❌ Ошибка: статус ${res.statusCode}`);
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Ошибка при загрузке товаров: ${error.message}`);
  });

  req.on('timeout', () => {
    console.log('⏱️  Timeout при загрузке товаров');
    req.destroy();
  });

  req.end();
}

// Запускаем тест
testBackend();
