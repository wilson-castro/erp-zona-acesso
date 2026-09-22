import '@erp/moldura/estilo.css'
import type { ReactNode } from 'react'
import { Moldura, ServicoIndisponivel } from '@erp/moldura'
import { dadosDaMoldura } from '@/lib/pagina'

export default async function LayoutDaZona({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><MolduraOuAviso>{children}</MolduraOuAviso></body>
    </html>
  )
}

/** Sem a gestão de acesso, a página não é renderizada: nenhum módulo pode ser decidido. */
async function MolduraOuAviso({ children }: { children: ReactNode }) {
  const { indisponivel, ...moldura } = await dadosDaMoldura()
  return <Moldura {...moldura}>{indisponivel ? <ServicoIndisponivel /> : children}</Moldura>
}
