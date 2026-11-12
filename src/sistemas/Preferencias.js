// =============================================================================
// PREFERÊNCIAS — configurações do computador (som, qualidade do mapa, acessibilidade)
// -----------------------------------------------------------------------------
// Ficam separadas das partidas: valem para todos os jogadores deste computador
// e não são apagadas quando alguém começa um novo jogo.
// =============================================================================
const Preferencias = {
  CHAVE: window.URBANA.PREFIXO_ARMAZENAMENTO + 'preferencias',

  PADRAO: {
    musica_ligada: true,
    volume_musica: 0.6,      // de 0 a 1
    efeitos_ligados: true,
    volume_efeitos: 0.8,     // de 0 a 1
    qualidade: null,         // null = usa o padrão de src/config.js; ou 'alta' / 'leve'
    movimento_reduzido: null,// null = segue o sistema; true/false = escolha do jogador
    controles_grandes: false,// joystick e botão A maiores
    anoitecer: true          // v2.40: o bairro escurece depois de alguns minutos jogando
  },

  valores: null,

  carregar() {
    let salvo = {};
    try { salvo = JSON.parse(localStorage.getItem(this.CHAVE)) || {}; } catch (e) { salvo = {}; }
    this.valores = Object.assign({}, this.PADRAO, salvo);
    this.aplicarNaPagina();
    return this.valores;
  },

  obter(nome) {
    if (!this.valores) this.carregar();
    return this.valores[nome];
  },

  definir(nome, valor) {
    if (!this.valores) this.carregar();
    this.valores[nome] = valor;
    try { localStorage.setItem(this.CHAVE, JSON.stringify(this.valores)); }
    catch (e) { console.warn('Não foi possível salvar as preferências:', e); }
    this.aplicarNaPagina();
  },

  // Animações decorativas desligadas? (escolha do jogador ou do sistema operacional)
  menosMovimento() {
    const v = this.obter('movimento_reduzido');
    if (v === true || v === false) return v;
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },

  // Aplica na página as preferências que mudam o visual (classes no <body>)
  aplicarNaPagina() {
    document.body.classList.toggle('menos-movimento', this.menosMovimento());
    document.body.classList.toggle('controles-grandes', !!this.obter('controles_grandes'));
  },

  // Qualidade do mapa em uso agora ('alta' ou 'leve')
  // Sem escolha do usuário: aparelhos com pouca memória (celulares e computadores fracos,
  // quando o navegador informa) usam a qualidade 'leve' para não travar.
  qualidadeMapa() {
    const escolhida = this.obter('qualidade');
    if (escolhida) return escolhida;
    if (navigator.deviceMemory && navigator.deviceMemory <= 3) return 'leve';
    return window.URBANA.QUALIDADE;
  }
};
