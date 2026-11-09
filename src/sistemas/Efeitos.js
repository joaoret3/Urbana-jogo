// =============================================================================
// EFEITOS VISUAIS — partículas e animações leves no mapa (seção 15.2)
// Respeitam a opção "Movimento reduzido" (Configurações ou sistema operacional).
// =============================================================================
const Efeitos = {
  CORES: [0xff3fbf, 0x22d3ee, 0x9be21b, 0xffe14d, 0xff9b1a, 0x7b3bea],

  menosMovimento() { return Preferencias.menosMovimento(); },

  // Textura de "pingos de tinta" coloridos usada pelas partículas: um quadro por cor
  // (assim as cores aparecem também no modo Canvas, usado quando não há servidor)
  QUADROS: [0, 1, 2, 3, 4, 5],
  prepararTexturas(cena) {
    if (cena.textures.exists('pingo')) return;
    const g = cena.add.graphics();
    this.CORES.forEach((cor, i) => g.fillStyle(cor).fillCircle(8 + i * 16, 8, 8));
    g.generateTexture('pingo', 16 * this.CORES.length, 16); g.destroy();
    const tex = cena.textures.get('pingo');
    this.CORES.forEach((cor, i) => tex.add(i, 0, i * 16, 0, 16, 16));
  },

  // Estouro de pingos coloridos (latas, descobertas)
  estouro(cena, x, y, quantidade = 18) {
    if (this.menosMovimento()) return;
    const e = cena.add.particles(x, y, 'pingo', {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 },
      lifespan: 650, frame: this.QUADROS, emitting: false, gravityY: 300
    }).setDepth(30);
    e.explode(quantidade);
    cena.time.delayedCall(900, () => e.destroy());
  },

  // Texto que sobe e some (ex.: "+1 lata")
  textoSubindo(cena, x, y, texto, cor = '#ffe14d') {
    const t = cena.add.text(x, y, texto, {
      fontFamily: 'Londrina Solid, Inter', fontStyle: 'normal', fontSize: '30px', color: cor, stroke: '#0f0c14', strokeThickness: 6
    }).setOrigin(0.5).setDepth(40);
    cena.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  },

  // Spray: nuvem de tinta sobre o muro enquanto a arte aparece
  spray(cena, muro, aoTerminar) {
    const duracao = this.menosMovimento() ? 200 : 1400;
    const c = Conteudo.centroMuro(muro);
    let e = null;
    if (!this.menosMovimento()) {
      const raio = Math.max(muro.width, muro.height) / 2;
      e = cena.add.particles(c.x, c.y, 'pingo', {
        x: { min: -raio, max: raio }, y: { min: -raio / 2, max: raio / 2 },
        speed: { min: 5, max: 40 }, scale: { start: 0.25, end: 1.1 }, alpha: { start: 0.9, end: 0 },
        lifespan: 500, frequency: 12, quantity: 3, frame: this.QUADROS
      }).setDepth(30);
    }
    cena.time.delayedCall(duracao, () => { if (e) { e.stop(); cena.time.delayedCall(600, () => e.destroy()); } aoTerminar(); });
    return duracao;
  },

  // Subiu de nível: flash suave e chuva de pingos em volta do jogador
  subiuNivel(cena, alvo) {
    if (this.menosMovimento()) return;
    cena.cameras.main.flash(350, 155, 226, 27);
    this.estouro(cena, alvo.x, alvo.y - 40, 50);
  }
};
