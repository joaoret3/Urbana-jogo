// Arquivo de conteúdo do Urbana. Pode ser alterado pelo Editor de conteúdo (editor.html).
// O conteúdo entre as chaves { } segue o formato JSON.
URBANA_DADOS["missoes"] = {
  "_leia": "Missões. 'tipo' pode ser: visitar_murais, ler_fichas, concluir_quizzes, pintar_muros, coletar_latas, visitar_todos, mini_jogo (com 'mini_jogo': { jogo, dificuldade }) ou coletar_letras (com 'letras': \"RET\" e meta = número de letras). 'meta' é quantas vezes. Uma missão que pede mais do que existe no jogo fica desativada sozinha. Recompensa pode ter xp, latas e moldura. 'personagem' (opcional) = id de um personagem de dados/npcs.js: a missão só aparece e só começa a contar depois que o jogador conversa com esse personagem no mapa.",
  "missoes": [
    {
      "id": "missao_001",
      "titulo": "Primeiros Passos",
      "descricao": "Encontre e visite o primeiro grafite.",
      "tipo": "visitar_murais",
      "meta": 1,
      "recompensa": {
        "xp": 5,
        "latas": 3
      }
    },
    {
      "id": "missao_002",
      "titulo": "Explorador Urbano",
      "descricao": "Visite três murais diferentes.",
      "tipo": "visitar_murais",
      "meta": 3,
      "recompensa": {
        "xp": 10,
        "latas": 5
      }
    },
    {
      "id": "missao_003",
      "titulo": "Conhecendo a História",
      "descricao": "Leia cinco fichas de grafite.",
      "tipo": "ler_fichas",
      "meta": 5,
      "recompensa": {
        "xp": 10,
        "latas": 5
      }
    },
    {
      "id": "missao_004",
      "titulo": "Mestre dos Murais",
      "descricao": "Conclua cinco quizzes diferentes.",
      "tipo": "concluir_quizzes",
      "meta": 5,
      "recompensa": {
        "xp": 15,
        "latas": 10
      }
    },
    {
      "id": "missao_005",
      "titulo": "Minha Primeira Arte",
      "descricao": "Exponha sua primeira arte em um muro virtual.",
      "tipo": "pintar_muros",
      "meta": 1,
      "recompensa": {
        "xp": 10,
        "latas": 3
      }
    },
    {
      "id": "missao_006",
      "titulo": "Catador de Latas",
      "descricao": "Colete cinco latas de spray pelo bairro.",
      "tipo": "coletar_latas",
      "meta": 5,
      "recompensa": {
        "xp": 5,
        "latas": 2
      }
    },
    {
      "id": "missao_007",
      "titulo": "Orgulho do Bairro",
      "descricao": "Visite todos os murais disponíveis.",
      "tipo": "visitar_todos",
      "meta": 1,
      "recompensa": {
        "xp": 30,
        "latas": 20
      }
    },
    {
      "id": "missao_008",
      "titulo": "Muros da alexandra. ",
      "descricao": "A Alexandra quer ver o bairro mais colorido: pinte dois muros livres.",
      "tipo": "pintar_muros",
      "meta": 3,
      "personagem": "npc_alexandra",
      "recompensa": {
        "xp": 15,
        "latas": 10
      }
    },
    {
      "id": "missao_009",
      "titulo": "O gatinho do biscoito",
      "descricao": "Um gatinho levou meu biscoito! Me ajuda a achar ele?",
      "tipo": "achar_e_voltar",
      "meta": 1,
      "personagem": "npc_01",
      "recompensa": {
        "xp": 10,
        "latas": 15
      },
      "achado": {
        "nome": "gatinho",
        "imagem": "assets/missoes/gato_laranjinha.png",
        "mensagem": "Achou! Ele estava com o biscoito da Vice Priscilla.",
        "fala_entrega": "Você achou meu gatinho! E ainda trouxe meu biscoito. Valeu demais, toma sua recompensa!",
        "foge": true,
        "segue": true,
        "pegadas": true
      }
    },
    {
      "id": "missao_010",
      "titulo": "João: Mini-Jogo",
      "descricao": "",
      "tipo": "mini_jogo",
      "meta": 1,
      "recompensa": {
        "xp": 10,
        "latas": 3,
        "arte": "arte_016"
      },
      "personagem": "npc_02",
      "mini_jogo": {
        "jogo": "quebra_cabeca",
        "dificuldade": "dificil"
      }
    },
    {
      "id": "missao_011",
      "titulo": "",
      "descricao": "",
      "tipo": "coletar_letras",
      "meta": 4,
      "recompensa": {
        "xp": 5,
        "latas": 3,
        "arte": "arte_052"
      },
      "personagem": "npc_05",
      "letras": "YORK"
    }
  ]
};
