# Retomar — Pantry Pilot

Atualizado em 31/10/2026 (Melbourne).

## Próxima ação

- [ ] No computador, conferir alterações locais e branches em uso, comparar com esta documentação e definir com Anderson a próxima tarefa de desenvolvimento.

## Estado conhecido

- Repositório: anderri/pantry-pilot; branch padrão consultada: main.
- Branch desta documentação: docs/cross-device-handoff.
- Planejador doméstico de compras, estoque, preços/ofertas e perfis familiares, com comparação de Woolworths e Coles.
- O README descreve uma versão local, com dados iniciais fictícios e persistência no localStorage; não foi validado o comportamento nesta sessão.
- Último commit da main consultado nesta conversa: 721e495, para permitir exclusão de perfis familiares.
- Executar localmente conforme README: npm start, porta 4173. Conferir os scripts atuais antes de agir.

## Pendências para conferir no computador

- [ ] Mapear funcionalidades implementadas, alterações locais e próximas prioridades, distinguindo o que o README chama de próximas integrações.
- [ ] Conferir como preservar os dados de navegador entre dispositivos; Git não sincroniza localStorage.
- [ ] Confirmar o estado de autenticação familiar, persistência e conectores de supermercados antes de descrever qualquer um como operacional.
- [ ] Conferir os comandos de testes existentes e registrar os resultados ao alterar código. Nenhum teste ou build executado nesta sessão.

## Cuidados do projeto

Não commitar senhas, cookies, códigos 2FA, dados de pagamento ou segredos de webhook. Preservar acesso privado do app conforme README; não expor a porta no roteador. Checkout manual é o padrão descrito. Não executar compras, logins ou integrações externas como parte deste handoff.

## Continuidade entre dispositivos

Ao retomar, ler este arquivo, conferir a branch/PR no GitHub e o git status local. Preservar alterações locais antes de trocar de branch ou integrar mudanças. Um único agente deve editar a mesma branch por vez.

Antes de um handoff explícito, atualizar próxima ação, pendências, branch/PR e verificações realmente executadas; fazer commit e push das mudanças relevantes e confirmar o resultado. Não incluir segredos. Não fazer merge nem publicar como parte do handoff. Encerrar a chamada ou fechar o aplicativo não atualiza este arquivo automaticamente.

Marcar tarefas como concluídas somente após confirmação. Não aplicar automaticamente o fluxo develop/staging/main do site: conferir primeiro o fluxo deste repositório.
