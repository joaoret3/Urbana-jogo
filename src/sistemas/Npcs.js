// =============================================================================
// PERSONAGENS DO BAIRRO (NPCs) — quem dá as missões especiais (quests), v2.29
// -----------------------------------------------------------------------------
// Os personagens ficam em dados/npcs.js (nome, falas, folha de sprites) e a
// posição de cada um na camada "npcs" do mapa (objeto com o nome = id do personagem).
// As missões de cada um ficam em dados/missoes.js com "personagem": "<id>".
//
//  - De longe: um sinal em cima da cabeça ("!" = missão nova; "…" = missão em andamento).
//  - De perto: abre um balão com uma fala curta e o botão A vira "Conversar com <nome>".
//  - Na 1ª conversa as missões do personagem são liberadas (Missoes.encontrar) e só contam
//    o que o jogador fizer dali em diante.
// =============================================================================
const Npcs = {
  DISTANCIA_BALAO: 230,     // a partir daqui o balão aparece
  DISTANCIA_CONVERSA: 115,  // a partir daqui dá para conversar (botão A)

  chave(n) { return 'npc_' + n.id; },

  // No preload da CenaMapa: carrega as folhas de sprites dos personagens que estão no mapa
  carregar(cena) {
    this.noMapa().forEach(({ npc }) => {
      const s = npc.sprite || {};
      if (s.arquivo && !cena.textures.exists(this.chave(npc))) {
        cena.load.spritesheet(this.chave(npc), s.arquivo, { frameWidth: Number(s.largura_quadro) || 96, frameHeight: Number(s.altura_quadro) || 96 });
      }
    });
  },

  // pares { npc (dados), o (objeto do mapa) } só dos personagens cadastrados e colocados no mapa
  noMapa() {
    const objs = (Conteudo.mapa && Conteudo.mapa.npcs) || [];
    return objs.map(o => ({ o, npc: Conteudo.npc(o.name) })).filter(x => x.npc);
  },

  criar(cena) {
    const cfg = window.URBANA;
    cena.npcs = [];
    this.noMapa().forEach(({ npc, o }) => {
      const k = this.chave(npc), s = npc.sprite || {};
      if (!cena.textures.exists(k)) return;
      const lq = Number(s.largura_quadro) || 96, aq = Number(s.altura_quadro) || 96;
      const tex = cena.textures.get(k).source[0], colunas = Math.max(1, Math.floor(tex.width / lq));
      const linha = Math.max(0, (Number(s.linha_parado) || 1) - 1), quadros = Math.max(1, Math.min(Number(s.quadros) || colunas, colunas));
      const anim = k + '_parado';
      if (!cena.anims.exists(anim)) {
        cena.anims.create({ key: anim, frameRate: Number(s.quadros_por_segundo) || 5, repeat: -1, yoyo: true,
          frames: cena.anims.generateFrameNumbers(k, { start: linha * colunas, end: linha * colunas + quadros - 1 }) });
      }
      const prop = 96 / aq, escala = cfg.AVATAR_ESCALA * prop;   // quadros maiores que 96 px ficam do mesmo tamanho
      cena.add.ellipse(o.x, o.y, lq * 0.42 * escala, aq * 0.12 * escala, 0x0f0c14, 0.32).setDepth(9);
      const sprite = cena.add.sprite(o.x, o.y, k, linha * colunas).setOrigin(0.5, 0.9).setScale(escala).setDepth(10 + o.y / 100000);
      sprite.anims.play(anim);
      // não dá para atravessar o personagem (só os pés bloqueiam, como no jogador)
      const pe = cena.add.zone(o.x, o.y - aq * 0.05 * prop, lq * 0.34 * (cfg.AVATAR_ESCALA_PES || cfg.AVATAR_ESCALA) * prop, aq * 0.14 * (cfg.AVATAR_ESCALA_PES || cfg.AVATAR_ESCALA) * prop);
      cena.physics.add.existing(pe, true);
      if (cena.jogador) cena.physics.add.collider(cena.jogador, pe);
      // sinal em cima da cabeça e balão de fala
      const topo = o.y - aq * 0.9 * escala;
      const sinal = this.criarSinal(cena, o.x, topo - 18);
      const balao = cena.add.container(o.x, topo - 14).setDepth(60).setVisible(false);
      const fundo = cena.add.graphics(), texto = cena.add.text(0, 0, '', {
        fontFamily: '"Londrina Solid", Inter, sans-serif', fontSize: '22px', color: '#1d1530', align: 'center',
        wordWrap: { width: 260 } }).setOrigin(0.5, 1);
      const nome = cena.add.text(0, 0, npc.nome || '', { fontFamily: '"Londrina Solid", Inter, sans-serif', fontSize: '18px',
        color: '#ffffff', backgroundColor: '#7b3bea', padding: { x: 8, y: 2 } }).setOrigin(0.5, 1);
      balao.add([fundo, texto, nome]);
      cena.npcs.push({ id: npc.id, npc, x: o.x, y: o.y, sprite, sinal, balao, fundo, texto, nome, textoAtual: null });
    });
    this.atualizarSinais(cena);
  },

  // Sinal acima da cabeça: círculo com "!" (missão nova) ou "…" (em andamento)
  criarSinal(cena, x, y) {
    const c = cena.add.container(x, y).setDepth(59);
    const g = cena.add.graphics();
    const t = cena.add.text(0, 1, '!', { fontFamily: '"Londrina Solid", Inter, sans-serif', fontSize: '26px', color: '#1d1530' }).setOrigin(0.5);
    c.add([g, t]); c.g = g; c.t = t;
    cena.tweens.add({ targets: c, y: y - 8, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return c;
  },

  // Estado do personagem para o jogador atual: 'novo' | 'andamento' | 'concluido' | 'sem_missao'
  estado(npcId) {
    const ms = Missoes.doPersonagem(npcId).filter(m => Conteudo.missaoPossivel(m));
    if (!ms.length) return 'sem_missao';
    const p = Salvamento.atual;
    if (!p || !p.personagens_encontrados[npcId]) return 'novo';
    return ms.every(m => p.missoes_concluidas.includes(m.id)) ? 'concluido' : 'andamento';
  },

  atualizarSinais(cena) {
    (cena.npcs || []).forEach(n => {
      const e = this.estado(n.id), s = n.sinal;
      s.setVisible(e === 'novo' || e === 'andamento');
      s.g.clear();
      s.g.fillStyle(e === 'novo' ? 0xffe14d : 0x9be7ff, 1).lineStyle(3, 0x1d1530, 1);
      s.g.fillCircle(0, 0, 16).strokeCircle(0, 0, 16);
      s.t.setText(e === 'novo' ? '!' : '…');
    });
  },

  // Texto curto do balão
  fraseCurta(n) {
    const e = this.estado(n.id), npc = n.npc;
    if (e === 'novo' || e === 'sem_missao') return npc.fala_chamada || 'Oi!';
    if (e === 'andamento') {
      const s = Missoes.doPersonagem(n.id).map(m => Missoes.situacao(m)).find(x => x.estado === 'andamento');
      return s ? `${s.missao.titulo}: ${s.feito}/${s.meta}` : (npc.fala_chamada || 'Oi!');
    }
    const f = (npc.fala_concluida || 'Valeu!').replace(/^EXEMPLO\s*[–-]\s*/, '');
    return f.length > 60 ? f.slice(0, 57) + '…' : f;
  },

  // A cada quadro (chamado pelo ObjetosDoMapa.atualizar): mostra/esconde os balões
  // e devolve o personagem mais próximo dentro da distância de conversa (ou null)
  atualizar(cena) {
    const j = cena.jogador; if (!j || !cena.npcs) return null;
    let alvo = null, menor = Infinity;
    cena.npcs.forEach(n => {
      const d = Math.hypot(n.x - j.x, n.y - j.y);
      const ver = d <= this.DISTANCIA_BALAO;
      if (ver) {
        const t = this.fraseCurta(n);
        if (t !== n.textoAtual) this.desenharBalao(n, t);
      }
      n.balao.setVisible(ver);
      n.sinal.setAlpha(ver ? 0 : 1);
      if (d <= this.DISTANCIA_CONVERSA && d < menor) { menor = d; alvo = n; }
    });
    return alvo;
  },

  desenharBalao(n, t) {
    n.textoAtual = t;
    n.texto.setText(t);
    const w = Math.max(120, n.texto.width + 32), h = n.texto.height + 26;
    n.texto.setPosition(0, -14);
    n.nome.setPosition(-w / 2 + n.nome.width / 2 + 10, -h - 2);
    n.fundo.clear();
    n.fundo.fillStyle(0xffffff, 0.96).lineStyle(3, 0x1d1530, 1);
    n.fundo.fillRoundedRect(-w / 2, -h, w, h, 14).strokeRoundedRect(-w / 2, -h, w, h, 14);
    // "rabinho" do balão apontando para o personagem
    n.fundo.fillTriangle(-12, -2, 12, -2, 0, 14).lineBetween(-12, 0, 0, 14).lineBetween(12, 0, 0, 14);
  },

  // Conversa: libera as missões na 1ª vez e mostra o painel com falas e missões
  conversar(cena, n) {
    cena.pararJogador();
    const primeira = Missoes.encontrar(n.id);
    if (primeira) {
      Sons.tocar('descoberta');
      Efeitos.estouro(cena, n.x, n.y - 80, 24);
    }
    const E = Interface.el.bind(Interface), npc = n.npc, e = this.estado(n.id);
    const fala = primeira ? (npc.fala_inicial || npc.fala_chamada) : e === 'concluido' ? npc.fala_concluida : (npc.fala_andamento || npc.fala_inicial);
    const missoes = Missoes.doPersonagem(n.id).map(m => Missoes.situacao(m)).filter(s => s.estado !== 'indisponivel');
    const rotulo = { andamento: 'Em andamento', concluida: 'Concluída', trancada: '' };
    let janela;
    janela = Interface.abrirPainel({
      titulo: npc.nome || 'Personagem',
      classe: 'painel-npc',
      conteudo: [
        E('div', { class: 'npc-conversa' },
          npc.retrato ? E('img', { class: 'npc-retrato', src: npc.retrato, alt: '' }) : null,
          E('p', { class: 'npc-fala' }, fala || '')),
        missoes.length ? E('h3', { class: 'npc-missoes-titulo' }, primeira ? Interface.comIcone('bandeira', 'Nova missão!') : Interface.comIcone('bandeira', 'Missão')) : null,
        E('ul', { class: 'missoes-lista' }, missoes.map(s => E('li', { class: 'missao missao-' + s.estado },
          E('div', { class: 'missao-topo' }, E('h3', {}, s.missao.titulo),
            E('span', { class: 'missao-selo' }, s.estado === 'concluida' ? Interface.comIcone('ok', rotulo.concluida) : Interface.comIcone('play', rotulo.andamento))),
          E('p', { class: 'missao-descricao' }, s.missao.descricao),
          E('div', { class: 'missao-progresso' },
            E('div', { class: 'barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.meta), 'aria-valuenow': String(s.feito) },
              E('div', { class: 'barra-preenchimento', style: { width: Math.round(100 * s.feito / s.meta) + '%' } })),
            E('span', { class: 'missao-conta' }, `${s.feito} / ${s.meta}`)),
          E('p', { class: 'missao-recompensa' }, 'Recompensa: ', E('strong', {}, Missoes.textoRecompensa(s.missao.recompensa))))))
      ],
      rodape: [Interface.botao(primeira ? 'Bora!' : 'Voltar ao jogo', () => janela.fechar(), { tipo: 'principal', icone: 'play' })]
    });
    if (primeira) Interface.notificar({ tipo: 'missao', titulo: 'Nova missão!', texto: `${npc.nome}: ${(missoes[0] || { missao: { titulo: '' } }).missao.titulo}` });
    this.atualizarSinais(cena);
    cena.aguardarJanelas(() => { this.atualizarSinais(cena); HUD.atualizar(); });
  }
};
