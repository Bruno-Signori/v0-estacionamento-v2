const CACHE_NAME = "parkgestor-v1.0.0"
const urlsToCache = [
  "/",
  "/registro-entrada",
  "/registro-saida",
  "/relatorios",
  "/configuracoes",
  "/cadastros/veiculos",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Instalando...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Service Worker: Cache aberto")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("✅ Service Worker: Instalado com sucesso")
        return self.skipWaiting()
      }),
  )
})

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Ativando...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("🗑️ Service Worker: Removendo cache antigo:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("✅ Service Worker: Ativado com sucesso")
        return self.clients.claim()
      }),
  )
})

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  // Estratégia: Network First para APIs, Cache First para assets
  if (event.request.url.includes("/api/")) {
    // Network First para APIs
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a resposta for válida, clone e cache
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Se falhar, tenta buscar no cache
          return caches.match(event.request)
        }),
    )
  } else {
    // Cache First para outros recursos
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retorna do cache se encontrar
        if (response) {
          return response
        }
        // Senão, busca na rede
        return fetch(event.request).then((response) => {
          // Não cache se não for uma resposta válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone a resposta
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      }),
    )
  }
})

// Sincronização em background
self.addEventListener("sync", (event) => {
  console.log("🔄 Service Worker: Sincronização em background")
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados offline
      console.log("📡 Sincronizando dados..."),
    )
  }
})

// Notificações push
self.addEventListener("push", (event) => {
  console.log("📱 Service Worker: Notificação push recebida")

  const options = {
    body: event.data ? event.data.text() : "Nova notificação do ParkGestor",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Abrir App",
        icon: "/icons/icon-96x96.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/icons/icon-96x96.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("ParkGestor", options))
})

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Service Worker: Notificação clicada")
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
