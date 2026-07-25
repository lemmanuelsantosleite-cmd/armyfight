
# Plano — Exames avaliativos, Conquistas e Cave-mestra

Escopo grande. Vou entregar em **3 fases funcionais**, mantendo 100% do design militar atual (cores, camuflagem, tipografia, layout das faixas, componentes `afc-*`). Nenhuma tela existente muda visualmente — só ganha novos itens.

Antes de tudo: **hoje o login já é por e-mail/senha via Lovable Cloud (Fase 0 anterior)**. Você pediu "manter o login antigo do Mestre Clóvis com senha `clovis1989!!`". Vou implementar isso como **atalho de login**: um botão "Entrar como Mestre Clóvis" na tela de auth que aceita a senha `clovis1989!!` e faz login na conta real do Mestre no banco. A conta continua existindo no Cloud (necessário para RLS e sincronização entre dispositivos), mas você não precisa lembrar e-mail nenhum — só a senha antiga.

## Fase A — Contas fixas, cave-mestra e administradores limitados

- **Conta fixa Mestre Clóvis**
  - E-mail interno: `clovis@armyfightclub.local`, senha `clovis1989!!`, role `mestre`.
  - Botão "Entrar como Mestre" na tela de login aceita só a senha e entra.
  - Depois de logado, Clóvis pode editar seu próprio e-mail real, telefone, foto etc. no perfil (a senha do atalho continua `clovis1989!!` até ele mesmo trocar).
- **Cave-mestra Lucas (super-admin oculto)**
  - Usuário `lucas_admin`, senha `Lucas2011!!`, role nova `super`.
  - **Nunca aparece** em nenhuma listagem, painel, contagem, dashboard ou log. Nenhum outro usuário (incluindo Mestre) consegue ver, editar, excluir ou renomear. Protegido por trigger no banco.
  - Login por um campo escondido (Ctrl+Shift+L abre modal secreto na tela de auth).
  - Acesso total, sem limitações.
- **Administradores "pequenos"** (nova role `admin_limitado`)
  - Mestre cria/remove no painel e escolhe permissões por checkbox: aprovar alunos, lançar mensalidade, marcar presença, editar técnicas, criar exames, editar exames, emitir certificado.
  - RLS respeita as permissões via tabela `admin_permissoes`.
- **Rodapé discreto** com "Feito por Lucas" em todas as páginas (cor `paperDim`, tipografia atual).

## Fase B — Sistema de Exames avaliativos

Substitui a tabela `exames` atual por uma estrutura completa (mantém dados existentes migrando o que for compatível).

- **Cadastro do exame**: aluno, faixa atual, faixa alvo, data, local, examinador, observações.
- **Ficha de avaliação** com os 18 itens pedidos (defesas, socos, chutes, quedas, rolamentos, defesa faca, defesa bastão, sparring, condicionamento, equilíbrio, flexibilidade, coordenação, disciplina, respeito, frequência, participação, postura, controle emocional).
- **Dois modelos** de nota escolhidos por exame: numérico 0–10 **ou** conceitual (Excelente/Bom/Regular/Necessita melhorar).
- **Resultado final**: Aprovado / Aprovado com observações / Reprovado.
- **Comentário do Mestre** (texto livre ilimitado) e **Objetivos para a próxima faixa** (lista editável) — objetivos aparecem no perfil do aluno.
- **Mídia**: anexar fotos e vídeos ao exame (URLs, mesmo padrão das técnicas).
- **Histórico permanente** agrupado por ano. Exames nunca são apagados de fato — cancelar/reabrir muda status, não remove.
- **Certificado digital** para aprovados: página imprimível em A4 paisagem com nome, faixa, data, Mestre, logo Army Fight Club, assinatura digital (imagem enviada uma vez pelo Mestre) — botão "Baixar Certificado" (imprime como PDF pelo navegador, sem lib extra).
- **Registro de alterações**: cada save grava autor + timestamp em `exame_auditoria`, exibido no rodapé do exame ("Última alteração: Mestre Clóvis 20/08/2026 19:43"). Nunca apagado.
- **Permissões**: só Mestre (e Lucas) edita/exclui/reabre. Aluno só lê o próprio exame, baixa certificado, vê comentários/notas/objetivos.

## Fase C — Conquistas, Perfil rico, Dashboard, Notificações

- **Conquistas**: tabelas `achievements` (catálogo com 22 conquistas iniciais, medalha bronze/prata/ouro/diamante/lendária, regra) e `user_achievements` (desbloqueios por aluno).
  - Regras automáticas via trigger/função ao inserir presença, exame aprovado, matrícula (tempo de academia), etc.
  - Regras manuais (destaque do mês, disciplina exemplar, campeonato vencido) — Mestre concede pelo painel.
  - Barra de progresso "X de Y" no perfil.
- **Página de Perfil do aluno** (`/perfil`): foto, nome, faixa, tempo de academia, mensalidade, % presença, conquistas, certificados, objetivos ativos, histórico de exames, próximas faixas, próximo exame.
- **Painel do Mestre** (`/admin`) ganha bloco de estatísticas: totais, ativos, bloqueados, mensalidades em atraso, próximos exames, últimos aprovados/reprovados, conquistas desbloqueadas no mês, frequência geral, alunos destaque.
- **Notificações**: tabela `notificacoes` + sininho no header (dropdown). Gatilhos: nova técnica, nova faixa liberada, exame marcado/publicado, certificado disponível, conquista desbloqueada, comentário do Mestre, objetivos atualizados. Sem push/e-mail — só in-app com contador.

## Detalhes técnicos

- Stack atual (TanStack Start + Lovable Cloud + Realtime). Nenhuma nova dependência.
- Novas tabelas: `exames` (recriada), `exame_avaliacoes`, `exame_midias`, `exame_auditoria`, `certificados`, `achievements`, `user_achievements`, `notificacoes`, `admin_permissoes`, `app_settings` (assinatura do Mestre).
- Todas com RLS: aluno lê o próprio; Mestre e super leem tudo; `admin_limitado` conforme `admin_permissoes`.
- `super` (Lucas) é filtrado em **toda** query de listagem por policy, para nunca vazar. Nenhuma UI o exibe.
- Realtime nas tabelas críticas para sincronização.
- Certificado impresso via `window.print()` numa rota dedicada com CSS de impressão — zero libs.
- Rodapé "Feito por Lucas" adicionado ao `__root.tsx`.

## Ordem de entrega

1. **Fase A** primeiro (login Clóvis + cave Lucas + rodapé + admins limitados).
2. Depois **Fase B** (Exames completos + Certificado + Auditoria).
3. Por último **Fase C** (Conquistas + Perfil + Dashboard + Notificações).

## Confirme antes de começar

1. **OK entregar em A → B → C** (cada fase testável), ou você quer tudo de uma vez (leva bem mais tempo/créditos)?
2. **Nome de exibição do Mestre no atalho**: mantenho "Mestre Clóvis"? Nome do examinador nos exames é sempre ele por padrão?
3. **Certificado**: posso usar impressão do navegador (gera PDF pelo "Salvar como PDF") — evita adicionar biblioteca pesada. OK?
4. **Assinatura digital**: Mestre envia uma imagem PNG da assinatura (upload por URL) uma vez e ela é usada em todos os certificados. OK?
