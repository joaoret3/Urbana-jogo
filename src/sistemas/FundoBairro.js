// =============================================================================
// FUNDO DO BAIRRO — pedaço do mapa em volta da escola, passeando devagar
// Usado no fundo do menu principal e da seleção de avatar.
// Uso dentro de uma cena:  FundoBairro.montar(this);
// =============================================================================
const FundoBairro = {
  montar(cena) {
    const info = cena.cache.json.get('pecas');
    const escola = Conteudo.mapa.inicio || { x: info.largura / 2, y: info.altura / 2 };
    const raio = 1500; // distância (em px do mapa) em volta da escola que aparece no fundo
    const perto = info.pecas.filter(p =>
      p.x < escola.x + raio && p.x + p.largura > escola.x - raio &&
      p.y < escola.y + raio && p.y + p.altura > escola.y - raio);

    const mostrar = (chave) => {
      const p = perto.find(q => 'fundo_' + q.nome === chave);
      if (p) cena.add.image(p.x, p.y, chave, CenaMapa.quadroSemBorda(cena, chave)).setOrigin(0, 0).setDisplaySize(p.largura, p.altura);
    };
    let pedidos = 0;
    perto.forEach(p => {
      const chave = 'fundo_' + p.nome;
      // as imagens do fundo ficam na memória entre o menu e a seleção de avatar
      if (cena.textures.exists(chave)) mostrar(chave);
      else { cena.load.image(chave, 'assets/mapa/leve/' + p.nome); pedidos++; }
    });
    cena.load.on('filecomplete', mostrar);
    cena.events.once('shutdown', () => cena.load.off('filecomplete', mostrar));
    if (pedidos) cena.load.start();

    const cam = cena.cameras.main;
    cam.setBackgroundColor('#17141d');
    cam.setZoom(Math.max(cena.scale.width / 2400, cena.scale.height / 1800, 0.45));
    cam.centerOn(escola.x, escola.y);
    // passeio lento da câmera (desligado se o sistema pedir menos movimento)
    if (!Preferencias.menosMovimento()) {
      const alvo = { t: (Date.now() / 90000 % 1) * Math.PI * 2 };   // continua de onde estava
      cena.tweens.add({
        targets: alvo, t: alvo.t + Math.PI * 2, duration: 90000, repeat: -1,
        onUpdate: () => cam.centerOn(escola.x + Math.cos(alvo.t) * 380, escola.y + Math.sin(alvo.t) * 260)
      });
    }
  },

  // Libera a memória das imagens do fundo (chamado ao entrar no mapa)
  liberar(cena) {
    cena.textures.getTextureKeys().filter(k => k.startsWith('fundo_')).forEach(k => cena.textures.remove(k));
  }
};
