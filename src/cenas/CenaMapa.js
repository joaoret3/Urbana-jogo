// =============================================================================
// TELA 03 — EXPLORAÇÃO DO MAPA
// -----------------------------------------------------------------------------
// Carrega o mapa em peças (só as que estão perto da câmera), aplica a colisão
// do Tiled e coloca o avatar da partida atual na última posição salva
// (ou em frente à escola, numa partida nova).
//
// Controles: WASD/setas, joystick do HUD, ou clique/toque no mapa para andar.
//            E / Espaço / Enter = botão A · B = Black Book · M = missões · P = perfil · Esc = pausa
//            roda do mouse = zoom · C = mostra a colisão (ajuda para quem edita o mapa)
//
// O mapa do Tiled e a lista de peças já foram carregados pela CenaCarga.
// =============================================================================
class CenaMapa extends Phaser.Scene {
  constructor() { super('CenaMapa'); }

  init(dados) { this.avisoAoEntrar = dados && dados.aviso; }

  // Carrega a folha de sprites do avatar da partida (se ainda não estiver na memória)
  preload() {
    this.partida = Salvamento.atual;
    if (!this.partida) return;
    this.avatar = Conteudo.avatar(this.partida.jogador.avatar_id);
    const s = this.avatar.sprite;
    this.chaveAvatar = 'avatar_' + this.avatar.id;
    if (!this.textures.exists(this.chaveAvatar)) {
      this.load.spritesheet(this.chaveAvatar, s.arquivo, { frameWidth: s.largura_quadro, frameHeight: s.altura_quadro });
    }
    Npcs.carregar(this);             // personagens que dão missões (sistemas/Npcs.js)
  }

  create() {
    if (!this.partida) { this.scene.start('CenaMenu'); return; }   // segurança: sem partida, volta ao menu
    const cfg = window.URBANA;
    const info = this.cache.json.get('pecas');
    this.info = info;
    FundoBairro.liberar(this);                         // libera a memória do fundo do menu

    const qualidade = Preferencias.qualidadeMapa();   // escolhida em Configurações (ou o padrão de config.js)
    this.pasta = 'assets/mapa/' + qualidade + '/';
    this.pecas = new Map();          // nome -> imagem
    this.carregando = new Set();

    this.physics.world.setBounds(0, 0, info.largura, info.altura);
    this.cameras.main.setBounds(0, 0, info.largura, info.altura);
    this.cameras.main.setBackgroundColor('#5d6272');

    // camada de colisão (tiles de 32 px vindos do Tiled)
    const mapa = this.make.tilemap({ key: 'mapa' });
    const ts = mapa.addTilesetImage('colisao', 'colisao_tileset');
    this.camadaColisao = mapa.createLayer('colisao', ts, 0, 0);
    this.camadaColisao.setCollision(1);
    this.camadaColisao.setDepth(5).setVisible(cfg.MOSTRAR_COLISAO);

    Efeitos.prepararTexturas(this);
    ObjetosDoMapa.criar(this);       // pins, latas e muros (sistemas/ObjetosDoMapa.js)
    Detalhes.criar(this);            // postes e fiação (sistemas/Detalhes.js)
    this.criarJogador();

    const cam = this.cameras.main;
    cam.startFollow(this.jogador, true, 0.12, 0.12);
    cam.setZoom(cfg.ZOOM_INICIAL);
    cam.centerOn(this.jogador.x, this.jogador.y);
    Luz.criar(this);                 // anoitecer depois de alguns minutos jogando (sistemas/Luz.js, v2.40)

    this.configurarControles();

    const aoCarregar = (key) => this.mostrarPeca(key);
    this.load.on('filecomplete', aoCarregar);
    this.atualizarPecas();

    HUD.montar({
      aoAbrirMenu: () => this.abrirPausa(),
      aoAbrirBlackBook: () => this.abrirBlackBook(),
      aoAbrirPerfil: () => this.abrirPerfil(),
      aoAbrirMissoes: () => this.abrirMissoes()
    });
    MiniMapa.montar(this);   // mini-mapa do bairro inteiro, abaixo do perfil
    // avisos de recompensa, nível e missões (vêm de sistemas/Progresso.js)
    Progresso.aoNotificar = (n) => this.aoNotificar(n);
    Sons.iniciarMusica();
    // tutorial na primeira vez que esta partida entra no mapa
    if (!this.partida.tutorial_visto) {
      TelaTutorial.abrir({ aoFechar: () => { this.partida.tutorial_visto = true; Salvamento.salvar(); } });
    }
    if (this.avisoAoEntrar) { Interface.avisar(this.avisoAoEntrar); this.avisoAoEntrar = null; }

    // salvamento automático da posição
    this.ultimaPosicaoSalva = { x: this.jogador.x, y: this.jogador.y };
    this.time.addEvent({ delay: cfg.AUTOSALVAR_SEGUNDOS * 1000, loop: true, callback: () => this.salvarPosicao() });
    const aoEsconder = () => { if (document.visibilityState === 'hidden') this.salvarPosicao(true); };
    const aoSairDaPagina = () => this.salvarPosicao(true);
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('pagehide', aoSairDaPagina);

    // ao sair da cena: salva, libera a memória das peças e remove o HTML
    this.events.once('shutdown', () => {
      Progresso.aoNotificar = null;
      this.salvarPosicao(true);
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('pagehide', aoSairDaPagina);
      this.load.off('filecomplete', aoCarregar);
      this.pecas.forEach((s, chave) => this.textures.remove(chave));
      this.pecas.clear(); this.carregando.clear();
      MiniMapa.destruir();
      HUD.destruir();
      Interface.limpar();
    });
  }

