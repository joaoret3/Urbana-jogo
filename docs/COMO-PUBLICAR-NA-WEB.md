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
- **Publique a pasta dos alunos** (`Urbana_v2.28_alunos`): ela já vem sem o editor, sem `originais/`
  e sem `copias_de_seguranca/`, e é bem mais leve. Se usar a pasta do professor, não publique
  essas pastas.

## Opção 1 — GitHub Pages (gratuito, endereço fixo)

1. Crie uma conta em github.com (pode ser a da escola).
2. Crie um **repositório** novo (ex.: `urbana`) e envie os arquivos da pasta do Urbana
   (botão "Add file → Upload files"; arraste o conteúdo da pasta, não a pasta de fora).
   Se o envio pelo navegador recusar arquivos grandes ou muitos de uma vez, envie em partes
   (por exemplo, primeiro `assets/mapa/alta`, depois o resto).
3. Em **Settings → Pages**, escolha a branch principal e a pasta `/ (root)` e salve.
4. Em alguns minutos aparece o endereço, no formato `https://SEU-USUARIO.github.io/urbana/`.

## Opção 2 — Netlify (arrastar e soltar)

1. Entre em netlify.com e crie uma conta.
2. Na área de sites, use a opção de **publicar arrastando uma pasta** e solte a pasta do Urbana.
3. O site recebe um endereço `https://ALGUM-NOME.netlify.app` (dá para mudar o nome nas configurações).

As regras e limites gratuitos desses serviços mudam com o tempo; confira na página deles.
Um site ou servidor da própria escola/prefeitura também serve: é só copiar a pasta para lá.

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
1. edite no computador, na pasta do Urbana, e salve;
2. envie de novo os arquivos alterados para o site (no GitHub: "Upload files" por cima;
   no Netlify: arraste a pasta de novo).
Os alunos veem a novidade ao recarregar a página. As partidas deles continuam valendo.
