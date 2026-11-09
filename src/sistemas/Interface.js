// =============================================================================
// INTERFACE — ajudantes para montar as telas em HTML por cima do jogo
// -----------------------------------------------------------------------------
// O mapa é desenhado pelo Phaser (no <canvas>). Menus, fichas, quiz e
// Black Book são HTML comum dentro de <div id="ui">, com aparência definida
// em estilo/urbana.css. Isso facilita ler textos longos, rolar a tela e
// alterar o visual sem programar o Phaser.
//
// Principais funções:
//   Interface.el(tag, propriedades, ...filhos)  cria um elemento HTML
//   Interface.abrirPainel({...})                abre uma janela (painel)
//   Interface.confirmar({...})                  pergunta Sim/Não (devolve uma Promise)
//   Interface.avisar(texto)                     mensagem rápida no rodapé
//   Interface.algumAberto()                     true se há janela aberta
// =============================================================================
const Interface = {
  raiz: null,        // <div id="ui">
  pilha: [],         // janelas abertas (a última fica por cima)

  iniciar() {
    this.raiz = document.getElementById('ui');
    // Tecla Esc fecha a janela de cima
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && this.pilha.length) {
        const topo = this.pilha[this.pilha.length - 1];
        if (topo.fecharComEsc) { ev.preventDefault(); topo.fechar(); }
      }
    });
  },

  // Cria um elemento. Exemplo:
  //   Interface.el('button', { class: 'botao', onclick: () => ... }, 'Texto')
  // Use sempre textos como "filhos": eles entram como texto puro (seguro).
  el(tag, props, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'texto') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const f of filhos.flat()) {
      if (f === null || f === undefined || f === false) continue;
      e.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return e;
  },

  // Ícone por NOME (veja src/sistemas/Icones.js): um desenho SVG dentro de um <span>.
  icone(nome, classe) {
    const caixa = this.el('span', { class: classe, 'aria-hidden': 'true' });
    caixa.append(Icones.svg(nome));
    return caixa;
  },

  // Ícone + texto lado a lado (selos, etiquetas, avisos). Ex.: Interface.comIcone('cadeado', 'Nível 3')
  comIcone(nome, texto, classe) {
    return this.el('span', { class: 'com-icone' + (classe ? ' ' + classe : '') },
      this.icone(nome, 'com-icone-img'), this.el('span', {}, texto));
  },

  // Botão grande padrão. tipo: 'principal', 'secundario', 'perigo' ou 'fantasma'
  botao(texto, acao, opcoes = {}) {
    const b = this.el('button', {
      class: 'botao botao-' + (opcoes.tipo || 'secundario') + (opcoes.classe ? ' ' + opcoes.classe : ''),
      type: 'button',
      disabled: opcoes.desabilitado,
      'aria-label': opcoes.rotulo,
      onclick: (ev) => { if (!b.disabled) acao && acao(ev); }
    },
      opcoes.icone ? this.icone(opcoes.icone, 'botao-icone') : null,
      this.el('span', { class: 'botao-texto' }, texto),
      opcoes.detalhe ? this.el('small', { class: 'botao-detalhe' }, opcoes.detalhe) : null
    );
    return b;
  },

  // Abre uma janela sobre o jogo.
  //   titulo:       texto do topo
  //   conteudo:     elemento(s) HTML do corpo (rola se for comprido)
  //   rodape:       botões do rodapé (opcional)
  //   classe:       classe CSS extra (ex.: 'painel-largo')
  //   aoFechar:     função chamada quando a janela fecha
  //   botaoFechar:  mostra o X no canto (padrão: sim)
  //   fecharComEsc: Esc fecha (padrão: sim)
  abrirPainel(op) {
    const fundo = this.el('div', { class: 'fundo-painel' });
    const idTitulo = 'titulo-' + Math.random().toString(36).slice(2, 8);
    const painel = this.el('section', {
      class: 'painel ' + (op.classe || ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': idTitulo
    });
    const topo = this.el('header', { class: 'painel-topo' },
      this.el('h2', { class: 'titulo-grafite', id: idTitulo }, op.titulo || '')
    );
    const janela = { fecharComEsc: op.fecharComEsc !== false, elemento: painel, fechado: false };
    janela.fechar = () => {
      if (janela.fechado) return;
      janela.fechado = true;
      fundo.remove();
      this.pilha = this.pilha.filter(j => j !== janela);
      if (op.aoFechar) op.aoFechar();
      // devolve o foco para a janela de baixo, se houver
      const abaixo = this.pilha[this.pilha.length - 1];
      if (abaixo) this.focarPrimeiro(abaixo.elemento);
    };
    if (op.botaoFechar !== false) {
      topo.append(this.botao('Fechar', janela.fechar, { tipo: 'fantasma', icone: 'fechar', classe: 'botao-fechar', rotulo: 'Fechar' }));
    }
    const corpo = this.el('div', { class: 'painel-corpo' }, op.conteudo || []);
    painel.append(topo, corpo);
    if (op.rodape && op.rodape.length) painel.append(this.el('footer', { class: 'painel-rodape' }, op.rodape));
    fundo.append(painel);
    this.raiz.append(fundo);
    this.pilha.push(janela);
    janela.corpo = corpo;
    this.focarPrimeiro(painel);
    return janela;
  },

  focarPrimeiro(container) {
    const alvo = container.querySelector('[data-foco]') ||
      container.querySelector('.painel-rodape button:not([disabled]), .painel-corpo button:not([disabled]), button:not([disabled])');
    if (alvo) setTimeout(() => alvo.focus({ preventScroll: true }), 30);
  },

  // Pergunta de confirmação. Uso: if (await Interface.confirmar({ texto: '...' })) { ... }
  confirmar(op) {
    return new Promise((resolver) => {
      let resposta = false;
      const janela = this.abrirPainel({
        titulo: op.titulo || 'Confirmar',
        classe: 'painel-pequeno',
        conteudo: [this.el('p', { class: 'texto-confirmacao' }, op.texto || '')],
        rodape: [
          this.botao(op.nao || 'Cancelar', () => janela.fechar(), { tipo: 'secundario' }),
          this.botao(op.sim || 'Sim', () => { resposta = true; janela.fechar(); },
            { tipo: op.perigo ? 'perigo' : 'principal', icone: op.perigo ? 'alerta' : 'ok' })
        ],
        aoFechar: () => resolver(resposta)
      });
    });
  },

  // Mensagem rápida que some sozinha
  avisar(texto, tipo = 'info') {
    const caixa = this.el('div', { class: 'aviso-rapido aviso-' + tipo, role: 'status' }, texto);
    this.raiz.append(caixa);
    setTimeout(() => caixa.classList.add('saindo'), 2600);
    setTimeout(() => caixa.remove(), 3100);
  },

  // Faixa de conquista no alto da tela (recompensa, nível, missão, descoberta).
  // Várias seguidas entram numa fila e aparecem uma de cada vez.
  //   n = { tipo, titulo, texto, xp, latas, moldura, itens: [] }
  fila: [],
  notificar(n) {
    this.fila.push(n);
    if (this.fila.length === 1) this.mostrarProxima();
  },
  mostrarProxima() {
    const n = this.fila[0];
    if (!n) return;
    const E = this.el.bind(this);
    const icones = { recompensa: 'estrela', nivel: 'nivel', missao: 'ok', descoberta: 'alerta' };
    const linhas = [];
    if (n.texto) linhas.push(E('p', {}, n.texto));
    const chips = [];
    if (n.xp) chips.push(E('span', { class: 'chip chip-xp' }, `+${n.xp} XP`));
    if (n.latas) chips.push(E('span', { class: 'chip chip-latas' }, `+${n.latas} ${n.latas === 1 ? 'lata' : 'latas'}`));
    if (n.moldura) { const m = Conteudo.moldura(n.moldura); chips.push(E('span', { class: 'chip' }, 'Moldura: ' + (m ? m.nome : n.moldura))); }
    if (chips.length) linhas.push(E('div', { class: 'chips' }, chips));
    if (n.itens && n.itens.length) linhas.push(E('ul', { class: 'conquista-itens' }, n.itens.map(i => E('li', {}, 'Desbloqueado: ' + i))));
    const caixa = E('div', { class: 'conquista conquista-' + n.tipo, role: 'status', 'aria-live': 'polite' },
      this.icone(icones[n.tipo] || 'estrela', 'conquista-icone'),
      E('div', { class: 'conquista-corpo' }, E('strong', {}, n.titulo || ''), linhas));
    // fica por cima de tudo (inclusive das janelas)
    caixa.style.pointerEvents = 'none';
    this.raiz.append(caixa);
    const tempo = n.tipo === 'nivel' ? 4200 : 2600;
    setTimeout(() => caixa.classList.add('saindo'), tempo);
    const geracao = this.geracao;
    setTimeout(() => {
      caixa.remove();
      if (geracao !== this.geracao) return;   // a tela mudou nesse meio-tempo
      this.fila.shift(); this.mostrarProxima();
    }, tempo + 400);
  },

  algumAberto() { return this.pilha.length > 0; },

  fecharTodos() { [...this.pilha].reverse().forEach(j => j.fechar()); },

  // Remove tudo da camada de interface (usado ao trocar de cena)
  geracao: 0,
  limpar() { this.pilha = []; this.fila = []; this.geracao++; this.raiz.replaceChildren(); }
};
