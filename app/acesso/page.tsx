import { nucleo } from '@/lib/nucleo'
import { exigirModulo } from '@/lib/pagina'
import { alterarAtribuicao, alterarConcessao, alterarRestricao } from './acoes'

type Catalogo = {
  zonas: string[]
  modulos: { id: string; zona: string; rotulo: string; prefixo: string; restrito: boolean; perfis: string[] }[]
  perfis: { id: string; zona: string; rotulo: string }[]
  usuarios: { usuario: string; perfis: string[] }[]
}

/** Perfil de zona só concede módulo da própria zona (D8); perfil de plataforma, qualquer um. */
const podeConceder = (perfil: string, modulo: string) =>
  perfil.startsWith('plataforma.') || perfil.split('.')[0] === modulo.split('.')[0]

/** Um botão que envia `campo = !ligado` junto com os campos fixos que identificam a linha. */
function Alternar({ acao, fixos, campo, ligado, rotulo }: {
  acao: (f: FormData) => Promise<void>; fixos: Record<string, string>; campo: string; ligado: boolean; rotulo: string
}) {
  return (
    <form action={acao}>
      {Object.entries(fixos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name={campo} value={String(!ligado)} />
      <button type="submit" aria-pressed={ligado} aria-label={rotulo}>{ligado ? 'Sim' : 'Não'}</button>
    </form>
  )
}

export default async function GestaoDeAcesso() {
  await exigirModulo('acesso.admin')
  const cat = (await nucleo.destino('gestao-acesso').get<Catalogo>('/v1/catalogo')).body
  if (!cat) return <h1>Gestão de acesso</h1>

  return (
    <>
      <h1>Gestão de acesso</h1>
      <p>Zonas registradas: {cat.zonas.join(', ')}. Cada zona publica o próprio catálogo; a atribuição é feita aqui.</p>

      <h2>Módulos: restrição e perfis que concedem</h2>
      <table>
        <thead>
          <tr><th scope="col">Módulo</th><th scope="col">Restrito</th>{cat.perfis.map((p) => <th key={p.id} scope="col">{p.id}</th>)}</tr>
        </thead>
        <tbody>
          {cat.modulos.map((m) => (
            <tr key={m.id}>
              <th scope="row">{m.rotulo} <small>({m.id})</small></th>
              <td><Alternar acao={alterarRestricao} fixos={{ modulo: m.id }} campo="restrito" ligado={m.restrito} rotulo={`${m.id} restrito`} /></td>
              {cat.perfis.map((p) => (
                <td key={p.id}>
                  {podeConceder(p.id, m.id)
                    ? <Alternar acao={alterarConcessao} fixos={{ perfil: p.id, modulo: m.id }} campo="conceder"
                        ligado={m.perfis.includes(p.id)} rotulo={`${p.id} concede ${m.id}`} />
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Usuários e perfis</h2>
      <table>
        <thead>
          <tr><th scope="col">Usuário</th>{cat.perfis.map((p) => <th key={p.id} scope="col">{p.id}</th>)}</tr>
        </thead>
        <tbody>
          {cat.usuarios.map((u) => (
            <tr key={u.usuario}>
              <th scope="row">{u.usuario}</th>
              {cat.perfis.map((p) => (
                <td key={p.id}>
                  <Alternar acao={alterarAtribuicao} fixos={{ usuario: u.usuario, perfil: p.id }} campo="atribuir"
                    ligado={u.perfis.includes(p.id)} rotulo={`${u.usuario} tem ${p.id}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
