# Recon map: Grupo Villela – Franqueado (iOS / Android + portal web)

Scope: só a busca de empresas por CNPJ e a descoberta dos números de WhatsApp mais prováveis de cada empresa
For: uso próprio do Ricardo, prospecção de médicos/clínicas para o negócio de seguros (MedINSS Pro)
Date: 2026-10-18

> **Status: mapa parcial.** O ambiente de nuvem bloqueou o acesso à App Store, ao
> Google Play e ao portal (`apps.apple.com`, `play.google.com` e
> `portal-saas.aceleradorvillela.com` deram erro de rede). As telas do original
> abaixo são **hipóteses**, montadas a partir da descrição pública nas buscas. Para
> fechar o mapa, faltam prints do app (ver "Próximo passo").

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store (BR) | https://apps.apple.com/br/app/grupo-villela-franqueado/id6741768231 | bloqueado neste ambiente. Desenvolvedor listado: OFFICIAL BANK SERVICOS FINANCEIROS EIRELI |
| 2 | Google Play | https://play.google.com/store/apps/details?id=com.br.grupovillelafranqueado | bloqueado. Desenvolvedor: VILLELA INSTITUICAO DE PAGAMENTO SA |
| 3 | Portal SaaS (login) | https://portal-saas.aceleradorvillela.com/login | atrás de login. Só pode ser estudado pela conta do próprio usuário, se ele tiver uma |
| 4 | Resumo da loja (via busca) | https://mwm.ai/apps/grupo-villela-franqueado/6741768231 | "buscador de empresas via API no mapa", contatos com localização por GPS, agendamento de visitas, funil de vendas |
| 5 | Matéria Gazeta Mercantil | https://www.gazetamercantil.digital/grupo-villela-aposta-em-ia-para-escalar-franquias-e-mira-faturamento-de-r-1-bilhao-ate-2026/ | "geração de leads qualificados", scripts de venda, itinerários com geolocalização, IA |
| 6 | Programa Acelera | https://programaacelera.grupovillela.com.br/ | foco em escritórios contábeis. Nada sobre WhatsApp |

### Fontes de dados públicas para o clone (não pertencem à Villela)

| fonte | o que dá | custo |
| --- | --- | --- |
| Receita Federal – Dados Abertos do CNPJ (dados.gov.br) | todas as empresas do Brasil: razão social, CNAE, endereço, **até 2 telefones com DDD**, e-mail, sócios (QSA). Atualização mensal | grátis (arquivo grande, alguns GB) |
| BrasilAPI `/api/cnpj/v1/{cnpj}` | consulta de 1 CNPJ: os mesmos dados acima, incluindo `ddd_telefone_1` e `ddd_telefone_2` | grátis, com limite de uso |
| APIs comerciais de enriquecimento (ex.: CNPJá, Casa dos Dados, ReceitaWS) | mais telefones e dados extras, conforme o plano | pago |
| CNES / DataSUS e o próprio site, Google Business Profile e Instagram da clínica | telefone público divulgado pela clínica e médicos vinculados | grátis (leitura manual ou API oficial) |

## Core loop

Digitar um CNPJ (ou filtrar por região e especialidade), ver os dados da empresa e
receber uma lista ordenada dos telefones com mais chance de ter WhatsApp, prontos
para abrir a conversa.

## Screens (hipóteses: confidence guess até chegarem os prints)

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Busca | aba "Empresas" | digitar CNPJ ou nome | campo com máscara de CNPJ, botão Buscar, histórico recente | vazio, digitando, CNPJ inválido |
| S02 | Busca no mapa | aba "Mapa" | achar empresas por região | mapa, filtro de CNAE/segmento, raio, pinos | sem resultados, carregando, cheio |
| S03 | Lista de resultados | após buscar/filtrar | escolher a empresa | cards (razão social, cidade, CNAE, situação) | vazio, carregando, cheio, erro da API |
| S04 | Ficha da empresa | toque no card | ver os dados e os contatos | dados cadastrais, sócios, **lista de telefones com nota de WhatsApp**, botões "Abrir WhatsApp" e "Ligar" | empresa baixada/inapta, sem telefone, cheio |
| S05 | Salvar como lead | botão na S04 | mandar para o funil | status do lead, observação | salvo, duplicado |

## Flows