  // ---------------------------------------------------------------------------
  // AVATAR
  // ---------------------------------------------------------------------------
  criarJogador() {
    const cfg = window.URBANA, s = this.avatar.sprite;
    const inicio = Conteudo.mapa.inicio;
    let pos = this.partida.jogador.posicao;
    // se a posição salva estiver bloqueada (ex.: mapa mudou), volta para a escola
    if (!pos || Conteudo.bloqueado(pos.x, pos.y)) pos = { x: inicio.x, y: inicio.y };

    this.criarAnimacoes();
    this.jogador = this.physics.add.sprite(pos.x, pos.y, this.chaveAvatar, 0);
    // o "pé" do personagem fica na posição do jogador (90% da altura do quadro)
    // folhas com quadros maiores que 96 px (ex.: 192) ficam do mesmo tamanho no mapa (v2.31)
    const escala = cfg.AVATAR_ESCALA * 96 / (Number(s.altura_quadro) || 96);
    this.jogador.setOrigin(0.5, 0.9).setScale(escala);
    // área de colisão: só os pés (assim a cabeça pode passar "na frente" das casas)
    // o desenho pode crescer (AVATAR_ESCALA) sem a área dos pés crescer junto (AVATAR_ESCALA_PES)
    const ajustePe = (cfg.AVATAR_ESCALA_PES || cfg.AVATAR_ESCALA) / cfg.AVATAR_ESCALA;
    const larguraPe = s.largura_quadro * 0.34 * ajustePe, alturaPe = s.altura_quadro * 0.16 * ajustePe;
    this.jogador.body.setSize(larguraPe, alturaPe)
      .setOffset((s.largura_quadro - larguraPe) / 2, s.altura_quadro * 0.9 - alturaPe);
    this.jogador.setCollideWorldBounds(true);
    this.physics.add.collider(this.jogador, this.camadaColisao);
    Carros.criar(this);              // carros estacionados (sistemas/Carros.js)
    Npcs.criar(this);                // personagens que dão missões (sistemas/Npcs.js)
    this.direcao = 'baixo';
    this.jogador.anims.play(this.chaveAvatar + '_parado_baixo');
    // sombra suave nos pés (o sol vem do alto à esquerda, como as sombras do mapa)
    this.sombraJogador = this.add.ellipse(pos.x, pos.y, s.largura_quadro * 0.42 * escala, s.altura_quadro * 0.12 * escala, 0x0f0c14, 0.32).setDepth(9);
  }

