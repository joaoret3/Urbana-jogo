# Urbana — registro de versões

## 2.47 — 13/11/2026

- **Aviso "Moldura nova!" some ao escolher uma moldura:** no perfil, clicar em qualquer moldura apaga o aviso na hora (balão e pulso do retrato), sem esperar fechar o perfil. Ele também some se a moldura nova já estiver em uso.

## 2.46 — 13/11/2026

- **Só as duas molduras novas ficam no jogo:** "Grafiteiro Estelar" (moldura_latas) e "Orgulho do bairro" (moldura_cmj).
  As molduras antigas (Básica, Prata, Ouro, Orgulho do Bairro de cor, "Nova moldura") saíram de dados/molduras.js e dos
  níveis 1 a 3. As duas novas continuam sendo desbloqueadas no nível 4. A missão "Orgulho do Bairro" (missao_007) agora dá a moldura "Orgulho do bairro" (moldura_cmj).
- Partidas antigas: moldura que não existe mais é retirada da partida; se o jogador estava usando uma delas, o retrato volta ao círculo simples até ele escolher outra. Nada mais do progresso muda.

## 2.45 — 12/11/2026

Aviso de moldura nova (ideias M1 + M3 aprovadas pelo professor; no teste com os alunos eles não percebiam o desbloqueio):
- **Janela "Moldura nova!":** ao ganhar uma moldura (por nível ou por missão), assim que a tela fica livre o jogo abre
  uma janela com a moldura já no personagem do jogador, o motivo ("Você chegou ao nível 3!") e os botões
  **Usar agora** (troca na hora) e **Depois**. Várias molduras ganhas de uma vez aparecem uma depois da outra.
  Se o jogo fechar antes, a janela aparece na próxima vez que a partida abrir.
- **Retrato chamando:** enquanto houver moldura nova não vista, o retrato pulsa e mostra o balão
  "Moldura nova! Toque aqui para usar" (o balão também abre o perfil). Some quando o jogador usa a moldura ou
  abre e fecha o perfil.
- **Perfil:** a moldura nova vem marcada com "NOVA" e a lista de molduras é trazida para a tela.
- Partidas antigas não são afetadas: só molduras ganhas a partir de agora avisam (`molduras_novas` e `molduras_janela`
  na partida). A conta de teste não gera avisos.

## 2.44 — 12/11/2026

- **Pintar muro livre gasta latas:** aplicar ou trocar a arte de um muro custa 3 latas (`custo_pintar_muro` em
  dados/jogo.js; no editor: "Níveis, preços e recompensas" > Recompensas > "Pintar um muro livre: custo em latas"; 0 = grátis).
  A tela "Pintar muro" mostra o custo e o saldo; se faltarem latas, o botão fica desligado e aparece
  "Faltam N: pegue mais latas pelo bairro!". O botão passa a dizer "Aplicar arte (3 latas)" e o aviso de muro pintado
  mostra "−3 latas". Muros já pintados continuam como estão.

## 2.43 — 12/11/2026

- **Moldura emblema (estilo enviado pelo professor):** a arte da moldura fica ATRÁS do personagem, que aparece dentro do
  círculo da arte com a cabeça saindo por cima dele (campos novos `fundo` e `encaixe` em dados/molduras.js). Na barra do
  jogador o emblema toma o lugar do anel de XP e o XP vai para uma barrinha dentro do selo do nível. Aparece também no
  perfil (retrato grande e miniaturas) e na lista de partidas. Funciona com qualquer personagem, porque os retratos já
  têm fundo transparente.
- **Duas molduras novas** com as artes do professor: `moldura_latas` ("Latas e Estrelas") e `moldura_cmj` ("CMJ").
  Ainda não são liberadas por nenhum nível nem missão. Os SVGs originais ficam em originais/molduras/.
- **Editor:** em "Níveis, preços e recompensas" > Molduras, botão "Emblema (arte atrás do personagem)" (aceita PNG, WebP
  e SVG; SVG é ampliado sem perder qualidade) e 4 controles com prévia ao vivo: centro (esquerda/direita), centro
  (cima/baixo), tamanho do círculo (com um círculo tracejado para encaixar) e tamanho do personagem. "Tirar emblema"
  volta ao normal.

## 2.42 — 12/11/2026

Tela preta no tablet da escola — causas encontradas e otimizações:
- **Compatibilidade com navegadores antigos:** as versões 2.37 e 2.40 usaram um recurso novo de JavaScript (`??`) que
  navegadores anteriores a 2020 não entendem; num tablet com Chrome desatualizado o jogo não iniciava (tela preta).
  Trocado por código antigo equivalente. O jogo volta a funcionar no Chrome 64 (2018) em diante; a publicação passa a
  barrar esse recurso. Os estilos que usavam `inset` (Chrome 87+) agora usam top/right/bottom/left.
- **Aviso em vez de tela preta:** se o jogo não conseguir abrir (erro, falta de memória de vídeo ou mais de 45 s sem o
  menu aparecer), aparece uma tela com o motivo, o navegador e a memória do aparelho, com o botão "Tentar de novo".
- **WebGL:** se a placa de vídeo falhar ao iniciar, o jogo tenta de novo pelo modo canvas.
- **Tablets e celulares usam a qualidade Leve automaticamente** (quem quiser escolhe Alta em Configurações) e guardam
  menos peças do mapa na memória. Num tablet emulado (Galaxy Tab S4): imagens na memória 67 → 41 MB (peças do mapa
  34 → 8 MB), download até jogar 9,0 → 8,4 MB.
