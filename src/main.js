// =============================================================================
// INÍCIO DO JOGO — cria o Phaser e lista as cenas
// A primeira cena da lista (CenaCarga) é a que abre primeiro.
// =============================================================================
// Aberto com dois cliques (endereço file://) o navegador não deixa a placa de vídeo
// usar as imagens do computador. Por isso, nesse caso, o jogo desenha pelo modo
// "Canvas" e toca os sons pelo modo HTML5. Com servidor, usa o modo mais rápido (WebGL).
const SEM_SERVIDOR = location.protocol === 'file:';
window.URBANA.SEM_SERVIDOR = SEM_SERVIDOR;

// As fontes de grafite precisam estar prontas antes de o Phaser escrever no canvas.
// (Elas estão embutidas em estilo/fontes.css; se demorarem, o jogo abre assim mesmo.)
function esperarFontes() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const fontes = ['24px "Londrina Solid"', '24px "Sedgwick Ave Display"']
    .map(f => document.fonts.load(f, 'A').catch(() => null));
  return Promise.race([Promise.all(fontes), new Promise(r => setTimeout(r, 1500))]);
}

if (window.Phaser) esperarFontes().then(() => {
  // window.jogo: o jogo do Phaser (usado pelo módulo de áudio)
  window.jogo = new Phaser.Game({
    type: SEM_SERVIDOR ? Phaser.CANVAS : Phaser.AUTO,
    loader: { imageLoadType: 'HTMLImageElement' },   // imagens carregadas sem pedir ao servidor
    audio: { disableWebAudio: SEM_SERVIDOR },
    parent: 'jogo',
    backgroundColor: '#17141d',
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [CenaCarga, CenaMenu, CenaAvatar, CenaMapa]
  });
});
