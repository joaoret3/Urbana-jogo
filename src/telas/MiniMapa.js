// =============================================================================
// MINI-MAPA — o bairro inteiro em miniatura, no canto superior esquerdo do HUD
// -----------------------------------------------------------------------------
// Mostra, sobre uma imagem reduzida do mapa (assets/mapa/minimapa.jpg):
//   - os grafites já visitados (azul) e os que têm o quiz concluído (verde);
//     os que ainda não foram descobertos NÃO aparecem (o aluno precisa explorar);
//   (v2.34: os muros livres não aparecem mais no mini-mapa, a pedido do professor)
//   - o jogador (ponto rosa) e a escola (ponto de partida).
// Clicar/tocar no mini-mapa (ou apertar N) amplia; clicar de novo diminui.
// O botão "–" esconde o mini-mapa (fica guardado nas preferências deste computador).
//
// A imagem minimapa.jpg é só uma cópia reduzida das peças do mapa original
// (assets/mapa/leve/); o mapa original não é alterado.
//
// A CenaMapa usa:
//   MiniMapa.montar(cena)     depois do HUD.montar
//   MiniMapa.atualizar(cena)  algumas vezes por segundo (no update da cena)
//   MiniMapa.alternar()       amplia/diminui (tecla N)
//   MiniMapa.destruir()       ao sair da cena
// =============================================================================
const MiniMapa = {
  IMAGEM: 'assets/mapa/minimapa.jpg',
  CHAVE_ESCONDIDO: 'minimapa_escondido',   // guardado no localStorage (com o prefixo do jogo)
  CORES: {
    jogador: '#ff3fbf', escola: '#ffffff',
    visitado: '#22d3ee', concluido: '#9be21b',
    contorno: '#0f0c14'
  },
  el: null,

  montar(cena) {
    const E = Interface.el.bind(Interface);
    const info = cena.info;   // pecas.json: largura e altura do mapa inteiro
    this.largura = info.largura; this.altura = info.altura;

    const img = E('img', { src: this.IMAGEM, alt: '', draggable: 'false' });
    // se a imagem faltar, fica um fundo escuro e o resto continua funcionando
    img.addEventListener('error', () => img.remove());
    const tela = E('canvas', { class: 'minimapa-tela', 'aria-hidden': 'true' });
    const quadro = E('button', {
      class: 'minimapa-quadro', type: 'button', title: 'Mini-mapa: clique para ampliar (N)',
      'aria-label': 'Mini-mapa do bairro. Clique para ampliar ou diminuir.',
      onclick: () => this.alternar()
    }, img, tela);
    quadro.style.aspectRatio = `${this.largura} / ${this.altura}`;
    const legenda = E('div', { class: 'minimapa-legenda' },
      this.itemLegenda('visitado', 'Grafite visitado'),
      this.itemLegenda('concluido', 'Quiz concluído'),
      this.itemLegenda('jogador', 'Você'),
      this.itemLegenda('escola', 'Escola', 'losango')
    );
    const esconder = E('button', { class: 'minimapa-esconder', type: 'button', title: 'Esconder mini-mapa', 'aria-label': 'Esconder mini-mapa', onclick: () => this.esconder(true) }, '–');
    const mostrar = E('button', { class: 'minimapa-mostrar', type: 'button', title: 'Mostrar mini-mapa', 'aria-label': 'Mostrar mini-mapa', onclick: () => this.esconder(false) }, Interface.icone('mapa', 'minimapa-mostrar-img'), E('small', {}, 'Mapa'));

    const bloco = E('section', { class: 'hud-bloco hud-minimapa', 'aria-label': 'Mini-mapa' }, quadro, esconder, legenda, mostrar);
    (HUD.elementos && HUD.elementos.raiz ? HUD.elementos.raiz : Interface.raiz).append(bloco);
    this.el = { bloco, quadro, tela, img };
    this._tam = null;
    this.esconder(this.lerEscondido(), true);
    this.posicionar();
    this.atualizar(cena);
  },

  itemLegenda(cor, texto, forma) {
    const E = Interface.el.bind(Interface);
    return E('span', {}, E('i', { class: forma || '', style: `background:${this.CORES[cor]}` }), texto);
  },

  lerEscondido() {
    try { return localStorage.getItem(window.URBANA.PREFIXO_ARMAZENAMENTO + this.CHAVE_ESCONDIDO) === '1'; } catch (e) { return false; }
  },

  esconder(sim, semGuardar) {
    if (!this.el) return;
    this.el.bloco.classList.toggle('escondido', !!sim);
    if (sim) this.el.bloco.classList.remove('ampliado');
    if (!semGuardar) {
      try { localStorage.setItem(window.URBANA.PREFIXO_ARMAZENAMENTO + this.CHAVE_ESCONDIDO, sim ? '1' : '0'); } catch (e) { /* sem armazenamento: só nesta sessão */ }
    }
    this._tam = null;
  },

  alternar() {
    if (!this.el) return;
    if (this.el.bloco.classList.contains('escondido')) { this.esconder(false); return; }
    const ampliado = this.el.bloco.classList.toggle('ampliado');
    this.el.quadro.title = ampliado ? 'Mini-mapa: clique para diminuir (N)' : 'Mini-mapa: clique para ampliar (N)';
    this._tam = null;
  },

  // Redesenha os marcadores. Chamado pela CenaMapa algumas vezes por segundo.
  atualizar(cena) {
    const el = this.el;
    if (!el || !cena.jogador || el.bloco.classList.contains('escondido')) return;
    const tela = el.tela;
    // ajusta a resolução do canvas ao tamanho na tela (nítido em telas de alta densidade)
    const w = el.quadro.clientWidth, h = el.quadro.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const chave = w + 'x' + h + 'x' + dpr;
    if (this._tam !== chave) { this._tam = chave; tela.width = Math.round(w * dpr); tela.height = Math.round(h * dpr); }
    const ctx = tela.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, tela.width, tela.height);
    const e = tela.width / this.largura;            // escala: mundo → mini-mapa
    const r = Math.max(2.5, Math.min(7, w / 40)) * dpr;   // raio dos marcadores
    const C = this.CORES;

    const bolinha = (x, y, raio, cor) => {
      ctx.beginPath(); ctx.arc(x * e, y * e, raio, 0, Math.PI * 2);
      ctx.fillStyle = cor; ctx.fill();
      ctx.lineWidth = Math.max(1, raio * 0.35); ctx.strokeStyle = C.contorno; ctx.stroke();
    };

    // grafites já visitados ou com quiz concluído (os não descobertos ficam escondidos)
    (cena.pins || []).forEach(pin => {
      const estado = ObjetosDoMapa.estadoPin(pin.grafite);
      if (estado === 'visitado' || estado === 'concluido') bolinha(pin.x, pin.y, r, C[estado]);
    });

    // escola (ponto de partida)
    const ini = Conteudo.mapa.inicio;
    if (ini) {
      const x = ini.x * e, y = ini.y * e, s = r * 1.1;
      ctx.beginPath(); ctx.moveTo(x, y - s * 1.3); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s * 1.3); ctx.lineTo(x - s, y); ctx.closePath();
      ctx.fillStyle = C.escola; ctx.fill(); ctx.lineWidth = Math.max(1, s * 0.35); ctx.strokeStyle = C.contorno; ctx.stroke();
    }

    // jogador (com um anel para achar fácil)
    const j = cena.jogador;
    ctx.beginPath(); ctx.arc(j.x * e, j.y * e, r * 1.9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,63,191,.30)'; ctx.fill();
    bolinha(j.x, j.y, r * 1.1, C.jogador);
  },

  // v2.34: o mini-mapa fica sempre um pouco ABAIXO da barra do jogador, qualquer que seja o tamanho
  // dela (celular, celular deitado, computador) — antes a posição era fixa e no celular eles encostavam.
  ESPACO: 12,
  posicionar() {
    const perfil = document.querySelector('.hud-perfil');
    if (!perfil || !this.el) return;
    const ajustar = () => {
      if (!this.el) return;
      const raiz = this.el.bloco.offsetParent || document.body;
      const fim = perfil.getBoundingClientRect().bottom - raiz.getBoundingClientRect().top;
      this.el.bloco.style.setProperty('--topo-minimapa', Math.round(fim + this.ESPACO) + 'px');
      this.el.bloco.classList.add('posicionado');
    };
    ajustar();
    requestAnimationFrame(ajustar);                    // depois das fontes e do retrato carregarem
    if (window.ResizeObserver) { this._obs = new ResizeObserver(ajustar); this._obs.observe(perfil, { box: 'border-box' }); }
    this._aoRedimensionar = ajustar;
    window.addEventListener('resize', ajustar);
  },

  destruir() {
    if (this._obs) { this._obs.disconnect(); this._obs = null; }
    if (this._aoRedimensionar) { window.removeEventListener('resize', this._aoRedimensionar); this._aoRedimensionar = null; }
    if (this.el && this.el.bloco) this.el.bloco.remove();
    this.el = null; this._tam = null;
  }
};
