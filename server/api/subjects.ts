export default defineEventHandler(async (event) => {
  assertMethod(event, ['GET', 'POST'])

  const { apiBase } = useRuntimeConfig(event)
  if (!apiBase) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_API_BASE belum diatur' })
  }

  const headers = { ...getRequestHeaders(event) }

  delete headers.cookie
  delete headers.authorization

  const queryString = getRequestURL(event).search

  const targetUrl = `${apiBase.replace(/\/$/, '')}/subjects${queryString}`

  return proxyRequest(
    event,
    targetUrl,
    { headers }
  )
})