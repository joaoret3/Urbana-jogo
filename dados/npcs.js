// Arquivo de conteúdo do Urbana. Pode ser alterado pelo Editor de conteúdo (editor.html).
// O conteúdo entre as chaves { } segue o formato JSON.
URBANA_DADOS["npcs"] = {
  "_leia": "Personagens do bairro que dão missões (quests). Cada um fica num ponto da camada 'npcs' do mapa (Editor > Mapa > Colocar personagem). As missões de cada personagem ficam em dados/missoes.js, com o campo 'personagem'. A folha de sprites segue o mesmo formato dos avatares (5 linhas: baixo, esquerda, direita, cima, interagindo); o personagem fica parado, animando a linha escolhida em 'linha_parado'.",
  "npcs": [
    {
      "id": "npc_alexandra",
      "nome": "Dir. Alexandra",
      "retrato": "assets/npcs/npc_alexandra/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "Oi! Eu sou a Alexandra. Tem tanto muro cinza aqui no bairro... Me ajuda a deixar tudo mais colorido?",
      "fala_andamento": "E aí, já pintou os muros? Tô esperando!",
      "fala_concluida": "Ficou lindo! Valeu demais pela ajuda!",
      "sprite": {
        "arquivo": "assets/npcs/npc_alexandra/sprite.webp",
        "largura_quadro": 96,
        "altura_quadro": 96,
        "linha_parado": 1,
        "quadros": 1,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": false,
        "raio": 300
      }
    },
    {
      "id": "npc_01",
      "nome": "Vice Priscilla",
      "retrato": "assets/npcs/npc_01/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "Me ajude!!",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_01/sprite.webp",
        "largura_quadro": 96,
        "altura_quadro": 96,
        "linha_parado": 1,
        "quadros": 1,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": false,
        "raio": 300
      }
    },
    {
      "id": "npc_02",
      "nome": "João Rafael",
      "retrato": "assets/npcs/npc_02/retrato.webp",
      "fala_chamada": "Chega ai mano!",
      "fala_inicial": "Vou te dar minha tag de presente, mas antes, você vai ter que concluir esse desafio:",
      "fala_andamento": "",
      "fala_concluida": "Parabéns, parceiro(a)!",
      "sprite": {
        "arquivo": "assets/npcs/npc_02/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 5,
        "quadros": 1,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": false,
        "raio": 300
      }
    },
    {
      "id": "npc_03",
      "nome": "",
      "retrato": "assets/npcs/npc_03/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_03/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 300
      }
    },
    {
      "id": "npc_04",
      "nome": "",
      "retrato": "assets/npcs/npc_04/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_04/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 300
      }
    },
    {
      "id": "npc_05",
      "nome": "Bruno York",
      "retrato": "assets/npcs/npc_05/retrato.webp",
      "fala_chamada": "Chega aí!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_05/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 1,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": false,
        "raio": 300
      }
    },
    {
      "id": "npc_06",
      "nome": "Geraldo",
      "retrato": "assets/npcs/npc_06/retrato.webp",
      "fala_chamada": "Ôooo turminha!!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_06/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 1,
        "quadros_por_segundo": 1
      },
      "andar": {
        "ativo": true,
        "raio": 900
      },
      "presente": {
        "moldura": "moldura_03"
      }
    },
    {
      "id": "npc_07",
      "nome": "RISKO",
      "retrato": "assets/npcs/npc_07/retrato.webp",
      "fala_chamada": "Oi, você já encontrou algum vendedor?",
      "fala_inicial": "Eles vendem algumas latas maneiras!",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_07/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 900
      }
    },
    {
      "id": "npc_08",
      "nome": "SOUZA",
      "retrato": "assets/npcs/npc_08/retrato.webp",
      "fala_chamada": "Ei! Se você ver uma flor por aí... Fui eu haha",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_08/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 900
      }
    },
    {
      "id": "npc_09",
      "nome": "BRASILEIRA",
      "retrato": "assets/npcs/npc_09/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_09/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 900
      }
    },
    {
      "id": "npc_10",
      "nome": "NPC",
      "retrato": "assets/npcs/npc_10/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_10/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5
      },
      "andar": {
        "ativo": true,
        "raio": 900
      }
    },
    {
      "id": "npc_11",
      "nome": "VANDALO",
      "retrato": "assets/npcs/npc_11/retrato.webp",
      "fala_chamada": "Ei! Vem cá!",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_11/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5,
        "trocar_lados": true
      },
      "andar": {
        "ativo": true,
        "raio": 900
      },
      "desafiante": {
        "quantidade": 9,
        "jogos": [
          "cores",
          "sequencia",
          "memoria"
        ],
        "recompensa": {
          "xp": 15,
          "moedas": 5
        }
      }
    },
    {
      "id": "npc_12",
      "nome": "Vendedor Norte",
      "retrato": "assets/npcs/npc_12/retrato.webp",
      "fala_chamada": "Latas aqui!",
      "fala_inicial": "Precisa de tinta? Tenho latas aqui na mochila!",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_12/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5,
        "trocar_lados": true
      },
      "andar": {
        "ativo": true,
        "raio": 600
      },
      "vendedor": {
        "itens": [
          "latas_1",
          "latas_10"
        ]
      }
    },
    {
      "id": "npc_13",
      "nome": "Vendedor Sul",
      "retrato": "assets/npcs/npc_12/retrato.webp",
      "fala_chamada": "Latas aqui!",
      "fala_inicial": "Precisa de tinta? Tenho latas aqui na mochila!",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_12/sprite.webp",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
        "quadros_por_segundo": 5,
        "trocar_lados": true
      },
      "andar": {
        "ativo": true,
        "raio": 600
      },
      "vendedor": {
        "itens": [
          "latas_1",
          "latas_10"
        ]
      }
    }
  ]
};
