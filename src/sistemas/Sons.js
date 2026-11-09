// =============================================================================
// SONS — música de fundo e efeitos sonoros
// -----------------------------------------------------------------------------
// Os arquivos ficam em assets/audio e a lista está em dados/jogo.js:
//   "musica": "assets/audio/musica_lofi.mp3",
//   "sons": { "lata": "...", "spray": "...", "acerto": "...", ... }
// Para trocar um som, substitua o arquivo (ou o caminho no jogo.js).
// Liga/desliga e volume ficam em Configurações (sistemas/Preferencias.js).
// O jogo funciona igual sem som: tudo também aparece em texto na tela.
// =============================================================================
const Sons = {
  jogo: null,
  musicaAtual: null,

  // Carrega os arquivos de som (chamado pela CenaCarga)
  carregar(cena) {
    this.jogo = cena.game;
    const j = Conteudo.jogo();
    const sons = j.sons || {};
    let pedidos = 0;
    for (const [nome, arquivo] of Object.entries(sons)) {
      if (nome.startsWith('_')) continue;
      cena.load.audio('som_' + nome, arquivo); pedidos++;
    }
    if (j.musica) { cena.load.audio('musica', j.musica); pedidos++; }
    if (!pedidos) return Promise.resolve();
    return new Promise((resolver) => {
      cena.load.once('complete', resolver);
      cena.load.start();
    });
  },

  // Toca um efeito sonoro pelo nome (ex.: Sons.tocar('lata'))
  tocar(nome) {
    if (!this.jogo || !Preferencias.obter('efeitos_ligados')) return;
    const chave = 'som_' + nome;
    if (!this.jogo.cache.audio.exists(chave)) return;
    try { this.jogo.sound.play(chave, { volume: Preferencias.obter('volume_efeitos') }); } catch (e) { /* sem som */ }
  },

  // Começa (ou mantém) a música de fundo
  iniciarMusica() {
    if (!this.jogo || !this.jogo.cache.audio.exists('musica')) return;
    if (!this.musicaAtual) this.musicaAtual = this.jogo.sound.add('musica', { loop: true });
    this.aplicarPreferencias();
  },

  // Se a música não pôde começar ainda, tenta de novo no primeiro clique ou tecla
  tentarDepoisDoClique() {
    if (this._esperandoClique) return;
    this._esperandoClique = true;
    const tentar = () => {
      document.removeEventListener('pointerdown', tentar, true);
      document.removeEventListener('keydown', tentar, true);
      this._esperandoClique = false;
      setTimeout(() => this.aplicarPreferencias(), 50);
    };
    document.addEventListener('pointerdown', tentar, true);
    document.addEventListener('keydown', tentar, true);
  },

  // Aplica liga/desliga e volume da música (chamado também pela tela de Configurações)
  aplicarPreferencias() {
    const m = this.musicaAtual;
    if (!m) return;
    m.setVolume(Preferencias.obter('volume_musica') * 0.6);
    const ligada = Preferencias.obter('musica_ligada');
    if (ligada && !m.isPlaying) {
      // o navegador só deixa tocar som depois do primeiro clique ou tecla
      if (this.jogo.sound.locked) this.jogo.sound.once('unlocked', () => this.aplicarPreferencias());
      else m.play();
      if (!m.isPlaying) this.tentarDepoisDoClique();
    } else if (!ligada && m.isPlaying) m.stop();
  }
};
