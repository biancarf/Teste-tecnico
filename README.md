# Desafio QA — Desbravador Reservas Online

Cenários de teste em BDD (Gherkin pt-BR), execução documentada e automação E2E com **Playwright + playwright-bdd (TypeScript)** para o fluxo de reserva do motor Desbravador Reservas Online.

## TL;DR do resultado

> **Não é possível concluir uma reserva no ambiente de testes hoje.** O fluxo do enunciado para no passo 3/4.

| | |
|---|---|
| Casos de teste | 16 cenários (19 execuções) em 5 funcionalidades |
| Aprovados | 4 (+1 com ressalva) |
| Reprovados | 6 |
| Bloqueados / não executados | 5 |
| Defeitos | 5 (1 bloqueante, 1 alto, 2 médios, 1 baixo) + 5 observações de requisito |

Principais achados:

1. **BUG-01 (bloqueante):** o seletor de adultos de todas as acomodações vem vazio, e nenhum quarto pode ser adicionado ao carrinho. Causa: a API devolve capacidade `0` para esses quartos e o front oferta assim mesmo.
2. **BUG-02 (alto):** todos os preços aparecem como **"R$ NaN,undefined"**.
3. **O roteiro do enunciado é inviável como escrito:** a URL `/1111` dá 404 (o motor migrou para `/hotel-app/<slug>`); o quarto **ST1 comporta no máximo 2 pessoas** (o roteiro pede 3) e não teve disponibilidade em nenhum período; o **cartão de teste está vencido** (12/23).

Detalhes, passos de reprodução e análise de causa: **[docs/RELATORIO_DE_EXECUCAO.md](docs/RELATORIO_DE_EXECUCAO.md)**.
Por que cada cenário foi escolhido: **[docs/ESTRATEGIA_E_CENARIOS.md](docs/ESTRATEGIA_E_CENARIOS.md)**.

## Estrutura

```
features/                         # Cenários Gherkin (pt-BR) — a especificação
  01_disponibilidade.feature
  02_selecao_acomodacao.feature
  03_reserva_ponta_a_ponta.feature  # fluxo exato do enunciado
  04_pagamento.feature
  05_navegacao_e_ambiente.feature
src/
  pages/                          # Page Objects (Home, Reservation, Checkout, AlertModal)
  steps/                          # Step definitions
  data/test-data.ts               # Massa de testes (hotel, cartões, hóspedes)
  support/dates.ts                # Datas relativas ("hoje+7")
  fixtures.ts                     # Fixtures + hook de cenários não executáveis
docs/                             # Estratégia e relatório de execução
.github/workflows/e2e.yml         # CI: push, PR e regressão diária
```

## Como executar

Pré-requisito: Node.js 20+.

```bash
npm ci
npx playwright install chromium

npm test              # suíte completa (gera os testes a partir dos .feature e executa)
npm run test:smoke    # só o caminho crítico (@smoke)
npm run test:headed   # vendo o navegador, 1 worker
npm run report        # abre o relatório HTML (com trace, screenshot e vídeo das falhas)
```

Filtrar por tag:

```bash
npx bddgen && npx playwright test --grep @critico
npx bddgen && npx playwright test --grep "@bug"
```

Variáveis opcionais em `.env.example` (`BASE_URL`, `HOTEL_SLUG`, dados do cartão de teste).

## Convenções de tags

| Tag | Significado |
|---|---|
| `@smoke` | Caminho crítico; roda também no projeto mobile |
| `@critico` | Falha aqui = perda de receita ou risco financeiro |
| `@negativo` | Entrada inválida / caminho de erro |
| `@bug` | Cenário que reproduz um defeito aberto (ID no título) |
| `@fail` | **Falha esperada:** o bug ainda existe. O teste passa enquanto o bug persistir e quebra quando ele for corrigido, avisando para remover a tag |
| `@nao-executavel` | Pré-condição inalcançável no ambiente atual; aparece como *fixme* no relatório |

## Decisões e limitações

- **URL testada:** `https://reservas.desbravador.com.br/hotel-app/desbravador-4-5`, o hotel de demonstração da Desbravador (o próprio front roteia esse slug para a API de homologação). A URL do enunciado retorna 404.
- **Criança "até 05 anos":** o motor trabalha com faixas 0–2, 3–12 e 13–15. Usei 3–12 (uma criança de 5 anos). Ver OBS-02 no relatório.
- **Etapas de hóspedes e pagamento:** automatizadas com seletores semânticos (label/placeholder), mas **não validadas contra o DOM real**, porque ficaram inalcançáveis pelo BUG-01. Ao destravar o fluxo, validar com `npx playwright codegen` e ajustar `src/pages/CheckoutPage.ts`; os steps não mudam.
- **Nenhum dado real:** cartões são de teste de gateway; hóspedes e e-mails são fictícios (`example.com`).