```
F01 Encontrar o WhatsApp de uma clínica pelo CNPJ
    S01 -> S04 -> toque "Abrir WhatsApp" (wa.me)
    happy path clicks: 3 (colar CNPJ, buscar, abrir)
    edge: CNPJ com/sem pontuação, CNPJ inexistente, empresa baixada,
          nenhum telefone, só telefone fixo, telefone do contador (repetido
          em centenas de CNPJs), API fora do ar ou limite atingido

F02 Achar clínicas novas na minha região
    S02 (filtro CNAE 8630-5 "atividade médica ambulatorial", cidade, raio) -> S03 -> S04
    happy path clicks: 4-5
    edge: milhares de resultados, filtro sem resultado, empresa sem endereço geocodificável

F03 Salvar e acompanhar
    S04 -> S05 -> funil (fora deste recorte)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Campo CNPJ | com máscara | vazio, válido, inválido (dígito verificador) | S01 |
| Card de empresa | lista, pino do mapa | ativa, baixada | S02, S03 |
| Linha de telefone | celular, fixo | nota alta/média/baixa, motivo da nota, copiado | S04 |
| Botão WhatsApp | primário | normal, desabilitado (sem celular) | S04 |
| Filtro | CNAE, cidade/UF, raio, data de abertura | aplicado, limpo | S02 |

## Inferred data model

```
Empresa   cnpj, razao_social, nome_fantasia, situacao, data_abertura,
          cnae_principal, cnaes_secundarios, endereco, cidade, uf, lat, lng, email
          evidence: dados abertos da Receita (estrutura pública)
          confidence: high

Socio     empresa_cnpj, nome, qualificacao, data_entrada
          evidence: QSA da Receita
          confidence: high

Telefone  empresa_cnpj, numero_e164, tipo (celular | fixo), fonte (receita | site | google | manual),
          visto_em, vezes_repetido_em_outros_cnpjs, nota_whatsapp (0-100), motivo
          evidence: S04 (hipótese), "contatos" na descrição da loja
          confidence: medium

Lead      empresa_cnpj, telefone_escolhido, status, observacao, criado_em, opt_out
          evidence: "funil de vendas" na descrição da loja
          confidence: medium
```

Relationships: Empresa 1-n Socio, Empresa 1-n Telefone, Empresa 1-1 Lead

### Como a nota de "WhatsApp provável" pode funcionar (versão própria, sem copiar ninguém)

Pontos a favor:
- é **celular** (11 dígitos com DDD e começa com 9): o sinal mais forte;
- aparece em mais de uma fonte (Receita **e** o site ou o Google da clínica);
- foi visto recentemente (cadastro ou alteração recente);
- o DDD bate com a cidade da empresa.

Pontos contra:
- o mesmo número aparece em muitos CNPJs: quase sempre é o **escritório de contabilidade**, não o médico;
- é telefone fixo (às vezes tem WhatsApp Business, mas a chance é menor);
- a empresa está baixada ou inapta.

**Não** entra no clone: "testar" o número no WhatsApp com ferramentas não oficiais
para saber se ele tem conta. Isso viola os termos do WhatsApp e leva a banimento
do número de quem faz.

## Feature matrix

See `features.csv`. Must: 7, should: 5, could: 3, skip: 3.

## Out of scope (cannot or should not be cloned)

- A base de dados e os leads da Villela: são dela. O clone usa só fontes públicas e próprias.
- O portal atrás do login: se você é franqueado, o contrato de franquia pode proibir usar o sistema para montar um concorrente. Vale ler antes.
- Verificação de WhatsApp por automação não oficial e disparo em massa: proibidos pelos termos do WhatsApp.
- O restante do app (cobranças, contratos, extratos, materiais de venda): fora do recorte pedido.

## LGPD (importante para este caso)

Telefone de médico, principalmente de médico PJ ou MEI, costuma ser o celular
pessoal, e isso é **dado pessoal**. Prospecção B2B com dados públicos pode se
apoiar no **legítimo interesse** (art. 7º, IX), desde que:
1. você registre o motivo por escrito (o "teste de legítimo interesse");
2. a primeira mensagem diga de onde veio o contato e ofereça "não quero mais receber";
3. quem pedir para sair saia na hora e não volte (campo `opt_out`);
4. você não guarde mais dados do que o necessário.

Isto não é parecer jurídico. Em caso de dúvida, consulte um advogado.

## Size

Screens 5, flows 3, entities 4. Hard parts: importar e atualizar a base da Receita
(vários GB por mês) ou ficar dentro dos limites de uma API, a nota de WhatsApp
(que é estimativa, não certeza) e a busca no mapa (geocodificar endereços).
Size: **M** (algumas semanas). Uma versão só de "colar CNPJ e ver os telefones
ordenados" (F01) é **S** (um fim de semana).
