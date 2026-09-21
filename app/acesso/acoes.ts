'use server'

import { redirect } from 'next/navigation'
import { ErroDeAplicacao } from '@erp/nucleo'
import { MENSAGENS } from '@erp/contratos'
import { nucleo } from '@/lib/nucleo'
import { exigirNaAcao, flash } from '@/lib/pagina'

type Rota = '/v1/concessoes' | '/v1/restricoes' | '/v1/atribuicoes'

/** Envia ao domínio e volta para a tela com o resultado num toast. */
async function enviar(rota: Rota, corpo: Record<string, unknown>, sucesso: string): Promise<never> {
  await exigirNaAcao('acesso.admin')   // invariante 5: primeiro bloco
  try {
    await nucleo.destino('gestao-acesso').post(rota, { corpo })
    await flash({ tipo: 'sucesso', texto: sucesso })
  } catch (e) {
    await flash({ tipo: 'erro', texto: MENSAGENS[e instanceof ErroDeAplicacao ? e.codigo : 'ERRO_INTERNO'] })
  }
  redirect('/acesso')
}

const texto = (f: FormData, k: string) => String(f.get(k) ?? '')

export async function alterarConcessao(f: FormData) {
  await enviar('/v1/concessoes',
    { perfil: texto(f, 'perfil'), modulo: texto(f, 'modulo'), conceder: texto(f, 'conceder') === 'true' },
    'Concessão atualizada.')
}

export async function alterarRestricao(f: FormData) {
  await enviar('/v1/restricoes',
    { modulo: texto(f, 'modulo'), restrito: texto(f, 'restrito') === 'true' },
    'Restrição atualizada.')
}

export async function alterarAtribuicao(f: FormData) {
  await enviar('/v1/atribuicoes',
    { usuario: texto(f, 'usuario'), perfil: texto(f, 'perfil'), atribuir: texto(f, 'atribuir') === 'true' },
    'Atribuição atualizada.')
}