  // Cria as animações a partir da folha de sprites:
  // linhas: 0 baixo, 1 esquerda, 2 direita, 3 cima, 4 interagindo
  // colunas: 0 parado, 1..N passos da caminhada
  criarAnimacoes() {
    const k = this.chaveAvatar, s = this.avatar.sprite;
    if (this.anims.exists(k + '_parado_baixo')) return;
    const tex = this.textures.get(k).source[0];
    const colunas = Math.floor(tex.width / s.largura_quadro);
    const linhas = Math.floor(tex.height / s.altura_quadro);
    const fps = s.quadros_por_segundo || 8;
    const passos = Math.min(s.quadros_caminhada, colunas - 1);
    ['baixo', 'esquerda', 'direita', 'cima'].forEach((dir, linha) => {
      const base = linha * colunas;
      this.anims.create({ key: `${k}_parado_${dir}`, frames: [{ key: k, frame: base }] });
      this.anims.create({
        key: `${k}_andar_${dir}`, frameRate: fps, repeat: -1,
        frames: this.anims.generateFrameNumbers(k, { start: base + 1, end: base + passos })
      });
    });
    if (linhas >= 5) {
      this.anims.create({
        key: `${k}_interagir`, frameRate: fps,
        frames: this.anims.generateFrameNumbers(k, { start: 4 * colunas, end: 4 * colunas + passos })
      });
    }
  }

  // Animação de interagir (usada pelos pins e muros nas próximas etapas)
  animarInteracao() {
    const k = this.chaveAvatar + '_interagir';
    if (this.anims.exists(k)) {
      this.interagindo = true;
      this.jogador.anims.play(k);
      this.jogador.once('animationcomplete', () => { this.interagindo = false; });
    }
  }

  // ---------------------------------------------------------------------------
  // CONTROLES
  // ---------------------------------------------------------------------------
  configurarControles() {
    // teclado (sem "capturar" as teclas, para os campos de texto das janelas continuarem funcionando)
    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,C,ESC,E,SPACE,ENTER,B,M,P,N', false);
    const livre = () => !Interface.algumAberto();
    this.teclas.C.on('down', () => { if (livre()) this.camadaColisao.setVisible(!this.camadaColisao.visible); });
    this.teclas.ESC.on('down', () => { if (livre()) this.abrirPausa(); });
    this.teclas.B.on('down', () => { if (livre()) this.abrirBlackBook(); });
    this.teclas.M.on('down', () => { if (livre()) this.abrirMissoes(); });
    this.teclas.P.on('down', () => { if (livre()) this.abrirPerfil(); });
    this.teclas.N.on('down', () => { if (livre()) MiniMapa.alternar(); });   // amplia/diminui o mini-mapa
    ['E', 'SPACE', 'ENTER'].forEach(t => this.teclas[t].on('down', () => {
      // Enter/Espaço num botão HTML focado já fazem o clique dele
      if (livre() && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) HUD.acionar();
    }));

    const cam = this.cameras.main;
    this.input.on('wheel', (p, o, dx, dy) => { if (livre()) cam.setZoom(Phaser.Math.Clamp(cam.zoom * (dy > 0 ? 0.9 : 1.1), 0.35, 2)); });

    // toque/clique: num pin abre a ficha (ou a prévia, se longe); num muro, pinta;
    // em qualquer outro lugar, o avatar anda até o ponto tocado
    this.alvo = null;
    this.input.on('pointerdown', (p, objetos) => {
      if (!livre()) return;
      const obj = objetos.find(o => o.dados);
      if (obj && obj.dados.tipo === 'pin') { this.abrirFicha(obj.dados.id, ObjetosDoMapa.estaPerto(this, 'pin', obj.dados.id)); return; }
      if (obj && obj.dados.tipo === 'muro') {
        if (ObjetosDoMapa.estaPerto(this, 'muro', obj.dados.id)) { this.abrirMuro(obj.dados.id); return; }
        Interface.avisar('Chegue perto do muro para pintar.');
      }
      this.alvo = new Phaser.Math.Vector2(p.worldX, p.worldY);
    });
  }

