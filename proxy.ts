import { criarProxy } from '@erp/nucleo/proxy'

export default criarProxy({ prefixo: '/acesso', rotaLogin: '/login', publicos: ['/acesso/api/health'] })

export const config = { matcher: ['/acesso', '/acesso/:caminho*'] }
