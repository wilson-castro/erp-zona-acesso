import { FormularioDeAcao } from '@erp/moldura'
import { nucleo } from '@/lib/nucleo'
import { exigirPapel } from '@/lib/pagina'
import { concederAcesso, revogarAcesso } from './acoes'

type Unidade = { id: string; nome: string }
type Pessoa = { id: string; nome: string; status: string }
type Modulo = { id: string; nome: string }
type Acesso = { id: string; pessoa: string; modulo: string; situacao: string; perfil: string | null }

/** Acesso que ainda vale ou espera validação: é o que se revoga. */
const vigente = (a: Acesso) => a.situacao === 'ativo' || a.situacao === 'pendente'

/**
 * Gestão de acesso v2 (ADR-0014, adendo 1): pessoas de uma unidade × módulos. A página só existe
 * para quem tem papel administrativo (`exigirPapel`); o que cada um vê e pode fazer é o domínio
 * que decide — a lista de pessoas já vem filtrada pelo escopo de quem pergunta (invariante 9).
 */
export default async function GestaoDeAcesso({ searchParams }: { searchParams: Promise<{ unidade?: string }> }) {
  await exigirPapel()
  const gestao = nucleo.destino('gestao-acesso')
  const unidades = (await gestao.get<Unidade[]>('/v2/unidades')).body ?? []
  const pedida = (await searchParams).unidade
  const unidade = unidades.find((u) => u.id === pedida) ?? unidades[0]
  if (!unidade) return <h1>Gestão de acesso</h1>

  const [pessoas, modulos, acessos] = await Promise.all([
    gestao.get<Pessoa[]>('/v2/pessoas', { query: { unidade: unidade.id } }).then((r) => r.body ?? []),
    gestao.get<Modulo[]>('/v2/modulos').then((r) => r.body ?? []),
    gestao.get<Acesso[]>('/v2/acessos').then((r) => r.body ?? []),
  ])
  const acessoDe = (p: string, m: string) => acessos.find((a) => a.pessoa === p && a.modulo === m && vigente(a))

  return (
    <>
      <h1>Gestão de acesso</h1>
      <nav aria-label="Unidades">
        <ul>
          {unidades.map((u) => (
            <li key={u.id}>
              <a href={`/acesso?unidade=${encodeURIComponent(u.id)}`} {...(u.id === unidade.id ? { 'aria-current': 'page' as const } : {})}>{u.nome}</a>
            </li>
          ))}
        </ul>
      </nav>

      <h2>Acesso a módulos — {unidade.nome}</h2>
      <table>
        <thead>
          <tr><th scope="col">Pessoa</th>{modulos.map((m) => <th key={m.id} scope="col">{m.nome}</th>)}</tr>
        </thead>
        <tbody>
          {pessoas.filter((p) => p.status !== 'desligado').map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.nome}</th>
              {modulos.map((m) => {
                const a = acessoDe(p.id, m.id)
                return (
                  <td key={m.id}>
                    {a
                      ? (
                        <FormularioDeAcao acao={revogarAcesso} campos={{ acesso: a.id, pessoa: p.id, modulo: m.id }}>
                          {a.situacao}{a.perfil ? ` · ${a.perfil}` : ''}{' '}
                          <button type="submit" aria-label={`revogar ${m.id} de ${p.id}`}>Revogar</button>
                        </FormularioDeAcao>
                      )
                      : (
                        <FormularioDeAcao acao={concederAcesso} campos={{ pessoa: p.id, modulo: m.id }}>
                          <button type="submit" aria-label={`conceder ${m.id} a ${p.id}`}>Conceder</button>
                        </FormularioDeAcao>
                      )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
