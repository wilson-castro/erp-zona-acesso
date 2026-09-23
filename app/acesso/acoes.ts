'use server'

import { nucleo } from '@/lib/nucleo'
import { acaoProtegida } from '@/lib/pagina'

const texto = (f: FormData, k: string) => String(f.get(k) ?? '')

/**
 * Só quem tem papel administrativo chega a enviar; o domínio decide se esta pessoa pode fazer isto
 * com aquela outra (escopo, segregação de funções, ninguém se atribui) e responde 404/403 se não.
 * São POST que registram uma decisão, sem versão a comparar (invariante 6, ADR-0009 decisão 13).
 *
 * A chamada ao domínio fica no corpo do `acaoProtegida`, nunca numa closure montada fora dele
 * (invariante 5; auditor_b1_d1_3, V5): a verificação estática da base confere isso.
 */
const PAPEL = { administra: true } as const
const feito = (texto: string) => ({ toast: { tipo: 'sucesso' as const, texto }, destino: '/acesso' })

export async function concederAcesso(f: FormData) {
  return acaoProtegida(PAPEL, '/acesso', async () => {
    await nucleo.destino('gestao-acesso').post('/v2/acessos', { corpo: { pessoa: texto(f, 'pessoa'), modulo: texto(f, 'modulo') } })
    return feito('Acesso concedido.')
  })
}

export async function revogarAcesso(f: FormData) {
  return acaoProtegida(PAPEL, '/acesso', async () => {
    await nucleo.destino('gestao-acesso').post('/v2/acessos/:id/revogacao', { params: { id: texto(f, 'acesso') } })
    return feito('Acesso revogado.')
  })
}
