import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      // Try to serve the asset
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        }
      )
    } catch (e) {
      // If the asset is not found, serve index.html for SPA routing
      try {
        const notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${new URL(request.url).origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
          }
        )
        
        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 200,
          headers: notFoundResponse.headers
        })
      } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
      }
    }
  }
}
