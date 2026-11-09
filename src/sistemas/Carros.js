// =============================================================================
// CARROS — veículos nas ruas (decoração que também bloqueia a passagem)
// -----------------------------------------------------------------------------
// Os veículos ficam na camada "carros" do mapa (assets/mapa/mapa.json), que o professor edita em
// Editor > Mapa > "Novo carro". Cada veículo tem:
//   x, y       ponto onde o veículo toca o chão (centro da base)
//   modelo     um dos MODELOS abaixo
//   width      comprimento do veículo visto de lado, no mapa (padrão 130 para carros e 180 para caminhões);
//              as outras vistas acompanham a mesma escala
//   direcao    para onde o veículo aponta: N, NE, E, SE, S, SW, W ou NW (N = para cima na tela, E = para a direita)
// Cada modelo tem 5 desenhos (vistas) em assets/carros/carro_NN_<vista>.webp: frente, costas, lado, diag_frente
// e diag_costas. As 8 direções saem deles, espelhando quando preciso (esquerda = lado espelhado, etc.).
// O jogador não atravessa o veículo (colisão na base; acima dela, na altura do baú/cabine) mas passa por trás dele.
// =============================================================================
const Carros = {
  // vistas: [largura, altura] em pixels de cada desenho, todos na mesma escala. corpo = largura do veículo / comprimento;
  // alto = quanto da altura (em fração do comprimento) também bloqueia, acima da base (baú, cabine).
  MODELOS: [
    { id: 'carro_01', nome: 'SUV azul', corpo: 0.42, alto: 0.1,
      vistas: { frente: [213, 305], costas: [207, 292], lado: [360, 263], diag_frente: [364, 367], diag_costas: [375, 348] } },
    { id: 'carro_02', nome: 'Sedã vermelho', corpo: 0.4, alto: 0.05,
      vistas: { frente: [192, 268], costas: [185, 262], lado: [360, 201], diag_frente: [358, 326], diag_costas: [377, 303] } },
    { id: 'carro_03', nome: 'Van amarela', corpo: 0.42, alto: 0.18,
      vistas: { frente: [198, 320], costas: [161, 320], lado: [360, 299], diag_frente: [329, 405], diag_costas: [357, 385] } },
    { id: 'carro_04', nome: 'Picape cinza', corpo: 0.42, alto: 0.08,
      vistas: { frente: [192, 281], costas: [178, 282], lado: [360, 237], diag_frente: [346, 343], diag_costas: [354, 330] } },
    { id: 'carro_05', nome: 'Van verde', corpo: 0.42, alto: 0.18,
      vistas: { frente: [212, 328], costas: [188, 324], lado: [360, 299], diag_frente: [352, 408], diag_costas: [364, 386] } },
    { id: 'carro_06', nome: 'Caminhão-baú roxo', larguraPadrao: 180, corpo: 0.42, alto: 0.38,
      vistas: { frente: [191, 319], costas: [173, 313], lado: [360, 263], diag_frente: [324, 396], diag_costas: [371, 384] } },
    { id: 'carro_07', nome: 'Caminhão basculante laranja', larguraPadrao: 180, corpo: 0.42, alto: 0.22,
      vistas: { frente: [185, 304], costas: [182, 295], lado: [360, 270], diag_frente: [348, 374], diag_costas: [361, 360] } },
    { id: 'carro_08', nome: 'Caminhão-tanque vermelho', larguraPadrao: 180, corpo: 0.42, alto: 0.24,
      vistas: { frente: [176, 329], costas: [169, 316], lado: [360, 263], diag_frente: [318, 363], diag_costas: [337, 350] } },
    { id: 'carro_09', nome: 'Caminhão de carroceria verde', larguraPadrao: 180, corpo: 0.42, alto: 0.12,
      vistas: { frente: [202, 315], costas: [189, 318], lado: [360, 248], diag_frente: [367, 351], diag_costas: [364, 359] } },
    { id: 'carro_10', nome: 'SUV branco', corpo: 0.42, alto: 0.1,
      vistas: { frente: [215, 270], costas: [200, 270], lado: [360, 237], diag_frente: [370, 364], diag_costas: [377, 349] } }
  ],
  // direção -> vista usada e se o desenho é espelhado
  DIRECOES: [
    { id: 'NW', nome: 'Cima esquerda', vista: 'diag_costas', espelhar: true },
    { id: 'N',  nome: 'Cima',          vista: 'costas',      espelhar: false },
    { id: 'NE', nome: 'Cima direita',  vista: 'diag_costas', espelhar: false },
    { id: 'W',  nome: 'Esquerda',      vista: 'lado',        espelhar: true },
    { id: 'E',  nome: 'Direita',       vista: 'lado',        espelhar: false },
    { id: 'SW', nome: 'Baixo esquerda', vista: 'diag_frente', espelhar: false },
    { id: 'S',  nome: 'Baixo',         vista: 'frente',      espelhar: false },
    { id: 'SE', nome: 'Baixo direita', vista: 'diag_frente', espelhar: true }
  ],
  LARGURA_PADRAO: 130,        // carros; os caminhões têm "larguraPadrao" própria
  ACHATAMENTO: 0.7,           // o chão aparece "deitado" no desenho: distâncias na vertical parecem menores

  vistaTextura(m, vista) { return m.id + '_' + vista; },
  vistaArquivo(m, vista) { return 'assets/carros/' + m.id + '_' + vista + '.webp'; },
  // lista de todas as texturas (para carregar)
  texturas() { const l = []; this.MODELOS.forEach(m => Object.keys(m.vistas).forEach(v => l.push({ chave: this.vistaTextura(m, v), arquivo: this.vistaArquivo(m, v) }))); return l; },
  arquivoMiniatura(m) { return this.vistaArquivo(m, 'lado'); },

  modelo(id) { return this.MODELOS.find(m => m.id === id) || this.MODELOS[0]; },
  larguraDoModelo(m) { return m.larguraPadrao || this.LARGURA_PADRAO; },
  largura(o) { return Math.max(60, Math.min(900, Number(o.width) || this.larguraDoModelo(this.modelo(o.modelo)))); },
  direcao(o) { return this.DIRECOES.find(d => d.id === o.direcao) || this.DIRECOES.find(d => d.id === 'E'); },

  // Tudo o que é preciso para desenhar e bloquear um veículo:
  //   desenho: caixa do sprite no mapa (x0,y0,x1,y1), textura e espelhamento
  //   base: retângulo bloqueado (x0,y0,x1,y1) — a pegada no chão mais a altura do baú/cabine
  //   chao: só a pegada no chão (parte de baixo do retângulo)
  geometria(o) {
    const m = this.modelo(o.modelo), d = this.direcao(o), w = this.largura(o);
    const esc = w / m.vistas.lado[0], [vw, vh] = m.vistas[d.vista], dw = vw * esc, dh = vh * esc;
    const L = w * 0.94, C = w * m.corpo, k = this.ACHATAMENTO;
    let bw, bh;
    if (d.vista === 'lado') { bw = L; bh = C * k; }
    else if (d.vista === 'frente' || d.vista === 'costas') { bw = C; bh = L * k; }
    else { bw = (L + C) * 0.72; bh = bw * k; }
    bh = Math.max(bh, w * 0.16);
    const ext = m.alto * w, oy = 1 - bh / (2 * dh);
    const x0 = o.x - dw / 2, y0 = o.y - dh * oy;
    return {
      textura: this.vistaTextura(m, d.vista), espelhar: d.espelhar, dw, dh, oy,
      desenho: { x0, y0, x1: x0 + dw, y1: y0 + dh },
      base: { x0: o.x - bw / 2, x1: o.x + bw / 2, y0: o.y - bh / 2 - ext, y1: o.y + bh / 2 },
      chao: { x0: o.x - bw / 2, x1: o.x + bw / 2, y0: o.y - bh / 2, y1: o.y + bh / 2 }
    };
  },

  criar(cena) {
    cena.carros = [];
    ((Conteudo.mapa && Conteudo.mapa.carros) || []).forEach(o => {
      const g = this.geometria(o);
      if (!cena.textures.exists(g.textura)) return;
      const img = cena.add.image(o.x, o.y, g.textura).setOrigin(0.5, g.oy).setDisplaySize(g.dw, g.dh)
        .setFlipX(g.espelhar).setDepth(10 + g.chao.y1 / 100000);
      const b = g.base, zona = cena.add.zone((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.x1 - b.x0, b.y1 - b.y0);
      cena.physics.add.existing(zona, true);
      if (cena.jogador) cena.physics.add.collider(cena.jogador, zona);
      cena.carros.push({ id: o.name, img, zona, zonas: [zona] });
    });
  }
};
