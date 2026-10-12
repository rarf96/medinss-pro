# Guia rápido: skills de Instagram do MedINSS Pro

As "skills" são manuais de instrução que o Claude segue automaticamente quando
você pede algo de Instagram neste projeto. Você não precisa chamar nada pelo
nome: basta pedir em português, como pediria a um assistente de marketing.

## O que cada uma faz

| Skill | Em uma frase | Peça assim |
|---|---|---|
| `ig-caption-writer` | Escreve a legenda de um post ou Reel, com o gancho na primeira linha. | "Escreva uma legenda sobre médicos que pagam INSS acima do teto." |
| `ig-carousel-planner` | Monta um carrossel slide a slide (até 10). | "Faça um carrossel de 7 slides explicando o passo a passo da restituição." |
| `ig-content-planner` | Planeja a semana: que post sai em cada dia, em que formato e horário. | "Monte o calendário da próxima semana para o Instagram." |
| `ig-hashtag-strategist` | Escolhe 3 a 5 hashtags do tamanho certo para a conta. | "Quais hashtags usar neste post?" |
| `ig-humanizer` | Tira o "jeito de texto de robô" e revisa antes de publicar. | "Revise esta legenda antes de eu postar." |
| `ig-hook-extractor` | Explica por que um post que viralizou funcionou e adapta a fórmula. | "Por que este Reel deu certo? [link]" |
| `ig-repurposer` | Transforma um texto de outro lugar (LinkedIn, blog, vídeo) em post. | "Transforme este artigo em um carrossel." |
| `ig-profile-optimizer` | Revisa o perfil: foto, nome, bio, link, destaques. | "Revise a bio do nosso Instagram." |
| `ig-audience-insights` | Lê dados reais de hashtags e perfis (precisa da chave da Apify). | "O que está funcionando em #plantonista?" |

## O que foi ajustado para o MedINSS Pro

1. **Perfil de voz** (`.claude/references/voice-profile.md`): diz às skills
   quem é a marca, quem é o público (médicos com mais de um vínculo), os temas
   e o tom. Está como **rascunho**: faltam o @ do perfil, o link da bio, a cor
   da marca e 2-4 posts reais. Para completar, peça: "construa meu perfil de
   voz" e cole alguns posts.
2. **Regras de português** (`ig-humanizer/references/scrub-rules-pt-br.md`):
   lista de vícios de texto feito por IA em português ("no cenário atual",
   "potencializar", "vale ressaltar"...) e como corrigir.
3. **Regras de conformidade** (`.claude/references/compliance-medinss.md`):
   o que não pode sair num post (promessa de resultado, valor sem "estimativa",
   depoimento sem autorização, dado pessoal em print, logo do INSS/Receita,
   urgência falsa). A revisão final bloqueia o post se algo disso aparecer.
   Os pontos marcados "validar com jurídico" precisam do aval de vocês.

## Fluxo recomendado para cada post

1. Peça o rascunho (legenda ou carrossel).
2. Escolha uma das fórmulas de gancho que o Claude sugerir.
3. Peça "revise antes de publicar" (roda a auditoria com as regras acima).
4. Publique pelo app, anexando a imagem ou vídeo.
   (Publicação automática só depois de configurar a Publora; veja abaixo.)

## Configuração opcional

Tudo funciona sem configurar nada (modo rascunho). Para publicar e agendar
direto, crie um arquivo `.env` (nunca vai para o GitHub) a partir de
`.claude/instagram-skills.env.example` com:

- `PUBLORA_API_KEY` e `INSTAGRAM_PLATFORM_ID`: publicação automática
  (exige conta Business ou Creator no Instagram).
- `APIFY_TOKEN`: leitura de dados reais do nicho.
- `PIXFARO_TOKEN`: geração de imagens para carrosséis.

E rode `pip install -r .claude/instagram-skills-requirements.txt`.
