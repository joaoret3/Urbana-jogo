# Guia de conteúdo do Urbana

O jeito mais fácil de cadastrar conteúdo é o **Editor de conteúdo**: dois cliques em
`editor.html` (de preferência no Google Chrome ou no Microsoft Edge). Nele você:

- cadastra **grafites** (foto, título, artista, data, história, curiosidades) e o **quiz** de cada um;
- cadastra **artes do Black Book** (imagem, título, autoria, categoria, autorização);
- cadastra **personagens** (retrato e folha de sprites, com prévia animada);
- cadastra e edita **missões** (objetivo, quantas vezes, recompensa);
- ajusta **níveis, preços das artes, recompensas e molduras**;
- edita o **tutorial** "Como jogar" e os **créditos**;
- posiciona no **mapa** os pins dos grafites, as latas, os muros livres (com giro) e as
  **faixas de pedestre** (com giro, comprimento e "Duplicar");
- confere tudo na aba **Conferência** e clica em **Salvar alterações**.

No topo de cada grafite e de cada arte, o editor mostra se ele **já aparece no jogo** ou o que
falta (por exemplo: está como Rascunho, falta o pin, falta marcar a autorização).
Artes com **preço 0** são grátis: vêm desbloqueadas quando o aluno chega ao nível delas.

Na primeira gravação de cada sessão, o navegador pede para escolher a pasta do Urbana e
permitir a gravação. Antes de gravar, o editor guarda uma cópia dos arquivos antigos em
`copias_de_seguranca/`. As fotos são reduzidas e a localização GPS escondida nelas é removida.

O resto deste guia explica como os arquivos funcionam por dentro, para quem quiser editar à mão.

Todo o conteúdo fica em dois lugares:

- **`dados/`**: arquivos `.js` com o conteúdo em formato JSON (dá para abrir no Bloco de Notas);
- **`assets/`**: imagens (fotos, artes, personagens) e sons.

O que tiver **EXEMPLO** no texto ou **`exemplo_`** no nome do arquivo é provisório e deve ser substituído.

> **Dica:** depois de alterar qualquer arquivo, recarregue o jogo (F5). Para saber se algo está
> errado, abra a aba **Conferência** do editor: ela mostra o arquivo e o problema.
> O jogo dos alunos não mostra a conferência.

## Cuidados ao editar à mão

- Cada arquivo começa com `URBANA_DADOS["nome"] = {` e termina com `};`. Não apague essas partes.

- Textos ficam entre aspas duplas: `"titulo": "Mural da Vida"`.
- Cada item de uma lista é separado por vírgula, **mas não há vírgula depois do último**.
- Para colocar aspas dentro de um texto, use `\"`.
- Campos que começam com `_leia` são só explicações. O jogo não usa esses campos.

## Arquivos de dados

| Arquivo | O que tem |
|---|---|
| `dados/jogo.js` | Distâncias de interação, recompensas, preços e níveis das categorias de arte |
| `dados/niveis.js` | Níveis, XP necessário e o que cada nível desbloqueia |
| `dados/grafites.js` | Fichas dos grafites reais (registro cultural) |
| `dados/quizzes.js` | Perguntas de cada grafite |
| `dados/artes.js` | Artes dos estudantes para o Black Book (expressão artística) |
| `dados/avatares.js` | Personagens |
| `dados/molduras.js` | Molduras do retrato do jogador |
| `dados/missoes.js` | Missões |
| `dados/creditos.js` | Créditos (só nomes autorizados) |

## Cadastrar um novo grafite (passo a passo)

1. **Foto:** salve a foto em `assets/grafites/` (JPG, até uns 1600 px de largura).
   Antes, retire a localização GPS embutida na foto (no Windows: Propriedades > Detalhes >
   "Remover propriedades e informações pessoais").
2. **Ficha:** em `dados/grafites.js`, copie um bloco existente e altere:
   - `id`: código único, ex. `grafite_004`;
   - `titulo`, `artista` (use `null` se a autoria não for identificada ou não for autorizada),
     `data_registro` (formato `AAAA-MM-DD`), `descricao` (texto histórico), `curiosidades`;
   - `imagem`: caminho da foto, ex. `assets/grafites/grafite_004.jpg`;
   - `quiz_id`: id do quiz, ex. `quiz_004`;
   - `status_publicacao`: `rascunho` enquanto estiver em revisão; `publicado` para aparecer no jogo.
3. **Quiz:** em `dados/quizzes.js`, crie o quiz com `grafite_id` igual ao id da ficha.
   Cada pergunta tem 4 alternativas, e `correta` é a **letra** certa (A, B, C ou D).
   As perguntas devem usar informações que estão na ficha.
