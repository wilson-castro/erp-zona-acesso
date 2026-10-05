/**
 * Hosts do shell que servem esta aplicação ao navegador (`SHELL_HOSTS`, separados por vírgula; padrão
 * `localhost:3000`). Espaço em volta de cada host é ignorado (`a:3000, b:3000`) e item vazio some, como no
 * `lerHostsDoShell` do shell: sem isso, `' b:3000'` nunca casaria com o `Origin` de uma Server Action.
 * Uma leitura só para `hostsPermitidos` (lib/pagina.ts) e `allowedOrigins` (next.config.ts). Sem
 * `server-only`: é puro e o `next.config.ts` também o importa.
 */
export function lerHostsDoShell(valor: string | undefined = process.env.SHELL_HOSTS): string[] {
  return (valor ?? 'localhost:3000').split(',').map((h) => h.trim()).filter((h) => h !== '')
}
