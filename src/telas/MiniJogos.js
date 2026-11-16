// =============================================================================
// MINI-JOGOS (v2.54) — desafios das missões do tipo "mini_jogo"
// -----------------------------------------------------------------------------
// Um personagem do bairro (ou uma missão comum) propõe um desafio. O jogador joga numa
// janela por cima do mapa. Vencer conclui a missão e entrega a recompensa, que pode ser
// uma arte do Black Book que só se ganha ali (recompensa.arte em dados/missoes.js).
// Perdeu? Pode tentar de novo quantas vezes quiser. Depois de vencer, dá para jogar de
// novo por diversão, sem ganhar outra vez.
//
// Na missão (dados/missoes.js):
//   "tipo": "mini_jogo", "meta": 1,
//   "mini_jogo": { "jogo": "quebra_cabeca", "dificuldade": "normal" },
//   "recompensa": { "arte": "arte_016" }
//
// Jogos:  quebra_cabeca · memoria · sequencia · pintar · cores      (Conteudo.MINI_JOGOS)
// Dificuldades:  facil · normal · dificil
//
//   MiniJogos.abrir(missao, { aoFechar })
//
// Tudo é feito com HTML (sem ler os pixels da arte), para funcionar também abrindo o
// jogo direto do arquivo index.html e em tablets antigos.
// =============================================================================
const MiniJogos = {
  NOMES: {
    quebra_cabeca: 'Quebra-cabeça do grafite', memoria: 'Memória das latas', sequencia: 'Siga o spray',
    pintar: 'Pinte o muro', cores: 'Mistura de cores'
  },
  COMO: {
    quebra_cabeca: 'Toque em duas peças para trocá-las de lugar. Peça no lugar certo fica presa.',
    memoria: 'Vire duas cartas por vez e ache os pares iguais.',
    sequencia: 'Veja a ordem em que as latas piscam e repita tocando nelas.',
    pintar: 'Arraste o dedo no muro para passar o spray e revelar a arte antes de o tempo acabar.',
    cores: 'Escolha as duas latas que, misturadas, dão a cor pedida.'
  },
  CORES: ['#ff3fbf', '#22d3ee', '#9be21b', '#ffe14d', '#ff7a1a', '#7b3bea', '#ffffff'],

  nome(jogo) { return this.NOMES[jogo] || 'Desafio'; },
  config(m) {
    const c = m.mini_jogo || {};
    return { jogo: Conteudo.MINI_JOGOS.includes(c.jogo) ? c.jogo : 'quebra_cabeca', nivel: Conteudo.DIFICULDADES.includes(c.dificuldade) ? c.dificuldade : 'normal' };
  },
  // A arte mostrada no desafio: a arte-prêmio da missão (ou, se não houver, a primeira arte publicada)
  arteDe(m) {
    const r = m.recompensa || {};
    return (r.arte && Conteudo.arte(r.arte)) || Conteudo.artesPublicadas()[0] || null;
  },

  // Desenho de uma lata de spray na cor pedida (SVG fixo, sem texto de fora)
  lata(cor) {
    const s = document.createElement('span'); s.className = 'mj-lata'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 40 80"><rect x="15" y="2" width="10" height="9" rx="2" fill="#ddd" stroke="#0f0c14" stroke-width="3"/>' +
      '<rect x="11" y="10" width="18" height="8" rx="3" fill="#888" stroke="#0f0c14" stroke-width="3"/>' +
      '<rect x="5" y="17" width="30" height="60" rx="7" fill="' + cor + '" stroke="#0f0c14" stroke-width="3"/>' +
      '<rect x="5" y="34" width="30" height="16" fill="rgba(255,255,255,.35)"/></svg>';
    return s;
  },
  embaralhar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; },

  abrir(m, op) {
    op = op || {};
    const E = Interface.el.bind(Interface), cfg = this.config(m), arte = this.arteDe(m);
    const placar = E('p', { class: 'mj-placar', role: 'status' });
    const area = E('div', { class: 'mj-area' }), caixa = E('div', { class: 'mj-caixa' }, area);
    let parar = function () {}, janela, fechado = false;

    // tamanho do tabuleiro: proporção (largura / altura) e limite para caber em telas baixas
    const proporcao = (r) => {
      caixa.style.setProperty('--mj-r', r.toFixed(3));   // o CSS usa para o tabuleiro caber na altura da tela
      area.style.paddingBottom = (100 / r).toFixed(2) + '%';
    };

    const tela = (classe, titulo, texto, botoes, imagem) => {
      const t = E('div', { class: 'mj-fim ' + classe },
        E('strong', {}, titulo), imagem ? E('img', { src: imagem, alt: '' }) : null, texto ? E('span', {}, texto) : null, E('div', { class: 'mj-fim-botoes' }, botoes));
      area.append(t);
      const b = t.querySelector('button'); if (b) b.focus();
    };
    const venceu = () => {
      if (fechado) return;
      parar();
      const primeira = Progresso.vencerMiniJogo(m.id);
      Sons.tocar('missao');
      const premio = (m.recompensa || {}).arte && Conteudo.arte(m.recompensa.arte);
      HUD.atualizar();
      tela('mj-vitoria', primeira && premio ? 'Arte desbloqueada!' : 'Você venceu!',
        primeira ? (premio ? '"' + premio.titulo + '" agora está no seu Black Book.' : 'Desafio concluído!') : 'Você já tinha vencido este desafio. Valeu pela revanche!',
        [Interface.botao('Continuar', () => janela.fechar(), { tipo: 'principal', icone: 'ok' })], arte && arte.imagem);
    };
    const perdeu = (texto) => {
      if (fechado) return;
      parar(); Sons.tocar('erro');
      tela('mj-derrota', 'Quase!', texto, [Interface.botao('Tentar de novo', () => comecar(), { tipo: 'principal', icone: 'play' })]);
    };
    const comecar = () => {
      parar(); parar = function () {};
      area.className = 'mj-area mj-' + cfg.jogo; area.replaceChildren(); placar.textContent = '';
      const fim = this['jogo_' + cfg.jogo]({ area, placar, arte, nivel: cfg.nivel, proporcao, venceu, perdeu });
      if (typeof fim === 'function') parar = fim;
    };

    janela = Interface.abrirPainel({
      titulo: this.nome(cfg.jogo),
      classe: 'painel-minijogo',
      conteudo: [E('p', { class: 'mj-como' }, this.COMO[cfg.jogo]), placar, caixa],
      rodape: [
        Interface.botao('Sair', () => janela.fechar(), { icone: 'voltar' }),
        Interface.botao('Recomeçar', () => comecar(), { icone: 'play' })
      ],
      aoFechar: () => { fechado = true; parar(); if (op.aoFechar) op.aoFechar(); }
    });
    comecar();
    return janela;
  },

  // ---------------------------------------------------------------------------
  // QUEBRA-CABEÇA: a arte em peças embaralhadas; toca em duas para trocar
  // ---------------------------------------------------------------------------
  jogo_quebra_cabeca(j) {
    const E = Interface.el.bind(Interface);
    const grade = { facil: [3, 2], normal: [4, 3], dificil: [5, 4] }[j.nivel], col = grade[0], lin = grade[1], n = col * lin;
    const tab = E('div', { class: 'mj-pecas', style: { gridTemplateColumns: 'repeat(' + col + ', 1fr)', gridTemplateRows: 'repeat(' + lin + ', 1fr)' } });
    j.area.append(tab);
    j.proporcao(1.414);
    if (j.arte) { const im = new Image(); im.onload = () => { if (im.naturalWidth && im.naturalHeight) j.proporcao(im.naturalWidth / im.naturalHeight); }; im.src = j.arte.imagem; }
    let ordem;
    do { ordem = this.embaralhar(Array.from({ length: n }, (x, i) => i)); } while (ordem.every((v, i) => v === i));
    let sel = null, trocas = 0, acabou = false;
    // a arte fica sobre um "muro" em degradê, para as peças sem desenho também serem diferentes umas das outras
    const fundo = (j.arte ? 'url("' + j.arte.imagem + '"), ' : '') + 'linear-gradient(45deg, rgba(255,255,255,.28), rgba(0,0,0,.3)), linear-gradient(135deg, #d8793f, #7d3f5c)';
    const desenhar = () => {
      tab.replaceChildren.apply(tab, ordem.map((v, i) => {
        const certa = v === i;
        const b = E('button', { type: 'button', class: 'mj-peca' + (sel === i ? ' sel' : '') + (certa ? ' certa' : ''), 'aria-label': 'Peça ' + (i + 1) + (certa ? ', no lugar certo' : ''), disabled: certa || acabou });
        b.style.backgroundImage = fundo;
        b.style.backgroundSize = (col * 100) + '% ' + (lin * 100) + '%';
        b.style.backgroundPosition = ((v % col) / (col - 1) * 100) + '% ' + (Math.floor(v / col) / (lin - 1) * 100) + '%';
        b.addEventListener('click', () => {
          if (acabou) return;
          if (sel === null) sel = i;
          else if (sel === i) sel = null;
          else {
            const t = ordem[sel]; ordem[sel] = ordem[i]; ordem[i] = t; sel = null; trocas++;
            Sons.tocar(ordem[i] === i ? 'acerto' : 'lata');
          }
          acabou = ordem.every((x, k) => x === k);
          j.placar.textContent = 'Trocas: ' + trocas + ' · no lugar: ' + ordem.filter((x, k) => x === k).length + ' de ' + n;
          desenhar();
          if (acabou) setTimeout(j.venceu, 450);
        });
        return b;
      }));
    };
    j.placar.textContent = 'Trocas: 0 · no lugar: ' + ordem.filter((x, k) => x === k).length + ' de ' + n;
    desenhar();
  },

  // ---------------------------------------------------------------------------
  // MEMÓRIA: pares de latas da mesma cor (um dos pares é a arte)
  // ---------------------------------------------------------------------------
  jogo_memoria(j) {
    const E = Interface.el.bind(Interface);
    const pares = { facil: 4, normal: 6, dificil: 8 }[j.nivel], lin = pares / 2;
    j.proporcao(4 / lin * 1.15);
    const tipos = this.CORES.slice(0, pares - (j.arte ? 1 : 0)); if (j.arte) tipos.push('ARTE');
    const cartas = this.embaralhar(tipos.concat(tipos));
    const tab = E('div', { class: 'mj-cartas', style: { gridTemplateRows: 'repeat(' + lin + ', 1fr)' } });
    j.area.append(tab);
    let abertas = [], feitos = 0, tent = 0, trava = false, relogio = null;
    const frente = (tipo) => tipo === 'ARTE' ? E('img', { src: j.arte.imagem, alt: 'arte' }) : this.lata(tipo);
    cartas.forEach((tipo, i) => {
      const b = E('button', { type: 'button', class: 'mj-carta', 'aria-label': 'Carta ' + (i + 1) }, '?');
      b.addEventListener('click', () => {
        if (trava || b.classList.contains('aberta') || b.classList.contains('feita')) return;
        b.classList.add('aberta'); b.replaceChildren(frente(tipo)); abertas.push({ b, tipo });
        if (abertas.length < 2) return;
        tent++; j.placar.textContent = 'Tentativas: ' + tent + ' · pares: ' + feitos + ' de ' + pares;
        const x = abertas[0], y = abertas[1]; abertas = [];
        if (x.tipo === y.tipo) {
          x.b.classList.add('feita'); y.b.classList.add('feita'); feitos++; Sons.tocar('acerto');
          j.placar.textContent = 'Tentativas: ' + tent + ' · pares: ' + feitos + ' de ' + pares;
          if (feitos === pares) relogio = setTimeout(j.venceu, 500);
        } else {
          trava = true;
          relogio = setTimeout(() => { [x, y].forEach(c => { c.b.classList.remove('aberta'); c.b.textContent = '?'; }); trava = false; }, 850);
        }
      });
      tab.append(b);
    });
    j.placar.textContent = 'Tentativas: 0 · pares: 0 de ' + pares;
    return () => clearTimeout(relogio);
  },

  // ---------------------------------------------------------------------------
  // SEQUÊNCIA: as latas piscam numa ordem; o jogador repete
  // ---------------------------------------------------------------------------
  jogo_sequencia(j) {
    const E = Interface.el.bind(Interface);
    const rodadas = { facil: 4, normal: 5, dificil: 7 }[j.nivel], ms = { facil: 520, normal: 420, dificil: 320 }[j.nivel];
    j.proporcao(1.6);
    const linha = E('div', { class: 'mj-latas' }); j.area.append(linha);
    const bts = this.CORES.slice(0, 4).map((c, i) => { const b = E('button', { type: 'button', class: 'mj-lata-bt', 'aria-label': 'Lata ' + (i + 1) }, this.lata(c)); linha.append(b); return b; });
    let seq = [], pos = 0, ouvindo = false, vivo = true;
    const espera = (t) => new Promise(r => setTimeout(r, t));
    const piscar = (i, t) => { bts[i].classList.add('acesa'); return espera(t).then(() => { bts[i].classList.remove('acesa'); return espera(150); }); };
    const rodada = () => {
      ouvindo = false; seq.push(Math.floor(Math.random() * 4));
      j.placar.textContent = 'Rodada ' + seq.length + ' de ' + rodadas + ' · observe';
      let fila = espera(650);
      seq.forEach(i => { fila = fila.then(() => vivo ? piscar(i, ms) : null); });
      fila.then(() => { if (!vivo) return; pos = 0; ouvindo = true; j.placar.textContent = 'Rodada ' + seq.length + ' de ' + rodadas + ' · sua vez'; });
    };
    bts.forEach((b, i) => b.addEventListener('click', () => {
      if (!ouvindo || !vivo) return;
      piscar(i, 170);
      if (seq[pos] !== i) { ouvindo = false; return j.perdeu('A ordem não era essa. Observe de novo.'); }
      Sons.tocar('lata');
      if (++pos === seq.length) { ouvindo = false; if (seq.length === rodadas) setTimeout(j.venceu, 400); else setTimeout(() => { if (vivo) rodada(); }, 500); }
    }));
    rodada();
    return () => { vivo = false; };
  },

  // ---------------------------------------------------------------------------
  // PINTAR: o muro cinza cobre a arte; o spray apaga o cinza
  // ---------------------------------------------------------------------------
  jogo_pintar(j) {
    const E = Interface.el.bind(Interface);
    const total = { facil: 45, normal: 30, dificil: 20 }[j.nivel], META = 0.85, W = 480;
    let H = 340, tempo = total, pintando = false, acabou = false, ctx = null;
    const img = j.arte ? E('img', { class: 'mj-pintar-arte', src: j.arte.imagem, alt: '' }) : null;
    const cv = E('canvas', { class: 'mj-pintar-muro', 'aria-label': 'Muro para pintar' });
    j.area.append(E('div', { class: 'mj-pintar-fundo' }), img, cv);
    const preparar = (r) => {
      j.proporcao(r); H = Math.round(W / r); cv.width = W; cv.height = H; ctx = cv.getContext('2d');
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#8d8794'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 2;
      for (let y = 0, k = 0; y < H; y += 28, k++) for (let x = (k % 2) * 30 - 30; x < W; x += 60) ctx.strokeRect(x, y, 60, 28);
      ctx.globalCompositeOperation = 'destination-out';
    };
    preparar(1.414);
    if (img) img.addEventListener('load', () => { if (img.naturalWidth && img.naturalHeight && tempo === total) preparar(img.naturalWidth / img.naturalHeight); });
    const spray = (ev) => {
      if (!pintando || acabou) return;
      const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H, raio = 34;
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.fill();
      ev.preventDefault();
    };
    cv.addEventListener('pointerdown', (ev) => { pintando = true; if (cv.setPointerCapture) cv.setPointerCapture(ev.pointerId); Sons.tocar('spray'); spray(ev); });
    cv.addEventListener('pointermove', spray);
    const soltar = () => { pintando = false; };
    cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', soltar);
    const medir = () => {   // parte do muro já pintada (o muro é só tinta do jogo: dá para ler os pontos em qualquer aparelho)
      let d; try { d = ctx.getImageData(0, 0, W, H).data; } catch (e) { return 0; }
      let v = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 23) { n++; if (d[i] < 90) v++; } return n ? v / n : 0;
    };
    const mostrar = (p) => { j.placar.textContent = 'Tempo: ' + Math.ceil(tempo) + ' s · pintado: ' + Math.round(p * 100) + '% (meta ' + Math.round(META * 100) + '%)'; };
    mostrar(0);
    const relogio = setInterval(() => {
      if (acabou) return;
      tempo -= 0.5; const p = medir(); mostrar(p);
      // vale o número que o jogador vê no placar
      if (Math.round(p * 100) >= Math.round(META * 100)) { acabou = true; ctx.clearRect(0, 0, W, H); setTimeout(j.venceu, 500); }
      else if (tempo <= 0) { acabou = true; j.perdeu('O tempo acabou antes de cobrir o muro.'); }
    }, 500);
    return () => { acabou = true; clearInterval(relogio); };
  },

  // ---------------------------------------------------------------------------
  // CORES: escolher as duas latas que formam a cor pedida
  // ---------------------------------------------------------------------------
  jogo_cores(j) {
    const E = Interface.el.bind(Interface);
    const base = [['Vermelho', '#e5252a'], ['Amarelo', '#ffd91a'], ['Azul', '#1e63e9'], ['Branco', '#f5f5f5'], ['Preto', '#1b1b1f']];
    const todos = [['Laranja', '#ff8a1a', 'Vermelho', 'Amarelo'], ['Verde', '#2fb344', 'Amarelo', 'Azul'], ['Roxo', '#8a3bd6', 'Vermelho', 'Azul'],
      ['Rosa', '#ff8fb0', 'Vermelho', 'Branco'], ['Cinza', '#8b8b93', 'Preto', 'Branco'], ['Azul-claro', '#8fc3ff', 'Azul', 'Branco'], ['Vinho', '#7a1626', 'Vermelho', 'Preto']];
    const quantos = { facil: 3, normal: 5, dificil: 7 }[j.nivel];
    const pedidos = (j.nivel === 'dificil' ? this.embaralhar(todos.slice()) : this.embaralhar(todos.slice(0, 5))).slice(0, quantos);
    j.proporcao(1.5);
    const alvo = E('div', { class: 'mj-alvo' }), linha = E('div', { class: 'mj-latas' }); j.area.append(alvo, linha);
    let n = 0, erros = 0, esc = [], relogio = null;
    const bts = base.map(c => { const b = E('button', { type: 'button', class: 'mj-lata-bt' }, this.lata(c[1]), E('span', { class: 'mj-lata-nome' }, c[0])); b.dataset.n = c[0]; linha.append(b); return b; });
    const pedir = () => {
      esc = []; bts.forEach(b => b.classList.remove('escolhida'));
      alvo.replaceChildren(E('i', { style: { background: pedidos[n][1] } }), E('span', {}, 'Faça ' + pedidos[n][0].toUpperCase()));
      j.placar.textContent = 'Pedido ' + (n + 1) + ' de ' + quantos + ' · erros: ' + erros;
    };
    bts.forEach(b => b.addEventListener('click', () => {
      if (esc.length === 2 || esc.includes(b.dataset.n)) return;
      esc.push(b.dataset.n); b.classList.add('escolhida');
      if (esc.length < 2) return;
      relogio = setTimeout(() => {
        const p = pedidos[n];
        if (esc.includes(p[2]) && esc.includes(p[3])) { Sons.tocar('acerto'); if (++n === quantos) return j.venceu(); }
        else { erros++; Sons.tocar('erro'); }
        pedir();
      }, 550);
    }));
    pedir();
    return () => clearTimeout(relogio);
  }
};
