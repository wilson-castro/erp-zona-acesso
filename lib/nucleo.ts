import 'server-only'
import { cookies, headers } from 'next/headers'
import { acessoHttp, criarNucleo, sessaoArquivo, sessaoRedis } from '@erp/nucleo'
import { clienteRedis } from './redis'

const ACESSO_URL = process.env.ACESSO_URL ?? 'http://127.0.0.1:4010'

/**
 * Zona de gestão de acesso. Fala com um domínio só: o de gestão de acesso, que é quem
 * decide. A zona só mostra e encaminha; a verificação de administrador é do domínio.
 */
export const nucleo = criarNucleo({
  app: 'acesso',
  // REDIS_URL definido: Redis (showcase, produção); senão, arquivo de desenvolvimento
  sessao: clienteRedis ? sessaoRedis({ cliente: clienteRedis }) : sessaoArquivo({ dir: process.env.SESSAO_DIR ?? '/tmp/erp-sessoes' }),
  lerCookieDeSessao: async () => (await cookies()).get('__Host-session')?.value,
  // núcleo 8: o proxy pôs um traceparent na requisição; cada chamada ao domínio leva um filho
  lerTraceparent: async () => (await headers()).get('traceparent') ?? undefined,
  acesso: acessoHttp({ destino: 'gestao-acesso' }),
  destinos: {
    'gestao-acesso': {
      origem: ACESSO_URL,
      caminhos: ['/v1/modulos-permitidos', '/v1/catalogo', '/v1/concessoes', '/v1/restricoes', '/v1/atribuicoes'],
      metodos: ['GET', 'POST'], credencial: 'usuario', timeoutMs: 1000,
    },
  },
})
