// =============================================================================
// OBJETOS DO MAPA — pins dos grafites, latas coletáveis e muros virtuais
// -----------------------------------------------------------------------------
// As posições vêm das camadas do Tiled (assets/mapa/mapa.json):
//   "grafites"     → pins (o nome do ponto é o id da ficha em dados/grafites.js)
//   "coletaveis"   → latas de spray
//   "muros_livres" → muros que podem receber artes do Black Book
//
// A cada quadro, ObjetosDoMapa.atualizar(cena) descobre o objeto mais próximo
// do jogador, destaca esse objeto e mostra no botão A o que dá para fazer.
// As latas são coletadas só de passar por cima.
// =============================================================================
const ObjetosDoMapa = {
  TEXTURA_PIN: { nao_visitado: 'pin_nao_visitado', visitado: 'pin_visitado', concluido: 'pin_concluido' },

  criar(cena) {
    cena.pins = []; cena.latas = []; cena.muros = [];
    const p = Salvamento.atual;
    const mexer = !Efeitos.menosMovimento();

    // ---------- PINS DOS GRAFITES ----------
    const publicados = new Map(Conteudo.grafitesPublicados().map(g => [g.id, g]));
    Conteudo.mapa.grafites.forEach(o => {
      const g = publicados.get(o.name); if (!g) return;
      const sprite = cena.add.image(o.x, o.y, this.TEXTURA_PIN[this.estadoPin(g)])
        .setOrigin(0.5, 0.95).setScale(0.8).setDepth(10 + o.y / 100000)
        .setInteractive({ useHandCursor: true });
      sprite.dados = { tipo: 'pin', id: g.id };
      // anel que aparece quando o jogador está perto
      const anel = cena.add.ellipse(o.x, o.y, 120, 48).setStrokeStyle(5, 0xffe14d).setFillStyle(0xffe14d, 0.18)
        .setDepth(9).setVisible(false);
      if (mexer) cena.tweens.add({ targets: sprite, y: o.y - 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      cena.pins.push({ id: g.id, grafite: g, x: o.x, y: o.y, sprite, anel });
    });

    // ---------- LATAS COLETÁVEIS ----------
    Conteudo.mapa.latas.forEach(o => {
      if (p.latas_vazias.includes(o.name)) return;           // coletada e ainda não voltou: não aparece (v2.37: parte volta ao abrir a partida)
      const sprite = cena.add.image(o.x, o.y, 'lata').setOrigin(0.5, 0.95).setScale(0.23).setDepth(10 + o.y / 100000);
      if (mexer) cena.tweens.add({ targets: sprite, angle: { from: -8, to: 8 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      cena.latas.push({ id: o.name, x: o.x, y: o.y, sprite });
    });

    // ---------- MUROS VIRTUAIS ----------
    Conteudo.mapa.muros.forEach(o => {
      if (!o.name || !(o.width > 0 && o.height > 0)) return;
      // o contêiner gira em volta do canto superior esquerdo, igual ao Tiled
      const caixaGiro = cena.add.container(o.x, o.y).setAngle(o.rotation || 0).setDepth(3);
      // dentro do retângulo, um segundo contêiner no centro: vira 180° quando o giro deixaria
      // a arte de cabeça para baixo (Conteudo.muroVirado). Os filhos ficam em -w/2, -h/2.
      const caixa = cena.add.container(o.width / 2, o.height / 2).setAngle(Conteudo.muroVirado(o) ? 180 : 0);
      caixaGiro.add(caixa);
      const fundo = cena.add.image(-o.width / 2, -o.height / 2, 'muro_livre').setOrigin(0, 0).setDisplaySize(o.width, o.height);
      const contorno = cena.add.rectangle(-o.width / 2, -o.height / 2, o.width, o.height).setOrigin(0, 0).setStrokeStyle(6, 0xffe14d).setVisible(false);
      caixa.add([fundo, contorno]);
      const zona = cena.add.zone(-o.width / 2, -o.height / 2, o.width, o.height).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      zona.dados = { tipo: 'muro', id: o.name };
      caixa.add(zona);
      const muro = { id: o.name, objeto: o, centro: Conteudo.centroMuro(o), caixa, fundo, contorno, arte: null };
      cena.muros.push(muro);
      const arteId = p.muros_pintados[o.name];
      if (arteId && Conteudo.arte(arteId)) this.mostrarArte(cena, muro, arteId);
    });
  },

  estadoPin(g) {
    const p = Salvamento.atual;
    if (p.quizzes_concluidos.includes(g.quiz_id)) return 'concluido';
    if (p.murais_visitados.includes(g.id)) return 'visitado';
    return 'nao_visitado';
  },

  atualizarPins(cena) {
    cena.pins.forEach(pin => pin.sprite.setTexture(this.TEXTURA_PIN[this.estadoPin(pin.grafite)]));
  },

  // Carrega a imagem de uma arte (só quando precisa) e chama aoCarregar
  carregarArte(cena, arteId, aoCarregar) {
    const chave = 'arte_' + arteId;
    if (cena.textures.exists(chave)) { aoCarregar(chave); return; }
    cena.load.image(chave, Conteudo.arte(arteId).imagem);
    cena.load.once('filecomplete-image-' + chave, () => aoCarregar(chave));
    cena.load.start();
  },

  // Coloca a arte no muro, mantendo a proporção da imagem (sem esticar)
  mostrarArte(cena, muro, arteId, comEfeito) {
    this.carregarArte(cena, arteId, (chave) => {
      if (!muro.caixa.scene) return;              // a cena já foi fechada
      if (muro.arte) muro.arte.destroy();
      const o = muro.objeto, src = cena.textures.get(chave).source[0];
      const escala = Math.min((o.width - 8) / src.width, (o.height - 8) / src.height);
      muro.fundo.setTexture('muro_base').setDisplaySize(o.width, o.height);   // parede lisa por baixo da arte
      muro.arte = cena.add.image(0, 0, chave).setScale(escala);   // centro do muro
      muro.caixa.addAt(muro.arte, 1);
      if (comEfeito) { muro.arte.setAlpha(0); cena.tweens.add({ targets: muro.arte, alpha: 1, duration: 1300 }); }
    });
  },

  // Distância do jogador até a borda do muro (girado)
  distanciaMuro(muro, x, y) {
    const o = muro.objeto, a = -(o.rotation || 0) * Math.PI / 180;
    const dx = x - o.x, dy = y - o.y;
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    const cx = Math.max(0, Math.min(o.width, lx)), cy = Math.max(0, Math.min(o.height, ly));
    return Math.hypot(lx - cx, ly - cy);
  },

  // A cada quadro: coleta latas, acha o objeto mais próximo e configura o botão A
  atualizar(cena) {
    const j = cena.jogador, inter = Conteudo.jogo().interacao || {};
    // latas: coleta automática ao passar por cima
    for (let i = cena.latas.length - 1; i >= 0; i--) {
      const l = cena.latas[i];
      if (Math.hypot(l.x - j.x, l.y - j.y) <= (inter.distancia_lata || 56)) {
        cena.latas.splice(i, 1);
        if (Progresso.coletarLata(l.id)) {
          Efeitos.estouro(cena, l.x, l.y - 30);
          Efeitos.textoSubindo(cena, l.x, l.y - 60, '+' + (Conteudo.jogo().recompensas.lata_coletavel || 1));
          Sons.tocar('lata');
          HUD.atualizar();
        }
        cena.tweens.killTweensOf(l.sprite);
        cena.tweens.add({ targets: l.sprite, y: l.y - 60, alpha: 0, scale: 1.1, duration: 300, onComplete: () => l.sprite.destroy() });
      }
    }

    // objeto mais próximo dentro da distância de interação
    let alvo = null, menor = Infinity;
    cena.pins.forEach(pin => {
      const d = Math.hypot(pin.x - j.x, pin.y - j.y);
      if (d <= (inter.distancia_pin || 140) && d < menor) { menor = d; alvo = { tipo: 'pin', obj: pin }; }
    });
    cena.muros.forEach(m => {
      const d = this.distanciaMuro(m, j.x, j.y);
      if (d <= (inter.distancia_muro || 130) && d < menor) { menor = d; alvo = { tipo: 'muro', obj: m }; }
    });

    // personagens que dão missões (Npcs.js): ao lado de um deles, conversar tem prioridade
    const npc = Npcs.atualizar(cena);
    if (npc) alvo = { tipo: 'npc', obj: npc };

    // destaque visual de proximidade (RF-MAP-014)
    cena.pins.forEach(pin => {
      const ativo = alvo && alvo.obj === pin;
      pin.anel.setVisible(ativo);
      pin.sprite.setScale(ativo ? 0.95 : 0.8);
    });
    cena.muros.forEach(m => m.contorno.setVisible(!!alvo && alvo.obj === m));

    if (!alvo) { HUD.definirAcao(null); return; }
    if (alvo.tipo === 'npc') {
      HUD.definirAcao('Conversar com ' + (alvo.obj.npc.nome || 'personagem'), () => Npcs.conversar(cena, alvo.obj));
    } else if (alvo.tipo === 'pin') {
      HUD.definirAcao('Ver grafite: ' + alvo.obj.grafite.titulo, () => cena.abrirFicha(alvo.obj.id, true));
    } else {
      const arteId = Salvamento.atual.muros_pintados[alvo.obj.id], arte = arteId && Conteudo.arte(arteId);
      HUD.definirAcao(arte ? `Trocar arte · ${arte.titulo} (${arte.autoria || '—'})` : 'Pintar muro livre', () => cena.abrirMuro(alvo.obj.id));
    }
  },

  // O jogador está perto o bastante deste pin/muro?
  estaPerto(cena, tipo, id) {
    const j = cena.jogador, inter = Conteudo.jogo().interacao || {};
    if (tipo === 'pin') { const p = cena.pins.find(x => x.id === id); return p && Math.hypot(p.x - j.x, p.y - j.y) <= (inter.distancia_pin || 140); }
    const m = cena.muros.find(x => x.id === id);
    return m && this.distanciaMuro(m, j.x, j.y) <= (inter.distancia_muro || 130);
  }
};
