import 'server-only'
import { createClient } from 'redis'
import type { ClienteRedisDeLeitura } from '@erp/nucleo'

/**
 * Cliente do store de sessão da ZONA (ADR-0002), só se `REDIS_URL` estiver definido
 * (docs/CONFIGURACAO.md); sem ele a app usa o store em arquivo de desenvolvimento.
 *
 * Só leitura, em duas camadas (invariante 15; auditor_b1_d1_2, V1): o cliente expõe só `get`, e
 * `REDIS_URL_ZONA` aponta para um usuário ACL que só tem `GET` nas chaves de sessão. Quem escreve
 * sessão é o shell. Conecta na primeira chamada; se a conexão falhar, a próxima tenta de novo:
 * Redis fora vira erro normalizado no núcleo, nunca "deslogado" silencioso nem processo derrubado.
 */
function clientePreguicoso(url: string): ClienteRedisDeLeitura {
  const criar = () => createClient({ url })
    .on('error', () => { /* a falha chega ao chamador pelo comando; o evento só não pode derrubar o processo */ })
  let conexao: Promise<ReturnType<typeof criar>> | undefined
  const conectado = () => (conexao ??= criar().connect().catch((e: unknown) => { conexao = undefined; throw e }))
  return { get: async (chave) => (await conectado()).get(chave) }
}

const url = process.env.REDIS_URL_ZONA ?? process.env.REDIS_URL
export const clienteRedis: ClienteRedisDeLeitura | null = url ? clientePreguicoso(url) : null
