export default defineEventHandler((event) => {
  assertMethod(event, ['PUT', 'DELETE'])

  const { apiBase } = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID subject tidak valid' })
  }
  if (!apiBase) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_API_BASE belum diatur' })
  }

  const header = getRequestHeaders(event)

  delete header['cookie']
  delete header['authorization']

  return proxyRequest(
    event,
    `${apiBase.replace(/\/$/, '')}/subjects/${id}`,
    { headers: header },
  )
})