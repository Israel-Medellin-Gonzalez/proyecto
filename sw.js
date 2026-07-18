/**
 * SERVICE WORKER - Aventura de Aprendizaje
 * 
 * Controla el caching y funcionalidad offline
 * de la app educativa preescolar
 */

const CACHE_NAME = 'aventura-v1';
const urlsToCache = [
  // Archivos raíz
  '/',
  '/index.html',

  // Estilos CSS
  '/css/global.css',
  '/css/variables.css',
  '/css/inicio.css',
  '/css/animales.css',
  '/css/clasifica.css',
  '/css/reloj.css',
  '/css/memoria.css',
  '/css/secuencias.css',
  '/css/vocales.css',
  '/css/inicial.css',
  '/css/manzanas.css',
  '/css/tienda.css',

  // JavaScript - Módulos
  '/modulos/app.js',
  '/modulos/inicio.js',
  '/modulos/inicial.js',
  '/modulos/vocales.js',
  '/modulos/reloj.js',
  '/modulos/manzanas.js',
  '/modulos/tienda.js',
  '/modulos/animales.js',
  '/modulos/clasifica.js',
  '/modulos/memoria.js',
  '/modulos/secuencias.js',

  // Manifest
  '/manifest.json',

  // Ícono
  '/icon-192.png'
];

/**
 * EVENTO: INSTALL
 * Se ejecuta la primera vez que se registra el Service Worker
 * Descarga todos los archivos al cache local
 */
self.addEventListener('install', event => {
  console.log('🔧 [SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 [SW] Cacheando archivos...');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('✅ [SW] Todos los archivos cacheados correctamente');
          })
          .catch(error => {
            console.error('❌ [SW] Error cacheando archivos:', error);
          });
      })
  );
});

/**
 * EVENTO: ACTIVATE
 * Se ejecuta cuando el Service Worker se activa
 * Limpia caches viejos
 */
self.addEventListener('activate', event => {
  console.log('✨ [SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eliminar caches que no sean la versión actual
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️  [SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker activado correctamente');
        // Tomar control de todas las páginas
        return self.clients.claim();
      })
  );
});

/**
 * EVENTO: FETCH
 * Se ejecuta cada vez que la página solicita un archivo
 * Estrategia: CACHE FIRST
 * 1. Busca en cache
 * 2. Si no está, descarga de internet
 * 3. Guarda en cache para próxima vez
 */
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en cache, devolverlo
        if (response) {
          console.log('📦 [SW] Del cache:', event.request.url);
          return response;
        }

        // Si no está en cache, traer de internet
        return fetch(event.request)
          .then(response => {
            // Verificar que sea una respuesta válida
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clonar la respuesta porque solo se puede usar una vez
            const responseToCache = response.clone();

            // Guardar en cache para próxima vez
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            console.log('🌐 [SW] De internet:', event.request.url);
            return response;
          })
          .catch(error => {
            console.error('❌ [SW] Error fetching:', error);
            
            // Si falla y es una solicitud de página, devolver offline page si existe
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

/**
 * EVENTO: MESSAGE (opcional)
 * Permite comunicación entre la app y el Service Worker
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker cargado correctamente');
