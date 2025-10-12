import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    // Try to serve the asset
    return await getAssetFromKV(event)
  } catch (e) {
    // If the asset is not found, serve index.html (SPA routing)
    try {
      let notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
      })
      
      return new Response(notFoundResponse.body, {
        ...notFoundResponse,
        status: 200
      })
    } catch (e) {
      return new Response(e.message || e.toString(), { status: 500 })
    }
  }
}
