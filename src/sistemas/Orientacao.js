// =============================================================================
// ORIENTAÇÃO — no celular e no tablet o jogo é sempre jogado deitado
// -----------------------------------------------------------------------------
// 1. Com a tela em pé, o aviso "Vire o aparelho" (<div id="aviso-girar"> do index.html)
//    cobre tudo. Quem mostra e esconde o aviso é o CSS (estilo/urbana.css), então ele
//    aparece já na abertura e some sozinho quando o aparelho é virado.
// 2. No primeiro toque, o jogo tenta entrar em tela cheia e travar a tela deitada
//    (funciona no Chrome do Android; o iPhone não permite, e por isso existe o aviso).
//    Se o navegador recusar, nada acontece: o aviso continua funcionando.
// Só vale para aparelhos de toque (celular/tablet). No computador, nada muda.
// =============================================================================
const Orientacao = {
  ehAparelhoDeToque() {
    return !!(window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches);
  },

  iniciar() {
    if (!this.ehAparelhoDeToque()) return;
    const tentar = () => { this.travarDeitado(); };
    // precisa ser dentro de um toque do jogador (regra dos navegadores)
    document.addEventListener('pointerup', tentar, { once: true });
  },

  async travarDeitado() {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (e) { /* o navegador não deixou: fica só o aviso */ }
  }
};
Orientacao.iniciar();
