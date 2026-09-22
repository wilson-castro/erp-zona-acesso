import 'server-only'
import { cookies, headers } from 'next/headers'
import { acessoHttp, criarNucleo, sessaoArquivo, sessaoRedis } from '@erp/nucleo'
import { clienteRedis } from './redis'

const ACESSO_URL = process.env.ACESSO_URL ?? 'http://127.0.0.1:4020'

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
      // gestão de acesso v2 (ADR-0014, adendo 1)
      caminhos: ['/v2/eu', '/v2/unidades', '/v2/pessoas', '/v2/modulos', '/v2/acessos', '/v2/acessos/:id/revogacao'],
      metodos: ['GET', 'POST'], credencial: 'usuario', timeoutMs: 1000,
    },
  },
})