- Observação: entre 11h14 e 11h21 de 12/11 o site estava com `dados/jogo.js` quebrado (conflito do commit "v22",
  corrigido na 2.41); um teste nesse intervalo também daria tela preta.

## 2.41 — 12/11/2026

- **Correção urgente:** o commit "v22" enviou `dados/jogo.js` com marcas de conflito do GitHub Desktop
  (`<<<<<<<`, `=======`, `>>>>>>>`), o que deixa o arquivo inválido. Conflito resolvido mantendo a escolha do professor
  (latas que voltam: 50%) e o bloco do anoitecer.
- **Trava na publicação:** a publicação automática agora para (sem mexer no site) se algum arquivo tiver marcas de conflito ou
  se algum dados/*.js, src/*.js ou assets/mapa/*.js tiver erro de escrita. A mensagem aparece na aba Actions.
- **Ciclo de dia e noite:** depois da noite, amanhece aos poucos e o ciclo recomeça (padrão: 5 min de dia, 1 min
  escurecendo, 3 min de noite, 1 min clareando = ciclo de 10 min). No editor: "Minutos de noite" e "Repetir o ciclo"
  (sem repetir, fica de noite como na 2.40).

## 2.40 — 12/11/2026

- **Anoitecer durante o jogo (luz L3 escolhida pelo professor):** a partida começa de dia; depois de 5 minutos jogando
  o bairro escurece aos poucos (1 minuto) até o crepúsculo, com céu arroxeado, bordas mais escuras, um resto de laranja
  no alto e os postes acesos (brilho na luminária, na ponta do braço do poste). Ao abrir o mapa de novo, começa de dia.
  O tempo só conta com o jogo aberto e na tela.
- A luz é uma camada por cima do bairro (src/sistemas/Luz.js): o mapa original não muda; HUD, fichas e quizzes não
  escurecem. Acompanha o zoom e o tamanho da tela.
- **Editor:** "Níveis, preços e recompensas" > Anoitecer: ligar/desligar para todos, minutos até anoitecer e minutos
  da transição (dados/jogo.js → "anoitecer").
- **Configurações:** "Anoitecer durante o jogo" (cada computador pode desligar; vale na hora).

## 2.39 — 12/11/2026

Limpeza (nada que o jogo usa foi removido; ids, mapa, partidas, originais/ e cópias de segurança intactos):
- **Arquivos sem uso tirados de assets/** (vão menos arquivos para o site): `exemplo_grafite_001` a `003.jpg` (grafites de
  exemplo que não existem mais), retrato e folha de sprites do `avatar_04` (personagem excluído no editor) e
  `grafite_040.jpg`, que tinha ficado sobrando. Tudo continua no histórico do GitHub e os originais seguem em `originais/`.
- **grafite_040:** o recorte que o professor fez (gravado em .jpg por um editor antigo, em cache) passou a ser a foto usada,
  convertida para WebP; antes o jogo ainda mostrava a foto inteira.
- **Estilos da barra antiga do jogador** (antes do anel de XP), do link antigo do editor no menu, da legenda "muro livre" e
  uma dica da conferência que não aparecia mais: removidos do urbana.css (cerca de 2 KB).
- **Código sem uso:** `Interface.fecharTodos`, `EditorMissoes.nomeTipo` e a cor dos muros no mini-mapa.
- **Textos atualizados:** LEIA-ME.txt e docs/COMO-PUBLICAR-NA-WEB.md ainda falavam das duas pastas em .zip e do envio
  manual; agora descrevem o GitHub e a publicação automática.

## 2.38 — 12/11/2026

- **Versão do conteúdo editável:** no editor, em "Níveis, preços e recompensas" > Recompensas, novo campo "Versão do conteúdo
  (rodapé do menu)" (`versao_conteudo` em dados/jogo.js). Quando o conteúdo estiver pronto, troque "0.1-EXEMPLO" por "1.0",
  por exemplo. Deixando o campo vazio, o rodapé do menu mostra só "Urbana v2.38", sem a parte do conteúdo.

## 2.37 — 12/11/2026

- **Latas voltam ao abrir a partida:** ao abrir uma partida (Continuar ou Jogar na lista de partidas), uma parte sorteada
  das latas já coletadas volta ao mapa: no mínimo 60% (a quantidade exata é sorteada entre 60% e 100%, de novo a cada
  abertura). Dentro da mesma sessão, uma lata coletada só volta na próxima vez que a partida for aberta.
- **Ajustável no editor:** em "Níveis, preços e recompensas" > Recompensas, campo "Latas que voltam ao abrir a partida
  (mínimo, em %)" (`latas_renascem_percentual` em dados/jogo.js; 100 = todas voltam; 0 = só as sorteadas podem não voltar).
- **Progresso preservado:** `itens_coletados` continua só crescendo e é o que as missões de "coletar latas" contam
  (latas diferentes), então nenhuma missão perde progresso. A lista nova `latas_vazias` guarda as que estão sem lata agora.
  Partidas antigas e partidas importadas são migradas sozinhas (tudo o que já foi coletado entra como "vazia" e passa pelo sorteio).
  Cada lata que volta paga de novo a recompensa de lata coletada.

## 2.36 — 12/11/2026

- **Molduras vazadas (solução B escolhida pelo professor):** cada moldura pode ter uma imagem PNG transparente com
  enfeites em volta do retrato (campo opcional `imagem` em dados/molduras.js). Ela fica por cima do retrato com 150% do
  tamanho do anel de XP, sem esconder o anel nem o selo do nível. Aparece na barra do jogador, no perfil (retrato grande e
  miniaturas da lista de molduras) e na lista de partidas. Na barra, o perfil ganha uma margem para os enfeites não saírem
  da tela, e o mini-mapa desce junto.
- **Editor:** em "Níveis, preços e recompensas" > Molduras, botão "Imagem vazada (PNG transparente)" com prévia igual à do
  jogo (anel, retrato, moldura e selo) e "Tirar imagem". A imagem é reduzida para 600 px e salva em assets/molduras/.
- **Gabarito** para desenhar (1200 × 1200 px) e uma moldura de exemplo em `originais/molduras/` (só na pasta do professor).
- **Avisos de conquista** (missão concluída, muro pintado, nível, descoberta) translúcidos, com fundo desfocado,
  borda mais fina e menores (cerca de 290 × 60 px no computador e 240 × 50 px no celular).
- **Correção:** no perfil e na lista de partidas a cor da moldura não aparecia (o contorno ficava sempre verde);
  agora aparece a cor da moldura escolhida.

## 2.35 — 12/11/2026

- **Nova barra do jogador ("anel de XP", modelo B2 escolhido pelo professor):** o XP do nível virou um anel verde em volta
  do retrato e o nível aparece num selo amarelo ("NV 2"). Bem menor que a barra antiga, sobretudo no celular.
  Apelido e XP exatos aparecem ao passar o mouse e ao tocar no retrato (abre o perfil, como antes); leitores de tela
  continuam recebendo apelido, nível e quanto falta para o próximo nível.
- **Fonte Bungee** (SIL OFL 1.1, © The Bungee Project Authors) no selo de nível, no lugar da Sedgwick Ave Display, que era
  difícil de ler pequena. Os títulos das janelas continuam com a Sedgwick Ave Display. Arquivo e licença em
  `assets/fontes/` (Bungee-Regular.ttf, OFL-Bungee.txt); créditos atualizados.

## 2.34 — 12/11/2026

- **Mini-mapa afastado da barra do jogador:** a posição do mini-mapa (e do botão "Mapa" quando ele está escondido) agora é
  calculada pela altura real da barra do jogador, sempre com 12 px de espaço. Antes era fixa e no celular os dois encostavam.
- **Mini-mapa sem os muros livres:** ficam só os grafites visitados, os quizzes concluídos, o jogador e a escola
  (a legenda do mapa ampliado também perdeu o item "Muro livre"). Os muros continuam no jogo, só não aparecem no mini-mapa.

## 2.33 — 12/11/2026

- **Fotos dos grafites em WebP:** as 37 fotos (grafite_004 a 040) passaram de JPEG para WebP, reduzidas para 1280 px:
  de cerca de 21 MB para 9,5 MB na pasta `assets/grafites/`. Ids dos grafites e quizzes não mudaram; só o caminho da imagem
  (`.jpg` → `.webp`). As fotos grandes continuam em `originais/grafites/` (JPEG, só na pasta do professor).
- **Editor:** fotos novas de grafite e recortes agora são salvos em WebP (1280 px).

## 2.32 — 11/11/2026

- **37 grafites do bairro** (fotos enviadas pelo professor) cadastrados como rascunho: grafite_004 a grafite_040, cada um com
  um quiz de EXEMPLO (quiz_004 a quiz_040). Título, texto, artista, crédito e perguntas são de exemplo; a data é a da foto;
  a descrição cita o nome do arquivo original (IMG_xxxx). Fotos giradas na posição certa, reduzidas para 1600 px e sem
  localização GPS. Fotos grandes (2400 px) guardadas em `originais/grafites/` (só na pasta do professor).
- **Recortar foto (editor):** na ficha do grafite, botão "Recortar foto": arrastar o quadro, mudar pelos cantos, proporção
  (livre, 4:3, 3:2, 16:9, quadrado, em pé), girar 90° e "foto inteira". Sempre recorta a partir da foto original inteira.

## 2.31 — 10/11/2026

- **Folhas de sprites maiores (ex.: 192×192 por quadro):** o personagem fica do mesmo tamanho no mapa que os de 96 px, só com
  mais detalhe. Vale para personagens jogáveis, personagens do bairro e o desenho no editor. A área dos pés (colisão) também não muda.

## 2.30 — 09/11/2026

- **Aviso "Vire o aparelho":** desenho refeito; agora o celular gira inteiro ao lado de uma seta fixa (no iPhone a seta girava fora do lugar).
- **Janelas no celular deitado:** não passam mais da borda da tela no Safari do iPhone; topo, corpo e rodapé mais compactos (botões cabem).
- **HUD menor no celular deitado:** perfil, latas, Black Book, Menu, missões, mini-mapa, joystick e botão A cerca de 30% menores.

## 2.29 — 09/11/2026

- **Personagens do bairro com missões (quests):** personagens parados pelo mapa que dão missões especiais. De longe aparece
  um sinal em cima da cabeça ("!" missão nova, "…" em andamento); de perto abre um balão de fala e o botão A vira
  "Conversar com <nome>". A conversa mostra a fala, o retrato e a missão com progresso e recompensa.
- A missão de um personagem fica **trancada** até o jogador conversar com ele, e só conta o que for feito **depois** da conversa
  (se o jogo não tiver mais conteúdo suficiente, conta o necessário para continuar possível). Na tela de Missões aparece
  "Encontre <nome> pelo bairro".
- Primeira personagem: **Alexandra** (folha de sprites enviada pelo professor), perto da escola, com uma missão de EXEMPLO
  (pintar 2 muros livres). Textos e missão marcados como EXEMPLO para o professor trocar.
- Novo arquivo `dados/npcs.js` e nova camada `npcs` no mapa. A partida guarda os personagens encontrados (partidas antigas continuam funcionando).
- **Editor:** nova aba "Personagens do bairro" (nome, falas, retrato, folha de sprites com prévia, missões do personagem);
  em Missões, o campo "Personagem que dá a missão"; no Mapa, "Colocar personagem" (mover, apagar, conferir alcance).
- O personagem não pode ser atravessado (como o jogador, só os pés bloqueiam).

## 2.28 — 09/11/2026

- **Veículos novos:** os 10 modelos antigos foram removidos e entraram os 10 desenhos novos (SVG enviados pelo professor):
  SUV azul, sedã vermelho, van amarela, picape cinza, van verde, caminhão-baú roxo, basculante laranja, tanque vermelho,
  carroceria verde e SUV branco. Cada modelo tem 5 vistas (frente, costas, lado e duas diagonais) em
  `assets/carros/carro_NN_<vista>.webp`; os SVG originais ficam em `originais/carros_svg/`.
- **Direção:** cada veículo aponta para uma de 8 direções (cima, baixo, esquerda, direita e as 4 diagonais); as que viram
  para a esquerda são o desenho espelhado. O campo antigo de giro/espelhar foi trocado por **Direção** (botões 3x3),
  **Girar 45°** e **Inverter sentido** no painel do veículo (Editor > Mapa).
- **Mapa:** os 64 veículos que já estavam no mapa (nas suas posições) foram trocados pelos novos, cada tipo pelo
  equivalente (ex.: caminhão-baú vira o baú roxo; o hatch laranja virou SUV azul ou branco) e viraram para o sentido da rua
  (mão direita, calculado pelo desenho da via). Confira e ajuste no editor.
- **Colisão:** a área bloqueada agora segue a direção do veículo (pegada no chão + altura do baú/cabine).
- **Licenças das fontes:** os `OFL.txt` da Londrina Solid e da Sedgwick Ave Display (enviados pelo professor) entraram em
  `assets/fontes/`. A cópia embutida da Londrina Solid ganhou o nome interno "Urbana Texto" (nome reservado pela licença).
- Mantido o sistema manual: "Novo carro", escolher modelo/tamanho/direção, arrastar, Duplicar e Apagar.
- O **tamanho** agora é o comprimento do veículo visto de lado (130 carros, 180 caminhões); as outras vistas usam a mesma escala.

## 2.27 — 06/11/2026

- **Fontes livres (podem ser publicadas):** os textos agora usam a **Londrina Solid** e os títulos a **Sedgwick Ave Display**
  (ambas SIL OFL 1.1), embutidas em `estilo/fontes.css`. Highsens, Aerosoldier Drip e Grime Slime saíram do jogo
  (arquivos guardados em `originais/nao_usados/fontes_antigas/`, só na pasta do professor).
- **Letras minúsculas:** os textos em Londrina Solid não são mais forçados para CAIXA ALTA (subtítulos da ficha,
  configurações e créditos). Os títulos grandes continuam em caixa alta.
- **Caminhões:** a colisão agora cobre também o baú/caçamba (base própria de cada caminhão, mais larga, alta e
  deslocada para cima); o personagem não atravessa mais o baú do caminhão roxo. O retângulo vermelho do editor mostra a nova área.
- **Lata de spray:** nova arte (vetor enviado pelo professor) no mapa e no editor. Original em `originais/ui/`.

## 2.26 — 06/11/2026

- **Girar veículos:** no painel do carro (Editor > Mapa) há o campo **Giro** (barra, número, botões 15° para cada
  lado, 90° e Zerar), igual ao dos muros e faixas. O carro gira em torno da base e a área bloqueada gira junto.
  No jogo a base girada vira uma fileira de quadradinhos (a física só entende retângulos retos), então
  o bloqueio acompanha o desenho. Atenção: o desenho é isométrico, então giros grandes ficam estranhos.

## 2.25 — 06/11/2026

- Feita sobre a pasta enviada pelo professor (v2.24): os avatares 05 e 06, as latas movidas no mapa e as
  cópias de segurança de 06/11 foram mantidos.
- **50 veículos espalhados pelo bairro** (30 carros e 20 caminhões, todos os 10 modelos), na camada "carros"
  do mapa: sempre sobre o asfalto, junto à calçada, virados para um dos dois lados ao acaso. Ficam longe da
  escola (início), dos pins, das latas, dos muros livres e das faixas de pedestre, e foi conferido que
  nenhum lugar do mapa ficou sem passagem. Dá para mover, trocar, apagar ou acrescentar pelo Editor > Mapa.
- **Tamanho padrão:** carros 130 e caminhões 180 (antes 300 e 380); o editor aceita de 60 a 900.

## 2.24 — 06/11/2026

- **23 artes novas no Black Book como rascunho** (`arte_020` a `arte_042`), enviadas pelo professor em Artes.zip.
  Cada uma entrou com título provisório "Arte 0NN (preencher)", sem autoria, sem autorização e com
  status "rascunho": **ainda não aparecem no jogo**. Para liberar, abra Editor > Black Book, preencha
  título, autoria, categoria (preço e nível), marque a autorização e mude a situação para "Publicado".
- As imagens foram preparadas: fundo branco removido (ficam transparentes, como as outras artes),
  recorte do espaço vazio, redução para 1000 px e WebP. As 12 artes com a palavra deitada foram giradas
  para a letra ficar em pé e legível (uma delas girou para o outro lado); a flor e o sorvete já estavam em pé.
- Os originais (como chegaram) estão em `originais/artes/arte_020.png` a `arte_042.png` (só na pasta do professor).

## 2.23 — 06/11/2026

- **5 caminhões** na ferramenta Novo carro (Editor > Mapa): baú azul, basculante laranja, tanque vermelho,
  carroceria verde e baú roxo (`assets/carros/carro_06` a `carro_10`). Os caminhões entram com largura
  padrão 380 (carros: 300); ao trocar de modelo no painel, o tamanho padrão acompanha, a menos que você
  tenha ajustado o tamanho à mão.

## 2.22 — 06/11/2026

- **Carros estacionados:** 5 modelos desenhados pela escola (van amarela, utilitário verde, picape azul,
  sedã vermelho, hatch laranja), em `assets/carros/`. No Editor > Mapa há a ferramenta **Novo carro**:
  clique na rua, escolha o modelo, ajuste o tamanho, espelhe (vira para o outro lado) e duplique.
  No jogo o carro bloqueia a passagem só na base (retângulo tracejado no editor); o jogador passa por trás.
- Os carros ficam na camada "carros" do mapa (sistemas/Carros.js). A versão não traz nenhum carro
  colocado: o mapa continua como estava.
- Para acrescentar modelos: salve o PNG/WebP (fundo transparente, ~800 px de largura) em `assets/carros/`
  e acrescente uma linha em `MODELOS` no `Carros.js`.

## 2.21 — 04/11/2026

- **Transições suaves:** a história em quadrinhos entra com fade (imagem sobe e aparece, depois o botão) e
  sai com fade antes do avatar, que também aparece suavemente. Respeita "reduzir movimento" do aparelho.
- O botão do Novo Jogo agora se chama **Começar** (antes "Escolher avatar", mas ele leva à história).
- **Black Book:** desbloqueadas primeiro (ordem do cadastro); as bloqueadas ficam do mais "barato" ao mais
  "caro": menor nível primeiro e, no mesmo nível, menor preço em latas.
- **Conta de teste:** em Novo Jogo, o apelido **TESTE** cria uma partida no nível máximo com 9999 latas e
  tudo o que os níveis liberam. Só funciona na pasta do professor (`CONTA_TESTE: true` em `src/config.js`);
  o pacote dos alunos vem com `CONTA_TESTE: false`.

## 2.20 — 04/11/2026

- **História de abertura:** a história em quadrinhos (`assets/ui/historia_intro.webp`) aparece toda vez
  que o jogador começa um Novo Jogo, depois de escolher o apelido e antes do avatar (botão Continuar,
  ou Enter/Esc). Quem usa "Continuar" numa partida salva não vê a história de novo. Para trocar a imagem,
  substitua o arquivo mantendo o nome (`src/telas/TelaHistoria.js`).
- **Fontes:** a fonte de símbolos "Aerosoldier Drip Symbol" (uso pessoal) saiu do jogo; seta de jogar,
  voltar, estrela e refazer agora são ícones SVG. As fontes Highsens e Aerosoldier Drip ainda estão no
  jogo e serão trocadas por fontes de licença livre (OFL) assim que os arquivos forem fornecidos.

## 2.19 — 04/11/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2.18): as 10 artes novas (arte_010 a
  arte_019), os ajustes de nome e autoria e as cópias de segurança foram mantidos.
- **Sem emojis:** todos os emojis e símbolos de texto (✓, ✕, ★, ▶, 🔒, 📍, 🗑, etc.) foram trocados por ícones
  desenhados em SVG (`src/sistemas/Icones.js`), iguais em qualquer aparelho. O jogo e o editor usam os mesmos.
  Os desenhos em estilo grafite da fonte Aerosoldier Drip Symbol (seta de jogar, voltar, estrela, refazer)
  continuam no jogo. No tutorial, o campo "Ícone" do editor virou uma lista de ícones.
- **Black Book com ícone de caderno de desenhos** (HUD, menu, aba do editor, tutorial).
- **Celular e tablet sempre deitados:**
  - com a tela em pé aparece o aviso "Vire o aparelho", que some sozinho ao girar;
  - no primeiro toque o jogo tenta tela cheia e travar a tela deitada (funciona no Chrome do Android;
    no iPhone vale o aviso).
- **Menos rolagem no celular deitado:** título e botões das janelas mais finos (só o X para fechar);
  ficha com foto ao lado do texto; quiz, missões, Pausa, tutorial e configurações em 2 colunas;
  Black Book com cartões menores e arte ampliada ao lado dos dados; Pintar muro com a prévia ao lado
  da lista de artes; aviso de recompensa no canto de baixo. Pausa, tutorial, quiz, ficha e Pintar muro
  agora cabem na tela sem rolar; listas longas (Black Book, Missões) ainda rolam.
- **Correção:** o detalhe de uma arte no Black Book mostrava a palavra "null" abaixo dos dados.

## 2.18 — 03/11/2026

- **Editor: imagens trocadas não ficam mais sobrando.** Quando a imagem nova é gravada com outro
  nome (por exemplo, `arte_001.png` trocada por `arte_001.webp`), ao salvar a antiga sai de
  `assets/` e vai para a cópia de segurança daquela gravação. Se outro item ainda usar a mesma
  imagem, ela fica onde está. Vale para artes, retratos, folhas de sprites e fotos dos grafites.
- Editor: os ícones do mapa do editor ficam numa lista única (mais fácil de manter).
- Nota do retrato no editor explica que a imagem é gravada em WebP.

## 2.17 — 03/11/2026

- **Parede invisível na rua da escola corrigida:** a colisão bloqueava a metade da rua do lado
  da escola e a calçada da escola, então o personagem parava no meio da rua. Agora dá para
  atravessar a rua inteira e andar pela calçada da escola. Só a colisão desse trecho mudou
  (205 quadradinhos de 32 px liberados); a imagem do mapa não foi alterada.

## 2.16 — 03/11/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2_15): conteúdo, mapa e cópias de
  segurança mantidos.
- **Jogo mais leve:**
  - peças do mapa (alta e leve) em WebP, com aparência equivalente e cerca de metade do tamanho;
  - artes do Black Book reduzidas para no máximo 1000 px e gravadas em WebP;
  - logo, retratos dos personagens e imagens dos muros em WebP;
  - o editor passa a gravar artes e retratos novos em WebP automaticamente
    (as folhas de sprites continuam em PNG);
  - o jogo carrega menos peças do mapa ao redor do jogador ao mesmo tempo;
  - em aparelhos com pouca memória, o mapa "leve" é usado por padrão
    (dá para trocar em Configurações).
- **Originais guardados, não apagados:** mapa em JPG, artes e retratos em PNG, fontes originais,
  materiais de exemplo e a imagem de conferência de colisão foram movidos para `originais/`.
- **Duas pastas:** `Urbana_v2.16_professor` (completa, com editor) e `Urbana_v2.16_alunos`
  (só o jogo).
- Ids de grafites, artes, personagens, muros e missões não mudaram; o progresso salvo continua valendo.

## 2.15 — 30/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2.14 (2)): mantidas as artes novas e
  alteradas, as mudanças no mapa e as cópias de segurança.
- **Movimentação mais suave:**
  - a caminhada usa os 6 passos que as folhas de Luana, Sol, Cauã e Lucas têm (antes só 4,
    o que cortava o passo pela metade) e toca a 11 quadros por segundo;
  - o personagem acelera e freia em menos de um décimo de segundo, em vez de arrancar e parar seco
    (ajustável em `src/config.js`: ACELERACAO e FRENAGEM);
  - a animação acompanha a velocidade (joystick perto do centro = passos mais lentos);
  - na diagonal, o personagem não fica mais trocando entre "de lado" e "de frente".

## 2.14 — 30/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2.13): mantidas as faixas editadas no
  editor (36), a lata nova (9 no total) e as cópias de segurança.
- **Celular em pé:** topo do HUD mais compacto (perfil, latas, Black Book e Menu não se
  encostam mais), mini-mapa, joystick e botão A um pouco menores; Black Book em 2 colunas.
- **Celular deitado:** janelas usam a tela inteira; foto da ficha menor, sobrando espaço
  para o texto; Black Book sem o texto de explicação e com mais artes por linha.
- **Avisos de recompensa** aparecem embaixo, no meio, quando uma janela está aberta
  (não cobrem mais o título da ficha nem do Black Book).
- Novo guia: `docs/COMO-PUBLICAR-NA-WEB.md` (como colocar o jogo num endereço da web
  para jogar no celular e no tablet).

## 2.13 — 30/10/2026

- **Faixas de pedestre editáveis no editor** (aba Mapa → "Nova faixa de pedestre"): colocar,
  arrastar, girar (com botões de 15° e 90°), mudar o comprimento e o tamanho das listras,
  duplicar e apagar. A lista "Faixas de pedestre" no painel leva até cada uma.
- As faixas deixaram de fazer parte do desenho do mapa: agora o jogo as desenha a partir da
  nova camada `faixas_pedestre` do `mapa.json` (as 34 faixas da 2.12 viraram faixa_001…faixa_034,
  nos mesmos lugares).

## 2.12 — 30/10/2026

- **Faixas de pedestre corrigidas:** as 10 faixas apontadas pelo professor (tortas ou em cima
  da calçada) foram refeitas a partir do centro da rua, perpendiculares a ela e de meio-fio a meio-fio.
- **Rotatórias menores e centralizadas** no meio dos cruzamentos (não encostam mais na calçada).

## 2.11 — 30/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2.10): mantida a arte "Nana TAG",
  as novas imagens de lata e muros e as cópias de segurança.
- **Faixas de pedestre** brancas nos 34 lugares marcados em amarelo nos prints do professor
  (a linha do meio é interrompida na faixa).
- **Mini-rotatórias** pontilhadas brancas nos 2 cruzamentos marcados em verde.
- **Calçadas corrigidas** nos 2 pontos marcados em vermelho (perto de x 8190, y 8780 e de x 1190, y 9165).

## 2.10 — 29/10/2026

- **Correção:** sombras "soltas" no meio da rua (manchas sem nada que as fizesse). Partes do
  asfalto eram confundidas com casas e projetavam sombra. Agora a rua é reconhecida com mais
  cuidado (incluindo o asfalto com brilho amarelo perto da escola) e, no asfalto, a sombra vai
  sumindo a partir do meio-fio. Conferido no mapa inteiro: nenhuma sombra forte no meio da rua.

## 2.9 — 29/10/2026

- **Linhas na rua** (opção A escolhida pelo professor): linha branca tracejada no meio de
  todas as ruas, seguindo as curvas, com a tinta um pouco gasta. Sem linha nos cruzamentos.
  A luz e as sombras ficam por cima das linhas.

## 2.8 — 29/10/2026

- **Luz e sombra melhores** (sol de fim de tarde, do alto à esquerda): sombras das casas mais
  longas, mais fortes junto da parede e clareando com a distância, levemente azuladas;
  sombra de contato junto das paredes e do meio-fio; copas das árvores com volume;
  bordas viradas para o sol com brilho quente; áreas iluminadas um pouco mais quentes;
  poça de luz suave embaixo de cada luminária.
- **Um pouco mais de postes:** de 83 para 121 (em média 4 por rua, ~620 px entre eles). Sem fiação.

## 2.7 — 29/10/2026

- **Mapa:** completada outra esquina de calçada cortada, no lado esquerdo do mapa (perto de x 820, y 2200).
- **Menos postes:** de 583 para 83 (em média 3 por rua, no mínimo ~800 px entre um e outro).
- **Sem fiação:** os fios foram retirados. As sombras dos postes retirados também saíram.

## 2.6 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v2.5 (2)): mantidas as artes novas
  (AbreLata Sticker, Big, Mts e Lala TAG), a nova lata, as novas imagens dos muros e as cópias.
- **Mapa:** completada a esquina da calçada que estava "cortada" (perto de x 3770, y 6370).
- **Sombras naturais** desenhadas no mapa (sol vindo do alto à esquerda): casas, muros e
  árvores fazem sombra na calçada e na rua; cada poste tem sua sombra comprida.
  Sombra suave também nos pés do personagem.
- **Postes, luminárias e fiação:** 583 postes com braço de luz nas calçadas e fios seguindo
  as ruas (`assets/mapa/detalhes.js`, gerado a partir do desenho; `src/sistemas/Detalhes.js`).
  Ficam por cima do personagem e não bloqueiam a passagem. Longe de pins, latas, muros e da escola.
- **Personagem maior:** escala 1,35 → 1,55 (colisão dos pés igual).
- O mapa da 2.5 (sem sombras) fica no Urbana_v2.5.zip, como cópia de segurança.

## 2.5 — 29/10/2026

- **Mapa mais nítido:** o desenho do mapa foi ampliado com IA pelo professor (Upscayl,
  modelo Digital Art, 4×, a partir do mapa reduzido a 1/4) e recortado de novo nas mesmas
  30 peças (alta e leve), no mesmo tamanho (9392 × 10712). A colisão, os pins, as latas e
  os muros continuam nos mesmos lugares (conferido: diferença de posição menor que 1 pixel).
  O mini-mapa também foi refeito. O mapa anterior está na versão 2.4 (guarde aquele ZIP).

## 2.4 — 29/10/2026

- **Personagem um pouco maior:** escala 1,15 → 1,35 (cerca de 50% maior que até a v2.2).
  A área de colisão dos pés continua do mesmo tamanho.

## 2.3 — 29/10/2026

- **Personagem maior no mapa:** cerca de 28% maior (escala 0,9 → 1,15, em `src/config.js`).
  A área de colisão dos pés continua do mesmo tamanho, para ele não travar em passagens estreitas.

## 2.2 — 29/10/2026

- **Correção:** palavras com acento apareciam com um espaço sobrando em volta da letra
  acentuada (visto no Windows). As letras acentuadas da Highsens tinham a largura gravada
  errada dentro do arquivo da fonte; corrigido em `assets/fontes/HIGHSENS-com-acentos.otf`.

## 2.1 — 29/10/2026

- **Volta da Highsens com acentos** (a pedido do professor): os textos voltam a usar a cópia
  da Highsens com os acentos montados com os sinais da própria fonte
  (`assets/fontes/HIGHSENS-com-acentos.otf`), como na 1.9. A DejaVu saiu.
- Mantidos da 2.0: muros com a arte sempre em pé e menu dos alunos sem o link do editor.

## 2.0 — 29/10/2026

- **Fonte Highsens sem modificação** (direitos autorais): a cópia com acentos montados foi
  retirada. A Highsens original mostra as letras sem acento, números e pontuação; as letras
  acentuadas (á, ã, ç, é...), o travessão e as reticências aparecem na **DejaVu Sans Condensed
  Bold** (licença livre), também sem modificação. Os textos do jogo ficam todos em maiúsculas.
- **Muros com a arte sempre em pé:** se o giro do muro passar de 90° para qualquer lado,
  a arte (e a placa "Muro livre") é virada 180° dentro do mesmo retângulo, para não ficar de
  cabeça para baixo. O muro continua no mesmo lugar. O editor mostra do mesmo jeito.
- **Menu dos alunos sem o link do Editor de conteúdo.** O editor continua abrindo com dois
  cliques no `editor.html`.

## 1.9 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v1.8): mantidas as artes atuais
  (Samy, Joao, Urbana, Mts e 666 TAG) e as cópias de segurança.
- **Aba de Missões** com a mesma largura do bloco de cima (do início das latas até o fim do Menu).
- **Fonte dos textos:** a Grime Slime foi trocada pela **Highsens**. A Highsens enviada não
  tinha os acentos (á, ã, ç, é...) nem travessão e reticências; eles foram montados com os
  sinais da própria fonte (`assets/fontes/HIGHSENS-com-acentos.otf`). O arquivo original
  ficou guardado sem mudança. Títulos continuam na Aerosoldier Drip.

## 1.8 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v1.7_2): mantidos os personagens Luana,
  Sol, Cauã e Lucas e as cópias de segurança.
- **Personagens em ordem:** na escolha de personagem e no Perfil, os disponíveis aparecem
  primeiro e os bloqueados depois; em cada grupo, na sequência de níveis (1, 2, 3...).
  A ordem é automática: não é preciso mudar nada no editor.

## 1.7 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v1.6_2): mantidos os personagens
  Cauã e Lucas, as mudanças de níveis e molduras, as novas posições no mapa e as cópias de segurança.
- **Aba de Missões** no HUD, logo abaixo das latas, do Black Book e do Menu: mostra quantas
  missões já foram concluídas (ex.: 1/5) e abre a tela de Missões com um clique (ou tecla M).
- Os avisos de recompensa aparecem um pouco mais abaixo, para não cobrir a aba.

## 1.6 — 29/10/2026

- **Fontes de grafite:** todos os textos do jogo usam a **Grime Slime**; os títulos usam a
  **Aerosoldier Drip**; as setas e a estrela dos botões (Novo Jogo, Continuar, Voltar,
  Créditos, avisos de recompensa) usam desenhos da **Aerosoldier Drip Symbol**.
  Os números aparecem sempre na Grime Slime (os da Aerosoldier de uso pessoal são marca d'água).
  Os outros ícones (✓, ✕, ♪, ✎...) continuam iguais, porque essas fontes não os têm.
- O **Editor de conteúdo** continua com a Inter (formulários mais fáceis de ler).
- Fontes originais em `assets/fontes/` (veja `LEIA-ME-FONTES.txt`).

## 1.5 — 29/10/2026

- **Mini-mapa:** sem o retângulo em volta do personagem. Mostra só grafites visitados,
  quizzes concluídos, muros livres, você e a escola (a legenda segue essa ordem).
  Os grafites ainda não descobertos e as latas não aparecem mais no mini-mapa.
- **Mapa:** reparadas duas manchas cinza do desenho original que cobriam a calçada
  (peças `linha_00_coluna_02` e `linha_01_coluna_03`, nas qualidades alta e leve).
  As peças originais ficaram guardadas em `assets/mapa/originais_antes_do_reparo/`.
  A colisão e as outras peças não mudaram.

## 1.4 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v1.1 de 29/10): mantidas as artes "ONDA",
  "Urbana TAG", "Samy TAG" e "Joao TAG", o mapa sem o muro_04 e as cópias de segurança.
  Inclui as mudanças da 1.2 e da 1.3 (a pasta enviada ainda tinha o código da 1.1).
- **Mini-mapa** no canto superior esquerdo, abaixo do perfil: o bairro inteiro em miniatura,
  com o jogador, a área da tela, a escola, os pins (cor pelo estado), os muros e as latas.
  Clique nele (ou tecla N) para ampliar, com legenda; o botão "–" esconde.
  A imagem `assets/mapa/minimapa.jpg` é uma cópia reduzida das peças leves; o mapa original não mudou.
- **Black Book:** artes desbloqueadas aparecem primeiro; as bloqueadas, depois.

## 1.3 — 29/10/2026 (versão para os alunos)

- O jogo não mostra mais a "Conferência do conteúdo" (nem ao abrir, nem no rodapé do menu).
  A conferência fica só no Editor de conteúdo, aba Conferência.
- Removido o muro_04 (estava num lugar inalcançável; pedido do professor).
- Inclui as melhorias do editor da 1.2 (lista de objetos no mapa e "Ver no mapa").

## 1.2 — 29/10/2026

- Editor, aba Mapa: lista de todos os muros, pins e latas; clicar leva até o objeto.
  Os que o jogador não alcança aparecem em vermelho (✕).
- Editor, aba Conferência: botão "Ver no mapa" nos problemas de muros, pins e latas.

## 1.1 — 29/10/2026

- Feita sobre a pasta enviada pelo professor (Urbana_v1.0_2): mantidas as artes "Samy TAG" e
  "Joao TAG", o muro_04 e as cópias de segurança.
- Editor: novas abas **Missões**, **Níveis, preços e recompensas** (com molduras) e **Tutorial**.
- Editor: cada grafite e cada arte mostra se aparece no jogo ou o que falta.
- Jogo: arte com preço 0 vem desbloqueada (grátis) quando o aluno chega ao nível dela.

## 1.0 — 28/10/2026

- **Abre com dois cliques no `index.html`**, sem servidor e sem internet (Chrome/Edge).
  Os arquivos de dados passaram de `dados/*.json` para `dados/*.js` (mesmo conteúdo, mesmos ids).
  O mapa original (`mapa.json`, `pecas.json` e as peças) foi mantido; `mapa.js` e `pecas.js`
  têm o mesmo conteúdo, para o jogo ler sem servidor.
- **Editor de conteúdo** (`editor.html`): grafites e quizzes, Black Book, personagens, créditos,
  posição de pins, latas e muros no mapa, conferência e gravação com cópia de segurança.
  As fotos são reduzidas e a localização GPS é removida.
- Fontes embutidas, sons funcionando sem servidor, partículas coloridas em todos os modos.
- Compatível com as partidas da 0.9 (formato do save não mudou). Partidas feitas pelo servidor
  local aparecem ao abrir com dois cliques só depois de Exportar/Importar.

## 0.9 — 28/10/2026 (MVP completo, conteúdo de exemplo)

Todo o conteúdo (avatares, fotos, textos, quizzes, artes, sons) é **rascunho de exemplo**,
marcado com "EXEMPLO", para ser trocado pelo material real da escola.

- **Etapa 1:** estrutura de pastas, leitura e conferência dos dados, menu principal com a logo,
  créditos, configurações.
- **Etapa 2:** várias partidas por computador (apelido), seleção de avatar, Continuar,
  gravação segura com cópia anterior, exportar/importar.
- **Etapa 3:** avatar animado em 4 direções, joystick virtual, HUD, pausa, posição salva.
- **Etapa 4:** pins dos grafites (3 estados), proximidade e botão A, prévia de longe,
  ficha com foto, história e curiosidades, recompensa de primeira visita.
- **Etapa 5:** quiz A–D com retorno imediato, recompensa única, níveis com desbloqueios.
- **Etapa 6:** latas coletáveis, missões configuradas por dados, tela de missões.
- **Etapa 7:** Black Book com aparência de caderno, compra com confirmação.
- **Etapa 8:** muros virtuais (podem ser girados no Tiled), pintura com efeito de spray.
- **Etapa 9:** perfil (troca de avatar e moldura), tutorial, música e efeitos sonoros,
  movimento reduzido, controles grandes, guias e plano de testes.

Formato do save: `versao_save` 1.
