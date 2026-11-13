// Arquivo de conteúdo do Urbana. Pode ser alterado pelo Editor de conteúdo (editor.html).
// O conteúdo entre as chaves { } segue o formato JSON.
URBANA_DADOS["jogo"] = {
  "_leia": "Valores de balanceamento do jogo. Pode alterar os números sem mexer no código.",
  "versao_conteudo": "0.1-BETA",
  "max_partidas_por_computador": 6,
  "interacao": {
    "_leia": "Distâncias em pixels do mapa (o mapa inteiro tem 9392 x 10712).",
    "distancia_pin": 140,
    "distancia_muro": 130,
    "distancia_lata": 56
  },
  "custo_pintar_muro": 3,
  "latas_renascem_percentual": 50,
  "anoitecer": {
    "_leia": "Luz do bairro (v2.40): a partida começa de dia e, depois de 'minutos_para_anoitecer' minutos jogando, escurece aos poucos (durante 'minutos_transicao') até o crepúsculo, com os postes acesos. Depois de 'minutos_de_noite' amanhece (também durante 'minutos_transicao') e o ciclo recomeça; com 'repetir': false fica de noite. 'ativo': false desliga para todos. 'carros_acesos_percentual' (v2.52): quantos por cento dos veículos estacionados ficam com faróis e lanternas acesos à noite (0 = nenhum).",
    "ativo": true,
    "minutos_para_anoitecer": 5,
    "minutos_transicao": 1,
    "minutos_de_noite": 3,
    "repetir": true,
    "carros_acesos_percentual": 40
  },
  "recompensas": {
    "primeira_visita": {
      "xp": 2,
      "latas": 2
    },
    "quiz_padrao": {
      "xp": 10,
      "latas": 6
    },
    "lata_coletavel": 1
  },
  "musica": "assets/audio/musica_lofi.mp3",
  "sons": {
    "_leia": "Efeitos sonoros. Troque os arquivos em assets/audio (mp3) por sons originais ou com licença de uso.",
    "lata": "assets/audio/lata.mp3",
    "spray": "assets/audio/spray.mp3",
    "acerto": "assets/audio/acerto.mp3",
    "erro": "assets/audio/erro.mp3",
    "nivel": "assets/audio/nivel.mp3",
    "descoberta": "assets/audio/descoberta.mp3",
    "missao": "assets/audio/missao.mp3"
  },
  "categorias_arte": {
    "_leia": "A categoria indica a etapa do jogo em que a arte aparece. Não é uma nota para o trabalho do estudante.",
    "basica": {
      "nome": "Arte básica",
      "preco": 25,
      "nivel_minimo": 1
    },
    "intermediaria": {
      "nome": "Arte intermediária",
      "preco": 45,
      "nivel_minimo": 2
    },
    "especial": {
      "nome": "Arte rara",
      "preco": 80,
      "nivel_minimo": 3
    }
  }
};
