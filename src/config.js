// =============================================================================
// CONFIGURAÇÕES TÉCNICAS DO URBANA
// -----------------------------------------------------------------------------
// Aqui ficam só ajustes técnicos (desempenho, câmera, pastas).
// Valores do jogo (recompensas, preços, distâncias) ficam em dados/jogo.js.
// A qualidade do mapa também pode ser trocada pelo próprio jogo,
// no menu Configurações (a escolha fica salva no computador).
// =============================================================================
window.URBANA = {
  VERSAO: '2.48',              // versão do jogo (aparece no rodapé do menu)
  QUALIDADE: 'alta',          // padrão: 'alta' (mapa inteiro) ou 'leve' (metade da resolução, para computadores fracos)
  VELOCIDADE: 260,            // pixels por segundo do personagem
  ZOOM_INICIAL: 0.9,
  RAIO_CARREGAMENTO: 1.35,    // carrega as peças do mapa a até 1,35 tela de distância da câmera (menos memória; era 1,6)
  MOSTRAR_COLISAO: false,     // tecla C liga/desliga durante o jogo
  // A escala vale para folhas com quadros de 96 px; folhas maiores (ex.: 192 px) são reduzidas na mesma proporção (v2.31)
  AVATAR_ESCALA: 1.55,        // tamanho do personagem no mapa (1 = tamanho do quadro da folha de sprites; 0.9 até a v2.2, 1.15 na v2.3, 1.35 na v2.4)
  ACELERACAO: 0.06,          // segundos para o personagem pegar velocidade (menor = arranca mais rápido)
  FRENAGEM: 0.045,           // segundos para frear ao soltar o controle
  AVATAR_ESCALA_PES: 0.9,     // tamanho da área de colisão dos pés (fica igual, para o personagem maior não travar nas calçadas)
  CONTA_TESTE: false,          // true: o apelido TESTE cria uma partida com nível máximo e muitas latas (só para o professor; o pacote dos alunos vem com false)
  AUTOSALVAR_SEGUNDOS: 10,    // de quanto em quanto tempo a posição do jogador é salva

  // Pastas e arquivos de conteúdo (a escola altera os arquivos, não este código)
  PASTA_DADOS: 'dados/',
  ARQUIVOS_DADOS: ['jogo', 'niveis', 'avatares', 'molduras', 'grafites', 'quizzes', 'artes', 'missoes', 'npcs', 'creditos', 'tutorial'],

  // Prefixo das chaves gravadas no navegador (localStorage)
  PREFIXO_ARMAZENAMENTO: 'urbana_'
};
