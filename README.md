# Pantry Pilot

Planejador local de compras domésticas para comparar Woolworths e Coles, organizar estoques, acompanhar ofertas personalizadas e explicar a melhor estratégia de compra para uma família.

## O que já funciona nesta primeira versão

- Lista de compras compartilhada no navegador, persistida localmente.
- Cadastro de itens, categorias e estimativa de preço.
- Estoque com nível mínimo e sugestão de reposição.
- Perfis familiares e contas de fidelidade separadas.
- Ofertas por rede e perfil, com cálculo de benefício estimado.
- Simulador de estratégia que pode dividir a cesta entre contas/transações.
- Monitor diário configurável para oportunidades de preço e itens de baixo estoque.
- Histórico de compras: importação de linhas CSV locais para recalcular frequência e preço médio.
- Scanner de código de barras com câmera em navegadores compatíveis (e entrada manual como alternativa).
- Fluxo de "preparar carrinhos" pronto para receber os conectores de Woolworths e Coles.
- Interface responsiva e instalável como PWA no iPhone.

> Os dados iniciais são fictícios e ficam somente no `localStorage` do navegador. Esta versão não armazena senhas, cookies, códigos 2FA ou dados de pagamento.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm start
```

Abra `http://localhost:4173`.

Para acesso no iPhone dentro da rede Tailscale, use Tailscale Serve com HTTPS; não exponha a porta diretamente no roteador.

## Próximas integrações

1. Banco local SQLite e autenticação da família.
2. Captura assistida de histórico de pedidos/recibos nas plataformas.
3. Captura de preços e ofertas por sessão isolada, com aprovação explícita.
4. Scanner de código de barras com câmera e catálogo canônico.
5. Conector de carrinho por plataforma; checkout manual como padrão.
6. Política opcional de pedido automático com limites, substituições e auditoria.

## Segurança

- Segredos e sessões devem usar o chaveiro do sistema, nunca Git ou `localStorage`.
- Webhooks de SMS 2FA precisam de assinatura HMAC e códigos transitórios que não são gravados.
- Uma conta de fidelidade por transação; ofertas e regras devem ser confirmadas antes de criar o pedido.

### Webhook SMS 2FA

O serviço disponibiliza `POST /api/webhooks/sms` para o provedor de SMS virtual. Ele só é ativado quando a variável `PANTRY_PILOT_SMS_WEBHOOK_SECRET` estiver configurada. O provedor deve enviar o cabeçalho `x-pantry-signature`, com HMAC SHA-256 do corpo JSON, e um payload com `accountId` e `message`. O código é aceito apenas se houver uma autenticação pendente para aquela conta e é descartado em memória logo após a validação.
