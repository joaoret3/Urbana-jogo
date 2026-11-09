// Arquivo de conteúdo do Urbana. Pode ser alterado pelo Editor de conteúdo (editor.html).
// O conteúdo entre as chaves { } segue o formato JSON.
URBANA_DADOS["missoes"] = {
  "_leia": "Missões. 'tipo' pode ser: visitar_murais, ler_fichas, concluir_quizzes, pintar_muros, coletar_latas, visitar_todos. 'meta' é quantas vezes. Uma missão que pede mais do que existe no jogo fica desativada sozinha. Recompensa pode ter xp, latas e moldura.",
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
      "descricao": "Leia cinco fichas educativas.",
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
        "xp": 10
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
        "moldura": "moldura_orgulho"
      }
    }
  ]
};
