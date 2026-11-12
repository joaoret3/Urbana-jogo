// =============================================================================
// LUZ DO BAIRRO — anoitecer durante o jogo (v2.40, luz "L3 crepúsculo com postes acesos")
// -----------------------------------------------------------------------------
// A partida começa de dia. Depois de alguns minutos jogando (dados/jogo.js → "anoitecer"),
// o bairro escurece aos poucos para o crepúsculo (roxo, bordas mais escuras, um resto de
// laranja no alto) e os postes acendem. Desde a v2.41 o ciclo se repete: depois de alguns
// minutos de noite amanhece aos poucos e o dia recomeça. Ao abrir o mapa de novo, começa de dia.
//
// Como é feito: 2 camadas fixas na tela, por cima do bairro e embaixo dos balões dos
// personagens (uma escurece/tinge, a outra dá o brilho quente) + um brilho em cada poste.
// O mapa original não muda. O HUD e as janelas (HTML) não são afetados.
// Dá para desligar em Configurações ("Anoitecer durante o jogo").
//
//   Luz.criar(cena)             depois do Detalhes.criar (usa os blocos dos postes)
//   Luz.atualizar(cena, delta)  a cada quadro
// =============================================================================
const Luz = {
  PROFUNDIDADE: 45,        // acima dos postes (30-31) e dos personagens; abaixo dos balões dos NPCs (59-60)
  // Centro da luminária (a parte amarela) na imagem assets/ui/poste.png, em fração da largura/altura.
  // A luz é posta ali, girada junto com o braço do poste (mesma origem e escala do Detalhes).
  LAMPADA_X: 167 / 192,
  LAMPADA_Y: 26 / 60,

  config() {
    const a = (Conteudo.jogo() || {}).anoitecer || {};
    return {
      ativo: a.ativo !== false,
      minutos: Math.max(0, Number(a.minutos_para_anoitecer ?? 5)),
      transicao: Math.max(0.05, Number(a.minutos_transicao ?? 1)),
      noite: Math.max(0, Number(a.minutos_de_noite ?? 3)),
      repetir: a.repetir !== false
    };
  },

  // v2.41: ciclo dia → anoitecer → noite → amanhecer → dia... (0 = dia, 1 = noite)
  // Sem "repetir", fica de noite depois de anoitecer (como na v2.40).
  nivelNoTempo(minutos, c) {
    if (!c.repetir) return Phaser.Math.Clamp((minutos - c.minutos) / c.transicao, 0, 1);
    const ciclo = c.minutos + c.transicao + c.noite + c.transicao;
    const m = minutos % ciclo;
    if (m < c.minutos) return 0;                                        // dia
    if (m < c.minutos + c.transicao) return (m - c.minutos) / c.transicao;   // anoitecendo
    if (m < c.minutos + c.transicao + c.noite) return 1;                // noite
    return 1 - (m - c.minutos - c.transicao - c.noite) / c.transicao;   // amanhecendo
  },
  ligada() { return this.config().ativo && Preferencias.obter('anoitecer') !== false; },

  // Texturas pequenas (a tela inteira é coberta esticando): uma para escurecer (multiplicar) e uma de brilho (somar)
  texturas(cena) {
    const criar = (k, w, h, desenhar) => {
      if (cena.textures.exists(k)) return;
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      desenhar(cv.getContext('2d'), w, h); cena.textures.addCanvas(k, cv);
    };
    criar('luz_noite', 256, 144, (ctx, w, h) => {
      let g = ctx.createLinearGradient(0, 0, 0, h);              // céu indo para o roxo
      g.addColorStop(0, '#b39acb'); g.addColorStop(1, '#7d6fa8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'multiply';                 // bordas mais escuras (vinheta), já embutidas
      g = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.6);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#6a5d8f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    criar('luz_brilho', 256, 144, (ctx, w, h) => {               // resto de laranja do pôr do sol, no alto
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,140,90,0.28)'); g.addColorStop(0.4, 'rgba(255,120,90,0)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    criar('luz_poste', 256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,200,110,0.95)'); g.addColorStop(0.25, 'rgba(255,160,70,0.5)'); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
  },

  criar(cena) {
    const B = Phaser.BlendModes;
    this.texturas(cena);
    cena.luz = { tempo: 0, nivel: -1 };
    const tela = (k, modo) => cena.add.image(0, 0, k).setOrigin(0).setScrollFactor(0)
      .setDepth(this.PROFUNDIDADE).setBlendMode(modo).setAlpha(0).setVisible(false);
    cena.luz.noite = tela('luz_noite', B.MULTIPLY);
    cena.luz.brilho = tela('luz_brilho', B.ADD).setDepth(this.PROFUNDIDADE + 1);
    // um brilho por poste, guardado no bloco do poste (o Detalhes mostra/esconde os blocos longe da tela)
    cena.luz.postes = [];
    const postes = (window.URBANA_DETALHES && window.URBANA_DETALHES.postes) || [];
    const fonte = cena.textures.exists('poste') ? cena.textures.get('poste').getSourceImage() : { width: 192, height: 60 };
    const ax = (this.LAMPADA_X - Detalhes.ORIGEM_POSTE) * fonte.width * Detalhes.ESCALA_POSTE;   // ao longo do braço
    const ay = (this.LAMPADA_Y - 0.5) * fonte.height * Detalhes.ESCALA_POSTE;                    // para o lado
    postes.forEach(p => {
      const a = (Number(p.braco) || 0) * Math.PI / 180, cos = Math.cos(a), sen = Math.sin(a);
      const x = p.x + cos * ax - sen * ay, y = p.y + sen * ax + cos * ay;
      const halo = cena.add.image(x, y, 'luz_poste').setScale(1.6).setBlendMode(B.ADD).setDepth(this.PROFUNDIDADE + 1).setAlpha(0);
      const nucleo = cena.add.image(x, y, 'luz_poste').setScale(0.4).setBlendMode(B.ADD).setDepth(this.PROFUNDIDADE + 2).setAlpha(0);
      cena.luz.postes.push(halo, nucleo);
      const k = Math.floor(p.x / Detalhes.BLOCO) + ',' + Math.floor(p.y / Detalhes.BLOCO);
      const bloco = cena.blocosDetalhes && cena.blocosDetalhes.get(k);
      if (bloco) { bloco.postes.push(halo, nucleo); halo.setVisible(!!bloco.visivel); nucleo.setVisible(!!bloco.visivel); }
    });
    this.ajustarTela(cena);
  },

  // As camadas fixas acompanham o zoom e o tamanho da tela
  ajustarTela(cena) {
    const cam = cena.cameras.main, L = cena.luz;
    const w = cam.width / cam.zoom, h = cam.height / cam.zoom;
    const x = (cam.width - w) / 2, y = (cam.height - h) / 2;
    [L.noite, L.brilho].forEach(i => i.setPosition(x, y).setDisplaySize(w, h));
    L.zoom = cam.zoom; L.w = cam.width; L.h = cam.height;
  },

  atualizar(cena, delta) {
    const L = cena.luz; if (!L) return;
    const c = this.config();
    if (this.ligada()) L.tempo += Math.min(delta || 0, 250);   // aba escondida ou travada não conta de uma vez
    const minutos = L.tempo / 60000;
    const nivel = this.ligada() ? Phaser.Math.Clamp(this.nivelNoTempo(minutos, c), 0, 1) : 0;
    const cam = cena.cameras.main;
    if (cam.zoom !== L.zoom || cam.width !== L.w || cam.height !== L.h) this.ajustarTela(cena);
    if (Math.abs(nivel - L.nivel) < 0.002) return;
    L.nivel = nivel;
    const ver = nivel > 0;
    L.noite.setVisible(ver).setAlpha(nivel);
    L.brilho.setVisible(ver).setAlpha(nivel);
    // os postes acendem na segunda metade da transição
    const acesa = Phaser.Math.Clamp(nivel * 2 - 1, 0, 1);
    L.postes.forEach((i, n) => i.setAlpha(n % 2 ? acesa : acesa * 0.85));
  }
};