  abrirMissoes() {
    if (Interface.algumAberto()) return;
    this.pararJogador();
    TelaMissoes.abrir();
  }

  abrirPausa() {
    this.pararJogador();
    this.salvarPosicao(true);
    TelaPausa.abrir({ aoSair: () => this.scene.start('CenaMenu'), aoAbrirPerfil: () => this.abrirPerfil() });
  }

  abrirPerfil() {
    this.pararJogador();
    TelaPerfil.abrir({ aoTrocarAvatar: (id) => this.trocarAvatar(id) });
  }

  // Troca o personagem sem mexer no progresso: salva e recarrega o mapa com o novo sprite
  trocarAvatar(id) {
    this.salvarPosicao(true);
    Salvamento.atual.jogador.avatar_id = id;
    Salvamento.salvar();
    this.scene.restart({ aviso: 'Avatar trocado! Seu progresso continua o mesmo.' });
  }

  abrirBlackBook() {
    this.pararJogador();
    TelaBlackBook.abrir({ modo: 'ver', aoFechar: () => HUD.atualizar() });
  }

  // ---------------------------------------------------------------------------
  // GRAFITES, MUROS E RECOMPENSAS
  // ---------------------------------------------------------------------------
  // Abre a ficha de um grafite. De perto: registra a visita (recompensa só na 1ª vez).
  abrirFicha(grafiteId, perto) {
    this.pararJogador();
    if (perto) {
      this.animarInteracao();
      Progresso.registrarVisita(grafiteId);
      ObjetosDoMapa.atualizarPins(this);
      HUD.atualizar();
    }
    const pin = this.pins.find(x => x.id === grafiteId);
    TelaFicha.abrir({
      grafiteId, perto,
      aoIrAte: pin ? () => { this.alvo = new Phaser.Math.Vector2(pin.x, pin.y + 20); } : null
    });
    // ao fechar ficha/quiz, atualiza pins e HUD
    this.aguardarJanelas(() => { ObjetosDoMapa.atualizarPins(this); HUD.atualizar(); });
  }

  // Abre a tela de pintar um muro virtual
  abrirMuro(muroId) {
    this.pararJogador();
    TelaPintarMuro.abrir({ muroId, aoAplicar: (arteId) => this.pintarMuro(muroId, arteId) });
    this.aguardarJanelas(() => HUD.atualizar());
  }

  // Animação de spray, depois grava a pintura
  pintarMuro(muroId, arteId) {
    const muro = this.muros.find(m => m.id === muroId);
    if (!muro) return;
    this.animarInteracao();
    Sons.tocar('spray');
    this.pintando = true;
    ObjetosDoMapa.mostrarArte(this, muro, arteId, true);
    Efeitos.spray(this, muro.objeto, () => {
      this.pintando = false;
      if (Progresso.pintarMuro(muroId, arteId)) {
        const a = Conteudo.arte(arteId);
        Interface.notificar({ tipo: 'recompensa', titulo: 'Muro pintado!', texto: `${a.titulo} · arte de ${a.autoria || '—'}` });
        HUD.atualizar();
      }
    });
  }

  // Chama a função quando todas as janelas estiverem fechadas
  aguardarJanelas(funcao) {
    const t = this.time.addEvent({ delay: 200, loop: true, callback: () => {
      if (!Interface.algumAberto()) { t.remove(); funcao(); }
    } });
  }

  // Avisos vindos do Progresso (descoberta, recompensa, nível, missão)
  aoNotificar(n) {
    Interface.notificar(n);
    HUD.atualizar();
    if (n.tipo === 'nivel') { Efeitos.subiuNivel(this, this.jogador); Sons.tocar('nivel'); }
    if (n.tipo === 'descoberta') { Efeitos.estouro(this, this.jogador.x, this.jogador.y - 60, 30); Sons.tocar('descoberta'); }
    if (n.tipo === 'missao') Sons.tocar('missao');
    Npcs.atualizarSinais(this);
  }

