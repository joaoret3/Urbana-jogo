// =============================================================================
// CENA DE CARREGAMENTO
// -----------------------------------------------------------------------------
// Primeira cena do jogo. Ela:
//   1. carrega a logo, o mapa do Tiled e a lista de peças do mapa;
//   2. lê os arquivos de dados (pasta dados/);
//   3. espera as fontes ficarem prontas;
//   4. abre o menu principal.
// A conferência do conteúdo fica no Editor de conteúdo (editor.html).
// =============================================================================
class CenaCarga extends Phaser.Scene {
  constructor() { super('CenaCarga'); }

  preload() {
    const { width: L, height: A } = this.scale;
    // barra de progresso simples
    const texto = this.add.text(L / 2, A / 2 - 40, 'Carregando o bairro…', {
      fontFamily: 'Londrina Solid, Inter, sans-serif', fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    const moldura = this.add.rectangle(L / 2, A / 2, 320, 22).setStrokeStyle(3, 0x9be21b);
    const barra = this.add.rectangle(L / 2 - 157, A / 2, 0, 14, 0xff3fbf).setOrigin(0, 0.5);
    this.load.on('progress', (v) => { barra.width = 314 * v; });
    this.textoCarga = texto;

    this.load.image('logo', 'assets/ui/logo_urbana.webp');
    // o mapa (mapa.js) e a lista de peças (pecas.js) já vieram pelo index.html
    if (window.URBANA_PECAS) this.cache.json.add('pecas', window.URBANA_PECAS);
    if (window.URBANA_MAPA) this.cache.tilemap.add('mapa', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: window.URBANA_MAPA });
    this.load.image('colisao_tileset', 'assets/mapa/colisao_tileset.png');
    // marcadores do mapa (imagens de interface, podem ser trocadas em assets/ui)
    this.load.image('pin_nao_visitado', 'assets/ui/pins/pin_nao_visitado.png');
    this.load.image('pin_visitado', 'assets/ui/pins/pin_visitado.png');
    this.load.image('pin_concluido', 'assets/ui/pins/pin_concluido.png');
    this.load.image('lata', 'assets/ui/lata.png');
    this.load.image('muro_livre', 'assets/ui/muro_livre.webp');
    this.load.image('muro_base', 'assets/ui/muro_base.webp');
    Carros.texturas().forEach(t => this.load.image(t.chave, t.arquivo));   // veículos, 5 vistas cada (v2.28)
    this.load.image('poste', 'assets/ui/poste.png');            // postes do bairro (v2.6)

  }

  async create() {
    this.textoCarga.setText('Preparando o bairro…');
    Interface.iniciar();
    Preferencias.carregar();

    Conteudo.lerMapa(this.cache.tilemap.get('mapa').data);
    await Conteudo.carregar();
    // A conferência do conteúdo (erros de cadastro) fica só no Editor de conteúdo (editor.html),
    // para não aparecer para os alunos.
    await Sons.carregar(this);      // música e efeitos (lista em dados/jogo.js)

    // espera as fontes (estão em assets/fontes, não precisam de internet)
    try { await Promise.all([document.fonts.load('400 16px Inter'), document.fonts.load('900 16px Inter'), document.fonts.load('italic 900 16px "Inter Display"'), document.fonts.load('24px "Londrina Solid"'), document.fonts.load('24px "Sedgwick Ave Display"')]); } catch (e) { /* segue com a fonte do sistema */ }

    this.scene.start('CenaMenu');
  }
}
