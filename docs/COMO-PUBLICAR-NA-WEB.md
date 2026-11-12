# Como colocar o Urbana num endereço da web (para jogar no celular e no tablet)

Nos computadores da escola o jogo continua abrindo com dois cliques no `index.html`.
No **celular e no tablet** isso não funciona: Android e iPhone não abrem uma pasta de
arquivos de jogo. Para esses aparelhos, a pasta do Urbana precisa estar num **endereço da
web** (um site). O jogo não precisa de servidor especial: basta um serviço que hospede
**arquivos estáticos** (HTML, imagens, sons).

## Antes de publicar (importante)

- **Autorização:** publicado na internet, qualquer pessoa com o endereço vê o jogo, inclusive
  as fotos dos grafites, as artes e os nomes/apelidos dos estudantes nos créditos.
  Confirme que as autorizações de uso de imagem e de autoria cobrem a **publicação online**.
- **Fontes:** desde a v2.28 o jogo usa só fontes livres (Londrina Solid e Sedgwick Ave Display, licença SIL OFL 1.1),
  que podem ser publicadas. Detalhes e links em `assets/fontes/LEIA-ME-FONTES.txt`.
- **O que vai para a internet:** só a versão dos alunos (sem o editor, sem `originais/` e sem
  `copias_de_seguranca/`). Ela é gerada sozinha a cada Push, veja abaixo.

## Como o jogo é publicado (desde a v2.28)

O jogo dos alunos fica em **https://joaoret3.github.io/Urbana-jogo/** e é publicado **automaticamente**:
a cada **Push** no repositório Urbana (GitHub Desktop), o GitHub gera a versão dos alunos e envia para o
repositório público Urbana-jogo; o site se atualiza em 1 a 3 minutos. Não é preciso enviar arquivos à mão.
Passo a passo e solução de problemas: `COMO-TRABALHAR-COM-GITHUB.md` e `GUIA-GITHUB-PASSO-A-PASSO.md`.

Se o site parecer não ter mudado, é o navegador mostrando a cópia antiga: aperte Ctrl+F5 (ou abra numa
aba anônima).

## Como fica para os alunos

- O aluno abre o endereço no navegador do celular/tablet (Chrome no Android, Safari no iPhone).
  Dica: no menu do navegador, "Adicionar à tela inicial" cria um ícone como de aplicativo.
- O jogo funciona deitado ou em pé; deitado o mapa aparece maior.
- **As partidas ficam salvas em cada aparelho** (no navegador). Trocar de aparelho:
  Continuar → Exportar no antigo e Importar partida no novo. Uma partida feita no computador
  da escola (dois cliques) não aparece no site, e vice-versa: use Exportar/Importar.
- Pelo site o jogo usa o modo de desenho mais rápido (como o "Abrir Urbana (Windows).bat").

## Atualizar o conteúdo

O **Editor de conteúdo** funciona só no computador (Chrome ou Edge). Fluxo:
1. no GitHub Desktop, **Fetch/Pull origin** (baixa a versão mais nova);
2. edite no Editor de conteúdo e salve;
3. no GitHub Desktop, **Commit** e **Push origin**. A publicação é automática.
Os alunos veem a novidade ao recarregar a página. As partidas deles continuam valendo.
