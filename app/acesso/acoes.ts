'use server'

import { nucleo } from '@/lib/nucleo'
import { acaoProtegida } from '@/lib/pagina'

const texto = (f: FormData, k: string) => String(f.get(k) ?? '')

/**
 * Só quem tem papel administrativo chega a enviar; o domínio decide se esta pessoa pode fazer isto
 * com aquela outra (escopo, segregação de funções, ninguém se atribui) e responde 404/403 se não.
 * São POST que registram uma decisão, sem versão a comparar (invariante 6, ADR-0009 decisão 13).
 */
const administrar = (enviar: () => Promise<unknown>, sucesso: string) =>
  acaoProtegida({ administra: true }, '/acesso', async () => {
    await enviar()
    return { toast: { tipo: 'sucesso', texto: sucesso }, destino: '/acesso' }
  })

export async function concederAcesso(f: FormData) {
  return administrar(() => nucleo.destino('gestao-acesso').post('/v2/acessos',
    { corpo: { pessoa: texto(f, 'pessoa'), modulo: texto(f, 'modulo') } }), 'Acesso concedido.')
}

export async function revogarAcesso(f: FormData) {
  return administrar(() => nucleo.destino('gestao-acesso').post('/v2/acessos/:id/revogacao',
    { params: { id: texto(f, 'acesso') } }), 'Acesso revogado.')
}
