// Registra a rota desta zona (id e origem interna) na gestão de acesso, de onde o shell lê o mapa de
// zonas (C3). Passo de deploy, não de runtime: roda antes de a zona receber tráfego.
// Exceção documentada ao invariante 4: roda fora do Next (sem `server-only`), então usa `fetch` com as
// mesmas travas do registro de destinos — origem fixa, sem seguir redirecionamento, com timeout.
// O id é desta zona (vem do pacote, nunca do ambiente); a origem interna é do ambiente de deploy,
// não do código (invariante 17).
// A zona de acesso não tem manifesto (ADR-0014, adendo 1): o id é desta constante.
export {}
const id = 'acesso'

const url = process.env.ACESSO_URL ?? 'http://127.0.0.1:4020'
const origem = process.env.ERP_ZONA_ORIGEM_INTERNA ?? 'http://127.0.0.1:3003'
// Token de serviço de desenvolvimento. O domínio só aceita a rota cujo id é o do serviço.
const token = process.env.ERP_TOKEN_SERVICO ?? `svc.${id}`

const r = await fetch(`${url}/v2/zonas/${id}/rota`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ origem }),
  redirect: 'manual',
  signal: AbortSignal.timeout(5000),
})
if (r.status !== 200) {
  console.error(`registro da rota de ${id} falhou: HTTP ${r.status}`)
  process.exit(1)
}
console.log(`rota de ${id} registrada (${origem})`)
