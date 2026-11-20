// =============================================================================
// ACHADOS — missão "achar algo escondido e voltar ao personagem" (v2.60)
// -----------------------------------------------------------------------------
// Ex.: o gatinho que roubou o biscoito da Vice Priscilla.
//  - Depois da 1ª conversa com o personagem, o achado (gato) aparece num ponto de
//    lata sorteado, longe do personagem, e fica salvo para aquele jogador.
//  - Perto dele: balão "miau!" e miado. Pegadas no chão levam até o esconderijo.
//  - Se "foge" estiver ligado, na 1ª aproximação ele corre para outro esconderijo.
//  - Botão A no achado: aviso "Gatinho encontrado!"; ele passa a seguir o jogador.
//  - Na conversa seguinte com o personagem, a missão termina e dá a recompensa;
//    o gatinho fica sentado ao lado do personagem.
// Configuração na missão (dados/missoes.js):
//   "tipo": "achar_e_voltar", "meta": 1, "personagem": "npc_01",
//   "achado": { "nome": "gatinho", "imagem": "assets/missoes/gato_laranjinha.png",
//               "mensagem": "...", "fala_entrega": "...", "foge": true, "segue": true, "pegadas": true }
// Estado salvo: partida.achados[missao_id] = { id, x, y, fugiu, encontrado, entregue }
// =============================================================================
const Achados = {
  DIST_MIAU: 480,       // a esta distância começa o "miau!"
  DIST_FUGA: 175,       // na 1ª vez que o jogador chega aqui, ele foge (se "foge")
  DIST_PEGAR: 115,      // daqui dá para pegar (botão A)
  DIST_MIN_NPC: 1100,   // o esconderijo fica pelo menos a esta distância do personagem
  ALTURA: 74,           // altura do achado no mapa (a lata tem ≈ 89)

  cfg(m) {
    const a = m.achado || {};
    const nome = a.nome || 'gatinho';
    return {
      nome,
      imagem: a.imagem || 'assets/missoes/gato_laranjinha.png',
      mensagem: a.mensagem || `Achou o ${nome}!`,
      fala_entrega: a.fala_entrega || 'Você achou! Valeu demais. Toma, isso é pra você.',
      foge: a.foge !== false, segue: a.segue !== false, pegadas: a.pegadas !== false
    };
  },
  chave(m) { return 'achado:' + this.cfg(m).imagem; },

  missoes() { return Missoes.todas().filter(m => m.tipo === 'achar_e_voltar' && Conteudo.missaoPossivel(m)); },

  // Imagens dos achados (chamado pela CenaCarga)
  carregar(cena) {
    const feitas = {};
    // na CenaCarga o Conteudo ainda não montou os dados: lê direto de URBANA_DADOS
    const fonte = [Conteudo.dados && Conteudo.dados.missoes, window.URBANA_DADOS && window.URBANA_DADOS.missoes]
      .find(f => f && Array.isArray(f.missoes)) || { missoes: [] };
    (fonte.missoes || []).forEach(m => {
      if (m.tipo !== 'achar_e_voltar') return;
      const k = this.chave(m);
      if (!feitas[k]) { feitas[k] = 1; cena.load.image(k, this.cfg(m).imagem); }
    });
  },

  // Pontos de lata ocupados por achados ainda escondidos
  pontosOcupados(p) {
    const ids = new Set();
    Object.keys((p && p.achados) || {}).forEach(mid => { const e = p.achados[mid]; if (e && !e.encontrado && e.id) ids.add(e.id); });
    return ids;
  },

  // Sorteia um esconderijo (ponto de lata) livre, longe do personagem e, se pedido, longe de "perto"
  sortear(p, m, perto) {
    const casa = (Conteudo.mapa.npcs || []).find(o => o.name === m.personagem);
    const usados = this.pontosOcupados(p);
    ObjetosDoMapa.pontosDeLetras(p).forEach(id => usados.add(id));
    if (ObjetosDoMapa.dourada && !ObjetosDoMapa.dourada.coletada) usados.add(ObjetosDoMapa.dourada.id);
    const todos = Conteudo.mapa.latas.filter(o => !usados.has(o.name));
    const bom = o => (!casa || Math.hypot(o.x - casa.x, o.y - casa.y) >= this.DIST_MIN_NPC) &&
      (!perto || (Math.hypot(o.x - perto.x, o.y - perto.y) >= 600 && Math.hypot(o.x - perto.x, o.y - perto.y) <= 1800));
    const lista = todos.filter(bom).length ? todos.filter(bom) : todos;
    const o = lista[Math.floor(Math.random() * lista.length)];
    return { id: o.name, x: Math.round(o.x), y: Math.round(o.y) };
  },

  // ---------------------------------------------------------------------------
  // MAPA
  // ---------------------------------------------------------------------------
  criar(cena) {
    (cena.achados || []).forEach(a => this.destruir(cena, a));
    cena.achados = [];
    const p = Salvamento.atual; if (!p) return;
    // imagens que ainda não foram carregadas: carrega agora e monta quando chegarem
    const faltam = this.missoes().filter(m => !cena.textures.exists(this.chave(m)));
    if (faltam.length && !this._carregando) {
      this._carregando = true;
      faltam.forEach(m => cena.load.image(this.chave(m), this.cfg(m).imagem));
      cena.load.once('complete', () => { this._carregando = false; if (cena.sys && cena.sys.isActive()) this.criar(cena); });
      cena.load.start();
    }
    this.missoes().forEach(m => {
      const c = this.cfg(m);
      if (!cena.textures.exists(this.chave(m))) return;
      const concluida = p.missoes_concluidas.includes(m.id);
      let est = p.achados[m.id];
      if (!concluida && !Missoes.liberada(m)) return;
      if (concluida && !(est && est.entregue)) return;   // concluída de outro jeito: nada no mapa
      if (!est) { est = p.achados[m.id] = Object.assign(this.sortear(p, m), { fugiu: false, encontrado: false, entregue: false }); Salvamento.salvar(); }
      const a = { missao: m, cfg: c, est, modo: est.entregue ? 'em_casa' : est.encontrado ? (c.segue ? 'segue' : 'some') : 'escondido' };
      if (a.modo === 'some') return;
      let x = est.x, y = est.y;
      if (a.modo === 'em_casa') {
        const n = (cena.npcs || []).find(q => q.id === m.personagem);
        if (!n) return;
        x = n.x + 62; y = n.y + 6;
      } else if (a.modo === 'segue') { x = cena.jogador.x - 50; y = cena.jogador.y + 8; }
      this.montar(cena, a, x, y);
      cena.achados.push(a);
    });
  },

  montar(cena, a, x, y) {
    const tex = cena.textures.get(this.chave(a.missao)).getSourceImage();
    const esc = this.ALTURA / (tex.height || this.ALTURA);
    a.x = x; a.y = y; a.esc = esc;
    a.sombra = cena.add.ellipse(x, y, 52, 14, 0x0f0c14, 0.3).setDepth(9);
    a.sprite = cena.add.image(x, y, this.chave(a.missao)).setOrigin(0.5, 1).setScale(esc).setDepth(10 + y / 100000);
    a.balao = cena.add.text(x, y - this.ALTURA - 8, 'miau!', {
      fontFamily: '"Londrina Solid", Inter, sans-serif', fontSize: '24px', color: '#1d1530',
      backgroundColor: '#ffffff', padding: { x: 8, y: 2 } }).setOrigin(0.5, 1).setDepth(20).setAlpha(0);
    a.proximoMiau = 0;
    if (a.modo === 'escondido') {
      this.tirarLata(cena, a.est.id);
      if (a.cfg.pegadas) this.desenharPegadas(cena, a);
      if (!Efeitos.menosMovimento()) a.tween = cena.tweens.add({ targets: a.sprite, scaleY: esc * 0.93, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  },

  destruir(cena, a) {
    if (a.tween) a.tween.remove();
    cena.tweens.killTweensOf(a.sprite); cena.tweens.killTweensOf(a.balao);
    [a.sprite, a.sombra, a.balao].forEach(o => o && o.destroy());
    (a.pegadas || []).forEach(o => o.destroy());
    a.pegadas = [];
  },

  // A lata comum do esconderijo não aparece por cima do achado
  tirarLata(cena, pontoId) {
    const j = (cena.latas || []).findIndex(l => l.id === pontoId);
    if (j >= 0) { cena.tweens.killTweensOf(cena.latas[j].sprite); cena.latas[j].sprite.destroy(); cena.latas.splice(j, 1); }
  },

  // Patinhas no chão chegando ao esconderijo, vindas de uma direção sorteada (só em lugar livre)
  desenharPegadas(cena, a) {
    (a.pegadas || []).forEach(o => o.destroy());
    a.pegadas = [];
    for (let t = 0; t < 10 && !a.pegadas.length; t++) {
      const ang = Math.random() * Math.PI * 2;
      const pts = [];
      for (let k = 0; k < 7; k++) {
        const d = 110 + k * 55, lado = (k % 2 ? 9 : -9);
        const x = a.est.x + Math.cos(ang) * d - Math.sin(ang) * lado, y = a.est.y + Math.sin(ang) * d + Math.cos(ang) * lado;
        if (Conteudo.bloqueado(x, y)) break;
        pts.push({ x, y });
      }
      if (pts.length < 4) continue;
      pts.forEach((pt, k) => {
        const g = cena.add.graphics({ x: pt.x, y: pt.y }).setDepth(8.5).setRotation(ang - Math.PI / 2).setScale(1.3).setAlpha(0.78 - k * 0.05);
        g.fillStyle(0x3a2a1c, 1).fillEllipse(0, 3, 12, 10)
          .fillCircle(-6, -5, 3).fillCircle(-2, -8, 3).fillCircle(2, -8, 3).fillCircle(6, -5, 3);
        a.pegadas.push(g);
      });
    }
  },

  mover(a, x, y) {
    a.x = x; a.y = y;
    a.sprite.setPosition(x, y).setDepth(10 + y / 100000);
    a.sombra.setPosition(x, y);
    a.balao.setPosition(x, y - this.ALTURA - 8);
  },

  // A cada quadro: miado, fuga, gato seguindo. Devolve o achado que pode ser pego agora (ou null).
  atualizar(cena) {
    const j = cena.jogador; if (!j || !cena.achados || !cena.achados.length) return null;
    const agora = cena.time.now, dt = Math.min(100, cena.game.loop.delta || 16);
    let alvo = null;
    cena.achados.forEach(a => {
      const d = Math.hypot(a.x - j.x, a.y - j.y);
      if (a.modo === 'escondido') {
        if (a.fugindo) return;
        if (d <= this.DIST_MIAU && agora >= a.proximoMiau && !Interface.algumAberto()) {
          a.proximoMiau = agora + 3200;
          this.miar(cena, a);
        }
        if (a.cfg.foge && !a.est.fugiu && d <= this.DIST_FUGA) { this.fugir(cena, a); return; }
        if (d <= this.DIST_PEGAR) alvo = a;
      } else if (a.modo === 'segue') {
        // anda atrás do jogador, pulando de leve
        const alvoX = j.x - 46, alvoY = j.y + 10;
        const dx = alvoX - a.x, dy = alvoY - a.y, dd = Math.hypot(dx, dy);
        if (dd > 400) { this.mover(a, alvoX, alvoY); return; }
        if (dd > 30) {
          const passo = Math.min(dd - 20, Math.max(120, dd * 3.2) * dt / 1000);
          this.mover(a, a.x + dx / dd * passo, a.y + dy / dd * passo);
          if (Math.abs(dx) > 4) a.sprite.setFlipX(dx < 0);
          a.sprite.y = a.y - Math.abs(Math.sin(agora / 90)) * 7;
        } else a.sprite.y = a.y;
      }
    });
    return alvo;
  },

  miar(cena, a) {
    Sons.tocar('miau');
    cena.tweens.killTweensOf(a.balao);
    a.balao.setAlpha(1).setY(a.y - this.ALTURA - 8);
    cena.tweens.add({ targets: a.balao, y: a.y - this.ALTURA - 26, alpha: 0, delay: 900, duration: 700 });
  },

  // 1ª aproximação: corre para outro esconderijo (fica salvo)
  fugir(cena, a) {
    const p = Salvamento.atual;
    const novo = this.sortear(p, a.missao, { x: a.est.x, y: a.est.y });
    a.est.fugiu = true; a.est.id = novo.id; a.est.x = novo.x; a.est.y = novo.y;
    Salvamento.salvar();
    a.fugindo = true;
    this.miar(cena, a);
    (a.pegadas || []).forEach(o => o.destroy()); a.pegadas = [];
    const j = cena.jogador, ang = Math.atan2(a.y - j.y, a.x - j.x);
    a.sprite.setFlipX(Math.cos(ang) < 0);
    cena.tweens.add({ targets: [a.sprite, a.sombra], x: a.x + Math.cos(ang) * 320, y: '+=' + Math.round(Math.sin(ang) * 320), alpha: 0, duration: 650, ease: 'Quad.easeIn',
      onComplete: () => {
        a.sprite.setAlpha(1).setFlipX(false); a.sombra.setAlpha(0.3);
        this.mover(a, novo.x, novo.y);
        this.tirarLata(cena, novo.id);
        if (a.cfg.pegadas) this.desenharPegadas(cena, a);
        a.fugindo = false;
      } });
    Interface.notificar({ tipo: 'missao', imagem: a.cfg.imagem, tempo: 4200,
      titulo: `O ${a.cfg.nome} fugiu!`, texto: 'Ele correu para outro esconderijo. Siga as pegadas e escute os miados!' });
  },

  // Botão A no achado
  encontrar(cena, a) {
    if (a.est.encontrado) return;
    cena.pararJogador();
    a.est.encontrado = true;
    Salvamento.salvar();
    if (a.tween) { a.tween.remove(); a.tween = null; }
    a.sprite.setScale(a.esc);
    (a.pegadas || []).forEach(o => o.destroy()); a.pegadas = [];
    Sons.tocar('miau'); Sons.tocar('descoberta');
    Efeitos.estouro(cena, a.x, a.y - 40, 20);
    const m = a.missao, c = a.cfg, npc = Conteudo.npc(m.personagem) || {}, quem = npc.nome || 'o personagem';
    const Nome = c.nome.charAt(0).toUpperCase() + c.nome.slice(1);
    const E = Interface.el.bind(Interface);
    let janela;
    janela = Interface.abrirPainel({
      titulo: `${Nome} encontrado!`,
      classe: 'painel-achado',
      conteudo: [
        E('img', { class: 'achado-imagem', src: c.imagem, alt: '' }),
        E('p', { class: 'achado-texto' }, c.mensagem),
        E('p', { class: 'achado-volte' }, `Volte até ${quem} para receber sua recompensa.`),
        E('p', { class: 'achado-rec' }, 'Recompensa: ', E('strong', {}, Missoes.textoRecompensa(m.recompensa)))
      ],
      rodape: [Interface.botao(c.segue ? `Levar o ${c.nome} de volta` : 'Voltar ao jogo', () => janela.fechar(), { tipo: 'principal', icone: 'play' })]
    });
    if (c.segue) a.modo = 'segue';
    else { this.destruir(cena, a); cena.achados.splice(cena.achados.indexOf(a), 1); }
    Npcs.atualizarSinais(cena);
    HUD.atualizar();
  },

  // Há achado encontrado esperando ser entregue a este personagem?
  aguardando(npcId) {
    const p = Salvamento.atual; if (!p) return null;
    return this.missoes().find(m => m.personagem === npcId && !p.missoes_concluidas.includes(m.id) &&
      p.achados[m.id] && p.achados[m.id].encontrado && !p.achados[m.id].entregue) || null;
  },

  // Conversa com o personagem: entrega o achado (conclui a missão). Devolve a fala de agradecimento ou null.
  entregar(cena, n) {
    const m = this.aguardando(n.id); if (!m) return null;
    const p = Salvamento.atual;
    p.achados[m.id].entregue = true;
    Progresso.concluirAcao();
    const a = (cena.achados || []).find(x => x.missao.id === m.id);
    if (a) { a.modo = 'em_casa'; a.sprite.setFlipX(false); this.mover(a, n.x + 62, n.y + 6); a.sprite.y = a.y; }
    Efeitos.estouro(cena, n.x + 62, n.y - 40, 16);
    return this.cfg(m).fala_entrega;
  },

  // Dica da região onde está o achado (a partir do personagem)
  dica(m) {
    const p = Salvamento.atual, est = p && p.achados[m.id];
    const casa = (Conteudo.mapa.npcs || []).find(o => o.name === m.personagem);
    if (!est || !casa) return '';
    const dx = est.x - casa.x, dy = est.y - casa.y, d = Math.hypot(dx, dy);
    const nomes = ['leste (para a direita)', 'sudeste (para baixo e à direita)', 'sul (para baixo)', 'sudoeste (para baixo e à esquerda)',
      'oeste (para a esquerda)', 'noroeste (para cima e à esquerda)', 'norte (para cima)', 'nordeste (para cima e à direita)'];
    const i = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
    return `Vi ele correndo para o ${nomes[i]} daqui, ${d < 1800 ? 'não muito longe' : 'bem longe'}. Siga as pegadas e escute os miados!`;
  },

  // Etapa da missão para as telas de Missões e de conversa
  elementoEtapa(s, comDica) {
    const m = s.missao;
    if (m.tipo !== 'achar_e_voltar' || s.estado !== 'andamento') return null;
    const p = Salvamento.atual, est = p && p.achados[m.id], c = this.cfg(m);
    const npc = Conteudo.npc(m.personagem) || {};
    const E = Interface.el.bind(Interface);
    if (est && est.encontrado) return E('p', { class: 'missao-etapa feita' }, `${c.nome.charAt(0).toUpperCase() + c.nome.slice(1)} encontrado! Volte até ${npc.nome || 'o personagem'} para receber a recompensa.`);
    return E('div', {},
      E('p', { class: 'missao-etapa' }, `Procure o ${c.nome} pelo bairro.`),
      comDica && est ? E('p', { class: 'missao-dica' }, this.dica(m)) : null);
  }
};
