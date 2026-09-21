import '@erp/moldura/estilo.css'
import type { ReactNode } from 'react'
import { Moldura } from '@erp/moldura'
import { dadosDaMoldura } from '@/lib/pagina'

export default async function LayoutDaZona({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><Moldura {...await dadosDaMoldura()}>{children}</Moldura></body>
    </html>
  )
}