  pararJogador() {
    this.alvo = null;
    Joystick.zerar();
    if (this.jogador) this.jogador.setVelocity(0, 0);
  }

  // Grava a posição se o jogador andou (ou sempre, com forcar = true)
  salvarPosicao(forcar) {
    if (!this.jogador || !Salvamento.atual) return;
    const x = Math.round(this.jogador.x), y = Math.round(this.jogador.y);
    const u = this.ultimaPosicaoSalva;
    if (!forcar && u && Math.hypot(u.x - x, u.y - y) < 32) return;
    Salvamento.atual.jogador.posicao = { x, y };
    if (Salvamento.salvar()) this.ultimaPosicaoSalva = { x, y };
  }

  // ---------------------------------------------------------------------------
  // PEÇAS DO MAPA (carregamento sob demanda)
  // ---------------------------------------------------------------------------
  // carrega só as peças perto da câmera e descarrega as distantes (economiza memória)
  atualizarPecas() {
    const cam = this.cameras.main, r = window.URBANA.RAIO_CARREGAMENTO;
    const v = cam.worldView, mx = v.width * (r - 1) / 2, my = v.height * (r - 1) / 2;
    const x0 = v.x - mx, y0 = v.y - my, x1 = v.right + mx, y1 = v.bottom + my;
    let pedidos = 0;
    for (const p of this.info.pecas) {
      const perto = p.x < x1 && p.x + p.largura > x0 && p.y < y1 && p.y + p.altura > y0;
      const chave = 'peca_' + p.nome;
      if (perto && !this.pecas.has(chave) && !this.carregando.has(chave)) {
        this.carregando.add(chave);
        if (this.textures.exists(chave)) this.mostrarPeca(chave);       // já estava na memória
        else { this.load.image(chave, this.pasta + p.nome); pedidos++; }
      } else if (!perto && this.pecas.has(chave)) {
        this.pecas.get(chave).destroy(); this.pecas.delete(chave); this.textures.remove(chave);
      }
    }
    if (pedidos) this.load.start();
  }

  mostrarPeca(chave) {
    if (!chave.startsWith('peca_')) return;
    this.carregando.delete(chave);
    const p = this.info.pecas.find(q => 'peca_' + q.nome === chave);
    if (!p || this.pecas.has(chave)) return;
    const s = this.add.image(p.x, p.y, chave, CenaMapa.quadroSemBorda(this, chave))
      .setOrigin(0, 0).setDisplaySize(p.largura, p.altura).setDepth(0);
    this.pecas.set(chave, s);
  }

