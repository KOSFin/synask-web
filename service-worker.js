const CACHE_NAME = 'media-cache-v1';

// Событие установки: кэширование медиафайлов будет происходить динамически
self.addEventListener('install', event => {
  console.log('Service Worker установлен.');
  self.skipWaiting();
});

// Событие активации: очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
  console.log('Service Worker активирован.');
});

// Перехват запросов и работа с кэшем для медиафайлов
self.addEventListener('fetch', event => {
  // Проверяем, является ли запрашиваемый ресурс медиафайлом
  const url = new URL(event.request.url);

  // Кэшируем только запросы на медиафайлы (фото, видео, музыка)
  if (url.pathname.match(/\.(?:png|jpg|jpeg|gif|mp4|mp3|wav)$/)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Возвращаем контент из кэша
        }

        return fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone()); // Кэшируем новый контент
            return response;
          });
        });
      }).catch(error => {
        console.error('Ошибка при запросе медиафайла:', error);
      })
    );
  } else {
    // Не кэшировать другие запросы (например, страницы)
    return fetch(event.request);
  }
});

// Обработчик сообщения для динамического кэширования ресурса по запросу
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_URL') {
    caches.open(CACHE_NAME).then(cache => {
      cache.add(event.data.url).then(() => {
        console.log(`URL ${event.data.url} закэширован`);
      }).catch(err => {
        console.error(`Ошибка кэширования URL ${event.data.url}:`, err);
      });
    }).catch(error => {
      console.error('Ошибка при открытии кэша в обработчике message:', error);
    });
  }
});
