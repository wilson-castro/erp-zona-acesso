import { definirManifesto } from '@erp/contratos'

/** Concedido ao perfil global `plataforma.admin-acesso` pelo próprio domínio, não aqui. */
export default definirManifesto({
  zona: 'acesso',
  modulos: [{ id: 'acesso.admin', rotulo: 'Gestão de acesso', prefixo: '/acesso', restritoPorPadrao: true }],
  perfis: [],
  concessoes: {},
})
