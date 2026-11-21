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
      "fala_inicial": "EXEMPLO – Oi! Eu sou a Alexandra. Tem tanto muro cinza aqui no bairro... Me ajuda a deixar tudo mais colorido?",
      "fala_andamento": "EXEMPLO – E aí, já pintou os muros? Tô esperando!",
      "fala_concluida": "EXEMPLO – Ficou lindo! Valeu demais pela ajuda!",
      "sprite": {
        "arquivo": "assets/npcs/npc_alexandra/sprite.png",
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
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "as",
      "sprite": {
        "arquivo": "assets/npcs/npc_01/sprite.png",
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
      "retrato": "",
      "fala_chamada": "Chega ai!",
      "fala_inicial": "Vou te dar minha tag de presente, par você espalhar pelo bairro, mas antes, você vai ter que concluir esse desafio:",
      "fala_andamento": "",
      "fala_concluida": "Parabéns, parceiro!",
      "sprite": {
        "arquivo": "assets/npcs/npc_02/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 7,
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
        "arquivo": "assets/npcs/npc_03/sprite.png",
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
        "arquivo": "assets/npcs/npc_04/sprite.png",
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
        "arquivo": "assets/npcs/npc_05/sprite.png",
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
      "fala_chamada": "Ô turminha! ",
      "fala_inicial": "",
      "fala_andamento": "",
      "fala_concluida": "",
      "sprite": {
        "arquivo": "assets/npcs/npc_06/sprite.png",
        "largura_quadro": 192,
        "altura_quadro": 192,
        "linha_parado": 1,
        "quadros": 1,
        "quadros_por_segundo": 1
      },
      "andar": {
        "ativo": true,
        "raio": 300
      }
    }
  ]
};