  // ---------------------------------------------------------------------------
  // A CADA QUADRO
  // ---------------------------------------------------------------------------
  update(t, passo) {
    if (!this.jogador) return;
    Luz.atualizar(this, passo);
    if (this.sombraJogador) this.sombraJogador.setPosition(this.jogador.x + 6, this.jogador.y + 2);
    if (!this._ultimo || t - this._ultimo > 250) { this._ultimo = t; this.atualizarPecas(); Detalhes.atualizar(this); }
    if (!this._ultimoMini || t - this._ultimoMini > 150) { this._ultimoMini = t; MiniMapa.atualizar(this); }
    if (Interface.algumAberto() || this.pintando) { this.pararJogador(); this.animar(0, 0, 0); return; }   // janela aberta: jogador parado

    const k = this.teclas, v = window.URBANA.VELOCIDADE;
    let vx = (k.D.isDown || k.RIGHT.isDown) - (k.A.isDown || k.LEFT.isDown);
    let vy = (k.S.isDown || k.DOWN.isDown) - (k.W.isDown || k.UP.isDown);
    let forca = 1;
    if (vx || vy) this.alvo = null;
    else if (Joystick.ativo) {
      this.alvo = null;
      vx = Joystick.x; vy = Joystick.y;
      forca = Math.min(1, Math.hypot(vx, vy) / 0.7);   // joystick: mais longe do centro = mais rápido
    } else if (this.alvo) {
      const dx = this.alvo.x - this.jogador.x, dy = this.alvo.y - this.jogador.y;
      // chegou, ou ficou preso numa parede: para
      if (Math.hypot(dx, dy) < 8 || (this.jogador.body.blocked.none === false && this._parado > 300)) this.alvo = null;
      else { vx = dx; vy = dy; }
    }
    // velocidade desejada (diagonal normalizada)
    const len = Math.hypot(vx, vy);
    const alvoVx = len > 0 ? vx / len * v * forca : 0, alvoVy = len > 0 ? vy / len * v * forca : 0;
    // movimento suave: acelera e freia rapidinho em vez de arrancar/parar seco
    // (ACELERACAO/FRENAGEM = tempo, em segundos, para chegar a ~63% da velocidade desejada)
    const cfg = window.URBANA, dt = Math.min(0.05, this.game.loop.delta / 1000);
    const tau = len > 0 ? (cfg.ACELERACAO || 0.06) : (cfg.FRENAGEM || 0.045);
    const f = 1 - Math.exp(-dt / tau);
    const body = this.jogador.body;
    let nvx = body.velocity.x + (alvoVx - body.velocity.x) * f;
    let nvy = body.velocity.y + (alvoVy - body.velocity.y) * f;
    if (!len && Math.hypot(nvx, nvy) < 12) { nvx = 0; nvy = 0; }
    this.jogador.setVelocity(nvx, nvy);

    // conta há quanto tempo o jogador está sem sair do lugar (para o clique não insistir na parede)
    const andou = this.jogador.body.speed > 0 && (Math.abs(this.jogador.body.deltaX()) + Math.abs(this.jogador.body.deltaY())) > 0.5;
    this._parado = andou ? 0 : (this._parado || 0) + this.game.loop.delta;

    this.animar(vx, vy, Math.hypot(nvx, nvy) / v);
    this.jogador.setDepth(10 + this.jogador.y / 100000);
    ObjetosDoMapa.atualizar(this);   // latas, objeto mais próximo e botão A
  }

  // Escolhe a animação pela direção do movimento.
  //   rapidez = velocidade atual / velocidade máxima (0 a 1): a animação acompanha o passo
  //   (anda devagar com o joystick perto do centro = passos mais lentos, sem "patinar").
  animar(vx, vy, rapidez = 0) {
    if (this.interagindo) return;
    const k = this.chaveAvatar, a = this.jogador.anims;
    if (vx || vy) {
      const ax = Math.abs(vx), ay = Math.abs(vy);
      const horiz = ax > 0 && (vx > 0 ? 'direita' : 'esquerda'), vert = ay > 0 && (vy > 0 ? 'baixo' : 'cima');
      // na diagonal, só troca de direção quando o outro eixo ficar claramente maior (evita "tremer")
      const atual = this.direcao, MARGEM = 1.35;
      if (atual === horiz && ax * MARGEM >= ay) this.direcao = horiz;
      else if (atual === vert && ay * MARGEM >= ax) this.direcao = vert;
      else this.direcao = ax > ay ? horiz : vert;
      a.play(`${k}_andar_${this.direcao}`, true);
      a.timeScale = Phaser.Math.Clamp(rapidez, 0.45, 1.2);
    } else if (rapidez > 0.25) {
      a.timeScale = Phaser.Math.Clamp(rapidez, 0.45, 1.2);   // ainda freando: termina o passo
    } else {
      a.timeScale = 1;
      a.play(`${k}_parado_${this.direcao}`, true);
    }
  }

  // O Phaser "repete" imagens com tamanho em potência de 2 (como as peças de 2048 e 1024 px),
  // e a borda oposta da imagem vaza na emenda entre peças, formando uma linha fina.
  // Solução: usar um recorte da peça 1 pixel para dentro das bordas e esticar até o
  // tamanho original (a diferença é invisível). Usado também pelo fundo do menu.
  static quadroSemBorda(cena, chave) {
    const tex = cena.textures.get(chave), src = tex.source[0];
    if (!tex.has('miolo')) tex.add('miolo', 0, 1, 1, src.width - 2, src.height - 2);
    return 'miolo';
  }
}