4. **Posição no mapa:** use a aba **Mapa** do editor. (Quem usa o **Tiled** pode abrir `assets/mapa/mapa.json`, selecione a camada `grafites`
   e coloque um **ponto** na calçada em frente ao grafite. No campo **Nome** do ponto, escreva
   o mesmo id (ex. `grafite_004`). Salve. Depois copie o conteúdo para `assets/mapa/mapa.js`, que é o arquivo lido pelo jogo, ou peça a atualização no editor.)

## Cadastrar uma arte do Black Book

1. Salve a imagem em `assets/artes/` (WebP, PNG ou JPG; de preferência no formato 2:1, ex. 1000 × 500 px).
   Pelo Editor de conteúdo isso é automático: a imagem enviada é reduzida para até 1000 px e gravada em WebP.
2. Em `dados/artes.js`, crie o registro com `id`, `titulo`, `autoria` (nome artístico ou
   pseudônimo autorizado), `imagem` e `categoria` (`basica`, `intermediaria` ou `especial`).
3. Só aparecem no jogo artes com `"autorizacao": { "autorizado": true }` e
   `"status_publicacao": "publicado"`.

A categoria indica **em que etapa do jogo** a arte fica disponível. Ela **não** é uma nota para
o trabalho do estudante.

## Personagens (avatares)

Cada avatar tem uma pasta em `assets/avatares/` com dois arquivos:

- **`retrato.webp`** (ou .png): imagem quadrada (ex.: 512 × 512 px, fundo transparente), usada nas telas e no HUD;
- **`sprite.png`**: folha de sprites usada para andar no mapa.

A folha de sprites é uma grade de quadros do mesmo tamanho (nos exemplos, 96 × 96 px):

| Linha | Animação |
|---|---|
| 1 | virado para baixo |
| 2 | virado para a esquerda |
| 3 | virado para a direita |
| 4 | virado para cima |
| 5 | interagindo (opcional) |

Em cada linha, a **1ª coluna** é o personagem parado e as **colunas seguintes** são os passos
da caminhada (nos exemplos, 4 passos, então 5 colunas). Os pés do personagem devem ficar perto
da parte de baixo do quadro. Em `dados/avatares.js`, informe o arquivo, o tamanho do quadro
(`largura_quadro`, `altura_quadro`), o número de passos (`quadros_caminhada`) e o
`nivel_minimo` (1 = disponível desde o início).

## Muros e latas no mapa

No editor, aba **Mapa**: botões "Nova lata" e "Novo muro livre". No Tiled (avançado):

- **Muros virtuais:** camada `muros_livres`, um **retângulo** sobre o muro (proporção 2:1),
  com nome `muro_01`, `muro_02`, … O retângulo pode ser **girado** no Tiled para acompanhar
  a rua; o jogo gira o muro e a arte do mesmo jeito. Os 3 muros atuais são exemplos.
- **Latas coletáveis:** camada `coletaveis`, um **ponto** com nome `lata_001`, `lata_002`, …

O jogo confere se cada pin, muro ou lata pode ser alcançado andando a partir da escola.
Se não puder, apague ou mude tiles da camada `colisao`, ou mova o objeto para a calçada.

## Faixas de pedestre

No editor, aba **Mapa** → **Nova faixa de pedestre** → clique no meio da rua. No painel:
**Giro** (as listras devem ficar na direção da rua), **Comprimento** (de uma calçada à outra) e
**Tamanho das listras**. "Duplicar" cria uma cópia ao lado, já com o mesmo giro. As faixas ficam
na camada `faixas_pedestre` do mapa (retângulos girados, como os muros) e não bloqueiam a passagem.

## Sons e música

Os arquivos ficam em `assets/audio/` (formato mp3) e a lista está em `dados/jogo.js`,
nos campos `"musica"` e `"sons"`. Os sons atuais são rascunhos gerados para o projeto.
Para trocar, coloque o novo arquivo na pasta e ajuste o caminho. Use só áudios originais
ou com licença de uso. O jogo continua compreensível sem som: tudo aparece também em texto.

## Missões

Em `dados/missoes.js`, cada missão tem `tipo`, `meta` (quantas vezes) e `recompensa`
(`xp`, `latas` e/ou `moldura`). Tipos disponíveis:

| Tipo | Conta |
|---|---|
| `visitar_murais` | grafites visitados de perto |
| `ler_fichas` | fichas lidas até o fim (rolando o texto) |
| `concluir_quizzes` | quizzes concluídos |
| `pintar_muros` | muros virtuais pintados |
| `coletar_latas` | latas coletadas no mapa |
| `visitar_todos` | visitar todos os grafites publicados (use `meta` 1) |

Uma missão que pede mais do que o jogo tem (ex.: 5 fichas com só 3 grafites) aparece como
**Indisponível** e é liberada sozinha quando o conteúdo for cadastrado.
