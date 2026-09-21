# erp-zona-acesso

**Zona de gestão de acesso**: tela para definir qual perfil acessa qual módulo, o que é restrito e quais perfis cada usuário tem.

| | |
|---|---|
| Porta | `3003` (acessada pelo navegador **só via shell**, `http://localhost:3000`) |
| Rotas | `/acesso` (restrito a `plataforma.admin-acesso`) |
| Chama | `gestao-acesso` (`:4010`) — declarados em `lib/nucleo.ts` (registro de destinos) |
| Depende de | `@erp/nucleo`, `@erp/moldura`, `@erp/contratos` (Verdaccio local `:4873`) |

## Onde fica cada coisa

| Arquivo | Para quê |
|---|---|
| `app/` | páginas e Server Actions desta aplicação |
| `lib/nucleo.ts` | instância do núcleo: sessão, destinos permitidos, gestão de acesso |
| `lib/pagina.ts` | sessão da página, `exigirModulo`, moldura, envelope de Server Action |
| `acesso.manifesto.ts` | módulos, perfis e concessões desta aplicação (`pnpm registrar` envia) |
| `proxy.ts` | camada 1: cookie de sessão e CSP |

## Comandos

```bash
pnpm install
pnpm dev          # desenvolvimento, porta 3003
pnpm typecheck
pnpm registrar    # registra o manifesto na gestão de acesso
```

A base inteira (subir, verificar ponta a ponta) é operada pelo repositório principal `nextjs-mfe`: veja o README de lá.

## Regras

Invariantes do projeto: `docs/design-bff/comum/AGENTS.md` no repositório principal. Nesta
aplicação, o que mais importa: toda página chama `exigirModulo` e toda Server Action usa
`acaoProtegida`; domínio só por `nucleo.destino(...)`, nunca `fetch` direto.
