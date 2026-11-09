// =============================================================================
// DETALHES DO BAIRRO — postes com luminária (desde a v2.6; sem fiação desde a v2.7)
// e faixas de pedestre (desde a v2.13, desenhadas pelo jogo a partir do mapa)
// -----------------------------------------------------------------------------
// As posições vêm de assets/mapa/detalhes.js (URBANA_DETALHES), geradas a partir
// do desenho do mapa: em média 4 postes por rua (v2.8). A lista "fios" ficou vazia;
// se um dia tiver fios de novo, o código abaixo ainda sabe desenhá-los. As sombras dos postes já estão desenhadas no próprio mapa.
// Os postes e os fios ficam ACIMA do personagem (são altos). Não têm colisão.
// Para economizar, ficam agrupados em blocos e só os blocos perto da tela aparecem.
//
//   Detalhes.criar(cena)      depois de criar o mapa
//   Detalhes.atualizar(cena)  algumas vezes por segundo (mostra/esconde os blocos)
// =============================================================================
const Detalhes = {
  BLOCO: 1024,                 // tamanho dos blocos (px do mapa)
  ESCALA_POSTE: 0.8,           // tamanho do poste (a imagem é desenhada em dobro; 0.8 = 1,6x o desenho base)
  ORIGEM_POSTE: 0.2708,        // posição do centro do poste na imagem (da esquerda)
  PONTA_CRUZETA: 25.6,          // distância do centro até onde o fio se prende
  DESLOC_CRUZETA: 8,          // a cruzeta fica um pouco abaixo do braço da luz

  // Faixas de pedestre (camada "faixas_pedestre" do mapa, editável no Editor > Mapa).
  // Ficam no chão: por cima do mapa e embaixo do personagem, dos muros e dos pins.
  criarFaixas(cena) {
    const faixas = (Conteudo.mapa && Conteudo.mapa.faixas) || [];
    if (!faixas.length) return;
    const g = cena.add.graphics().setDepth(1);
    g.fillStyle(0xf2f2ec, 0.88);                     // tinta branca, um pouco gasta
    faixas.forEach(o => {
      if (!(o.width > 0 && o.height > 0)) return;
      Conteudo.listrasFaixa(o).forEach(c => g.fillPoints(c, true));
    });
  },

  criar(cena) {
    this.criarFaixas(cena);
    cena.blocosDetalhes = new Map();
    const dados = window.URBANA_DETALHES;
    if (!dados || !Array.isArray(dados.postes)) return;
    const bloco = (x, y) => {
      const bx = Math.floor(x / this.BLOCO), by = Math.floor(y / this.BLOCO), k = bx + ',' + by;
      if (!cena.blocosDetalhes.has(k)) {
        const g = cena.add.graphics().setDepth(31);
        cena.blocosDetalhes.set(k, { bx, by, fios: g, postes: [] });
      }
      return cena.blocosDetalhes.get(k);
    };
    // fios: cada vão tem o caminho pela calçada (pontos); desenha 2 fios paralelos,
    // afastados para os lados como as pontas da cruzeta do poste
    (dados.fios || []).forEach(f => {
      const pts = f.pontos || [];
      if (pts.length < 2) return;
      const meio = pts[Math.floor(pts.length / 2)];
      const g = bloco(meio[0], meio[1]).fios;
      [-1, 1].forEach(lado => {
        const linha = pts.map((p, i) => {
          const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
          const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          return new Phaser.Math.Vector2(p[0] - dy / l * this.PONTA_CRUZETA * lado, p[1] + dx / l * this.PONTA_CRUZETA * lado + this.DESLOC_CRUZETA);
        });
        g.lineStyle(3, 0x1c1a20, 0.8);
        g.strokePoints(linha, false, false);
      });
    });
    // postes
    dados.postes.forEach(p => {
      const img = cena.add.image(p.x, p.y, 'poste')
        .setOrigin(this.ORIGEM_POSTE, 0.5).setScale(this.ESCALA_POSTE).setAngle(p.braco).setDepth(30);
      bloco(p.x, p.y).postes.push(img);
    });
    this.atualizar(cena, true);
  },

  // Mostra só os blocos perto da área visível (a cada ~250 ms)
  atualizar(cena, forcar) {
    if (!cena.blocosDetalhes) return;
    const v = cena.cameras.main.worldView, m = 200;
    cena.blocosDetalhes.forEach(b => {
      const x0 = b.bx * this.BLOCO, y0 = b.by * this.BLOCO;
      const vis = x0 < v.right + m && x0 + this.BLOCO > v.x - m && y0 < v.bottom + m && y0 + this.BLOCO > v.y - m;
      if (vis !== b.visivel || forcar) {
        b.visivel = vis; b.fios.setVisible(vis); b.postes.forEach(i => i.setVisible(vis));
      }
    });
  }
};
