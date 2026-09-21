import { criarProxy } from '@erp/nucleo/proxy'

// Sem esta fábrica, cada zona reimplementaria cookie e CSP e divergiria (limitação 4).
export default criarProxy({ prefixo: '/acesso', rotaLogin: '/login' })

export const config = { matcher: ['/acesso', '/acesso/:caminho*'] }
