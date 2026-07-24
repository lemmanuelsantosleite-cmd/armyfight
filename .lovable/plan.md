
# Sistema Profissional Army Fight Club Hapkido

O escopo é grande. Vou entregar em **fases**, mantendo 100% do design militar atual. Cada fase é funcional e testável antes da próxima.

## Fase 0 — Base (obrigatória antes de tudo)
- Ativar **Lovable Cloud** (banco + auth + realtime).
- Migrar dados atuais (técnicas em `localStorage`) para tabelas no banco.
- Corrigir o bug de login atual substituindo o fluxo por auth real (email + senha).
- Conta do Mestre Clóvis criada com role `mestre`.

## Fase 1 — Autenticação e Aprovação de Alunos
- Cadastro de aluno (email, senha, nome, telefone, nascimento, foto).
- Tabela `profiles` + tabela `user_roles` (`mestre` / `aluno`) + coluna `status` (`pendente`/`aprovado`/`bloqueado`).
- Alunos novos ficam `pendente` — Mestre aprova no painel.
- Notificação de novos cadastros no dashboard do Mestre.
- RLS: cada aluno só vê a si mesmo; Mestre vê todos.

## Fase 2 — Graduação e Bloqueio de Conteúdo
- Campo `faixa_atual` no perfil do aluno.
- Alunos veem só faixas ≤ à sua; demais aparecem com **cadeado** e mensagem.
- Mestre altera faixa pelo painel; mudanças refletem em tempo real (Supabase Realtime).
- Nova categoria **Quedas** somada às três atuais.

## Fase 3 — Mensalidades
- Tabela `mensalidades` (aluno, valor, vencimento, pago em, status).
- Mestre define valor padrão e registra pagamento manual.
- Status 🟢 em dia / 🔴 atrasado calculado por data.
- Bloqueio por inadimplência (flag no perfil) — aluno bloqueado só vê mensagem de aviso.
- Página **Devedores** com dias de atraso, valor devido, último pagamento.

## Fase 4 — Presença
- Tabela `presencas` (aluno, data, presente bool).
- Aba **Presença** para o Mestre marcar por dia (grid alunos × dias).
- Aluno vê própria frequência: total presenças, faltas, %.

## Fase 5 — Dashboard, Exames, Estatísticas
- Dashboard Mestre: totais (alunos ativos, bloqueados, mensalidades pendentes/pagas, cadastros pendentes, últimos graduados).
- Tabela `exames` (aluno, faixa atual, próxima faixa, data, situação).
- Gráficos (recharts): alunos por faixa, frequência mensal, mensalidades, contagens de mídia.

## Detalhes técnicos
- Stack: TanStack Start + Lovable Cloud (Supabase). Realtime para sincronização.
- Roles em tabela separada (`user_roles`) + função `has_role()` security definer.
- RLS em todas as tabelas; `_authenticated` layout gate; rota `/auth` pública.
- Design: reaproveita `COLORS`, componentes `afc-*` existentes — nenhuma mudança visual.
- Login atual (senha única `Clovishapkidoarmy`) removido; Mestre passa a logar com email/senha reais criados na Fase 0.

## Perguntas antes de começar

1. **Email do Mestre Clóvis** para criar a conta admin (ex.: `mestre@armyfightclub.com`)? E qual senha inicial?
2. Confirmo que o **conteúdo das técnicas** (vídeos/imagens/textos) fica visível a **todos os alunos aprovados** respeitando a faixa — e **público** (sem login) fica **totalmente bloqueado**, correto?
3. Posso entregar **Fases 0+1+2 primeiro** (auth, aprovação, graduação + bloqueio, categoria Quedas, correção de bugs) e as fases 3–5 (mensalidade, presença, dashboard) na sequência? Ou prefere tudo de uma vez (leva bem mais tempo e créditos)?

Responda os 3 pontos e eu ativo o Cloud e começo.
