'use server'

import { nucleo } from '@/lib/nucleo'
import { acaoProtegida } from '@/lib/pagina'

type Rota = '/v1/concessoes' | '/v1/restricoes' | '/v1/atribuicoes'

/** Envia ao domínio, que é quem autoriza, e volta para a tela com o resultado num toast. */
const enviar = (rota: Rota, corpo: Record<string, unknown>, sucesso: string) =>
  acaoProtegida('acesso.admin', '/acesso', async () => {
    await nucleo.destino('gestao-acesso').post(rota, { corpo })
    return { toast: { tipo: 'sucesso', texto: sucesso }, destino: '/acesso' }
  })

const texto = (f: FormData, k: string) => String(f.get(k) ?? '')

export async function alterarConcessao(f: FormData) {
  return enviar('/v1/concessoes',
    { perfil: texto(f, 'perfil'), modulo: texto(f, 'modulo'), conceder: texto(f, 'conceder') === 'true' },
    'Concessão atualizada.')
}

export async function alterarRestricao(f: FormData) {
  return enviar('/v1/restricoes',
    { modulo: texto(f, 'modulo'), restrito: texto(f, 'restrito') === 'true' },
    'Restrição atualizada.')
}

export async function alterarAtribuicao(f: FormData) {
  return enviar('/v1/atribuicoes',
    { usuario: texto(f, 'usuario'), perfil: texto(f, 'perfil'), atribuir: texto(f, 'atribuir') === 'true' },
    'Atribuição atualizada.')
}
