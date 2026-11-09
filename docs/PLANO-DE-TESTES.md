# Urbana — plano de testes (versão 2.26)

Roteiro para conferir o jogo antes de usar em sala (seção 23 da especificação).
Marque com X cada item testado. Teste também num computador da escola, com a internet desligada, abrindo o `index.html` com dois cliques.

| # | Teste | Como fazer | Resultado esperado |
|---|---|---|---|
| 1 | Sem internet | Desligue a rede e dê dois cliques no `index.html` | Abre e funciona normalmente |
| 2 | Conferência | No `editor.html`, aba Conferência | Nenhum erro (item em vermelho); avisos só sobre conteúdo que falta. (O jogo dos alunos não mostra a conferência.) |
| 3 | Nova partida | Novo Jogo → apelido → avatar | O avatar aparece em frente à escola e o tutorial abre |
| 4 | Apelido repetido | Novo Jogo com um apelido já usado | Pede confirmação antes de substituir |
| 5 | Movimento | WASD, setas, joystick e clique | O personagem anda e anima nas 4 direções, arranca e para de forma suave e não treme na diagonal |
| 6 | Colisão | Tente atravessar uma casa | O personagem não passa |
| 7 | Pin | Chegue perto de um pin e aperte A | A ficha certa abre, com a foto carregada |
| 8 | Prévia | Clique num pin distante | Abre a prévia, sem recompensa |
| 9 | Primeira visita | Abra a ficha de perto | "Grafite descoberto!" e +XP/+lata só na 1ª vez |
| 10 | Quiz certo | Responda certo | Caixa verde, +10 XP e +5 latas |
| 11 | Quiz errado | Responda errado | Caixa vermelha, "Tentar novamente", nada é descontado |
| 12 | Quiz repetido | Refaça um quiz concluído | Revisão sem nova recompensa |
| 13 | Lata | Passe por cima de uma lata | Saldo +1 e a lata some (não volta ao reabrir) |
| 14 | Compra sem saldo | Black Book → arte cara | Botão desabilitado com o motivo |
| 15 | Compra com saldo | Black Book → arte barata → Desbloquear | Pede confirmação, desconta e a arte fica colorida |
| 16 | Muro | Chegue perto de um muro livre, aperte A, escolha e aplique | Efeito de spray e a arte aparece no muro |
| 17 | Persistência | Feche o navegador, abra e use Continuar | Posição, saldo, pins, artes e muros iguais |
| 18 | Nível | Acumule 50 XP | "Nível 2!" e o avatar 2 fica disponível |
| 19b | Ordem dos personagens | Novo Jogo (tela de personagem) e Perfil (P) | Disponíveis primeiro; bloqueados depois, do menor para o maior nível |
| 19 | Trocar avatar | Perfil (P) → outro avatar | O personagem muda e o progresso fica igual |
| 20 | Missões | Tecla M ou aba "Missões" abaixo do Menu | Progresso atualizado e missões concluídas marcadas |
| 21 | Exportar/importar | Continuar → Exportar; depois Importar o arquivo | A partida volta igual |
| 22 | Recuperação | (avançado) apague a partida no navegador e reabra | O jogo recupera a cópia anterior ou avisa |
| 23 | Acessibilidade | Configurações → Movimento reduzido e Controles grandes | Animações param e os controles crescem |
| 24 | Sem som | Desligue música e efeitos | Tudo continua compreensível pelo texto |
| 25 | Tela pequena | Abra num tablet/celular deitado | Botões grandes, janelas com rolagem |
| 26 | Editor: novo grafite | `editor.html` → Novo grafite → foto, textos, quiz → Colocar pin no mapa → Salvar | Pede a pasta uma vez, salva e cria cópia em `copias_de_seguranca` |
| 27 | Editor → jogo | Recarregue o jogo | O grafite novo aparece com pin, ficha e quiz |
| 28 | Editor: pontos no mapa | Aba Mapa → Nova lata / Novo muro → girar → Salvar | Aparecem no jogo; pontos em vermelho = lugar inalcançável |
| 29 | Editor: Black Book | Nova arte → imagem, autoria, autorização, Publicado → Salvar | Arte aparece no Black Book do jogo |
| 30 | Editor: missão | Missões → Nova missão → objetivo e recompensa → Salvar | Aparece na tela de Missões (tecla M) e dá a recompensa uma vez |
| 31 | Editor: níveis e preços | Mude o XP de um nível e o preço de uma categoria → Salvar | O jogo usa os novos valores |
| 32 | Arte grátis | Arte com preço 0 e Publicada | Aparece desbloqueada no Black Book e pode ir para um muro |
| 33 | Mini-mapa | Ande pelo mapa; visite um grafite; clique no mini-mapa (ou N); clique de novo; botão "–" | O ponto rosa acompanha o jogador; o grafite visitado aparece em azul (os não descobertos não aparecem); amplia com legenda; diminui; esconde e volta pelo botão "Mapa" |
| 35 | Fontes | Abra o jogo sem internet e passe pelo menu, ficha, quiz e Black Book | Textos na fonte Londrina Solid (maiúsculas e minúsculas; com acentos: ã, ç, é...), títulos na Sedgwick Ave Display, números sem a marca "PERSONAL USE ONLY" |
| 36 | Muro girado | Pinte um muro girado mais de 90° | A arte aparece em pé, não de cabeça para baixo |
| 37 | Menu sem editor | Abra o index.html | O rodapé do menu não tem link para o editor |
| 38 | Postes e sombras | Ande pelas ruas | Alguns postes de luz nas calçadas (cerca de 4 por rua), sem fios, por cima do personagem, sem bloquear; sombras nas calçadas; jogo continua leve |
| 39 | Editor: faixa de pedestre | Mapa → Nova faixa de pedestre → clicar na rua → girar e ajustar comprimento → Salvar | A faixa aparece no jogo, no mesmo lugar e direção |
| 34 | Ordem do Black Book | Desbloqueie uma arte | Ela passa para o grupo do topo, junto das outras desbloqueadas |
| 40 | Celular/tablet em pé | Abra o jogo num celular ou tablet com a tela em pé | Aparece o aviso "Vire o aparelho" cobrindo tudo; ao deitar o aparelho o aviso some e o jogo segue |
| 41 | Celular deitado | Abra Pausa, Missões, Perfil, Black Book, uma ficha e o quiz | Cabem na tela com pouca rolagem; título e botões finos; nenhum emoji, só ícones desenhados |
| 42 | História de abertura | Novo Jogo, escreva o apelido e confirme | Aparece a história em quadrinhos com o botão Continuar; depois vem a escolha do avatar. Em "Continuar" (partida salva) a história NÃO aparece |
| 43 | Conta de teste | (pasta do professor) Novo Jogo com o apelido TESTE | Começa no nível máximo com 9999 latas. No pacote dos alunos o apelido TESTE é uma partida comum |
| 44 | Ordem do Black Book | Abra o Black Book | Desbloqueadas primeiro; depois as bloqueadas do menor nível/preço para o maior |
| 45 | Carros estacionados | No editor, aba Mapa, "Novo carro": clique na rua, troque o modelo, o tamanho e espelhe; salve e abra o jogo | O carro aparece no lugar, o jogador não o atravessa (bate na base) mas passa por trás dele; o desenho fica na frente ou atrás do jogador conforme a posição |
| 46 | Carros pelo mapa | Ande pelas ruas do bairro | Há carros e caminhões estacionados junto às calçadas, de vários modelos e virados para os dois lados; nenhum pin, lata ou muro fica bloqueado e todas as ruas continuam com passagem |
| 47 | Girar veículos | Editor > Mapa, clique num carro e use o Giro (botões 15°, 90°, barra ou número) | O carro gira em torno da base, no editor e no jogo; a área bloqueada (tracejada) gira junto e o jogador bate nela |
| 48 | Caminhão-baú | Jogo: ande contra o baú de um caminhão (azul ou roxo), por baixo, pelo meio e por cima | O personagem para no baú; só passa acima/abaixo da base mostrada no editor |
| 49 | Lata nova | Veja as latas no mapa e no editor (Mapa > latas) | Lata colorida nova, sem fundo branco |
| 50 | Veículos e direções | Jogo: veja os veículos nas ruas; Editor > Mapa > Novo carro, troque modelo e direção (8 botões) | O desenho vira conforme a direção; esquerda/diagonais usam o desenho espelhado |
| 51 | Trocar veículos | Editor: Duplicar, Apagar e arrastar um veículo; salve e abra o jogo | As mudanças aparecem no jogo; o personagem não atravessa o veículo (baú incluso) |
| 52 | Personagem com missão | Jogo: ande até a Alexandra (perto da escola) | De longe: "!" em cima dela; de perto: balão e botão A "Conversar com Alexandra" |
| 53 | Missão só depois do encontro | Antes de conversar, abra Missões; depois converse e pinte 2 muros | Antes: "Encontre Alexandra"; depois da conversa a missão começa em 0 e conclui com 2 muros pintados |
| 54 | Editor de personagens | Editor > Personagens do bairro: crie um, ponha no mapa e dê uma missão; salve e abra o jogo | O personagem aparece no lugar escolhido com a missão |

Anote também: tempo de carregamento, travamentos e dúvidas dos alunos.
