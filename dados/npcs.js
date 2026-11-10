// Arquivo de conteúdo do Urbana. Pode ser alterado pelo Editor de conteúdo (editor.html).
// O conteúdo entre as chaves { } segue o formato JSON.
URBANA_DADOS["npcs"] = {
  "_leia": "Personagens do bairro que dão missões (quests). Cada um fica num ponto da camada 'npcs' do mapa (Editor > Mapa > Colocar personagem). As missões de cada personagem ficam em dados/missoes.js, com o campo 'personagem'. A folha de sprites segue o mesmo formato dos avatares (5 linhas: baixo, esquerda, direita, cima, interagindo); o personagem fica parado, animando a linha escolhida em 'linha_parado'.",
  "npcs": [
    {
      "id": "npc_alexandra",
      "nome": "Dr. Alexandra",
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
        "quadros": 7,
        "quadros_por_segundo": 5
      }
    }
  ]
};
