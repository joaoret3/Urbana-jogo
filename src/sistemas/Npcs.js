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
//  - v2.57: com "andar": { "ativo": true, "raio": 300 } o personagem passeia perto do seu
//    ponto no mapa (sem atravessar a colisão, carros ou outros personagens) e para quando o
//    jogador chega perto ou há janela aberta. Para ficar leve no tablet, só andam os que
//    estão perto da câmera, no máximo ANDANDO_MAX ao mesmo tempo.
// =============================================================================
const Npcs = {
  DISTANCIA_BALAO: 230,     // a partir daqui o balão aparece
  DISTANCIA_CONVERSA: 115,  // a partir daqui dá para conversar (botão A)
  VELOCIDADE_ANDAR: 85,     // pixels por segundo de quem passeia (o jogador anda a 260)
  ANDANDO_MAX: 6,           // quantos podem andar ao mesmo tempo
  DISTANCIA_ATIVO: 1400,    // longe da câmera, o personagem fica parado (economiza processamento)

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
      const sombra = cena.add.ellipse(o.x, o.y, lq * 0.42 * escala, aq * 0.12 * escala, 0x0f0c14, 0.32).setDepth(9);
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
      const n = { id: npc.id, npc, x: o.x, y: o.y, sprite, sinal, balao, fundo, texto, nome, textoAtual: null,
        sombra, pe, topoDy: topo - o.y };
      const andar = npc.andar || {};
      if (andar.ativo && colunas > 1) {
        // animações de andar: linhas 1 baixo, 2 esquerda, 3 direita, 4 cima; coluna 1 = parado, as outras = passos
        ['baixo', 'esquerda', 'direita', 'cima'].forEach((dir, l) => {
          const ka = k + '_andar_' + dir;
          if (!cena.anims.exists(ka)) cena.anims.create({ key: ka, frameRate: 9, repeat: -1,
            frames: cena.anims.generateFrameNumbers(k, { start: l * colunas + 1, end: l * colunas + colunas - 1 }) });
        });
        n.andar = { k, colunas, casa: { x: o.x, y: o.y }, raio: Math.max(60, Math.min(1200, Number(andar.raio) || 300)),
          estado: 'parado', ate: cena.time.now + 1000 + Math.random() * 3000, alvo: null, dir: 'baixo' };
      }
      cena.npcs.push(n);
    });
    this.atualizarSinais(cena);
  },

  // Sinal acima da cabeça: círculo com "!" (missão nova) ou "…" (em andamento)
  criarSinal(cena, x, y) {
    const c = cena.add.container(x, y).setDepth(59);
    const g = cena.add.graphics();
    const t = cena.add.text(0, 1, '!', { fontFamily: '"Londrina Solid", Inter, sans-serif', fontSize: '26px', color: '#1d1530' }).setOrigin(0.5);
    c.add([g, t]); c.g = g; c.t = t;
    cena.tweens.add({ targets: [g, t], y: '-=8', duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
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

  // v2.63: quem anda pelo bairro é só figurante — sem conversa, balão nem sinal
  semConversa(n) { return !!(n.npc && n.npc.andar && n.npc.andar.ativo); },

  atualizarSinais(cena) {
    (cena.npcs || []).forEach(n => {
      if (this.semConversa(n)) { n.sinal.setVisible(false); return; }
      const e = this.estado(n.id), s = n.sinal;
      const volta = e === 'andamento' && Achados.aguardando(n.id);   // v2.60: achado esperando entrega
      s.setVisible(e === 'novo' || e === 'andamento');
      s.g.clear();
      s.g.fillStyle(e === 'novo' ? 0xffe14d : volta ? 0x9be21b : 0x9be7ff, 1).lineStyle(3, 0x1d1530, 1);
      s.g.fillCircle(0, 0, 16).strokeCircle(0, 0, 16);
      s.t.setText(e === 'novo' || volta ? '!' : '…');
    });
  },

  // Texto curto do balão
  fraseCurta(n) {
    const e = this.estado(n.id), npc = n.npc;
    if (e === 'novo' || e === 'sem_missao') return npc.fala_chamada || 'Oi!';
    if (e === 'andamento') {
      const s = Missoes.doPersonagem(n.id).map(m => Missoes.situacao(m)).find(x => x.estado === 'andamento');
      if (s && s.missao.tipo === 'mini_jogo') return 'Topa o desafio? Fala comigo!';   // v2.54
      if (s && s.missao.tipo === 'achar_e_voltar') {   // v2.60
        const nome = Achados.cfg(s.missao).nome;
        return Achados.aguardando(n.id) ? `Achou meu ${nome}? Fala comigo!` : `Cadê meu ${nome}? Me ajuda!`;
      }
      return s ? `${s.missao.titulo}: ${s.feito}/${s.meta}` : (npc.fala_chamada || 'Oi!');
    }
    const f = (npc.fala_concluida || 'Valeu!').replace(/^EXEMPLO\s*[–-]\s*/, '');
    return f.length > 60 ? f.slice(0, 57) + '…' : f;
  },

  // A cada quadro (chamado pelo ObjetosDoMapa.atualizar): mostra/esconde os balões
  // e devolve o personagem mais próximo dentro da distância de conversa (ou null)
  atualizar(cena) {
    const j = cena.jogador; if (!j || !cena.npcs) return null;
    this.andarTodos(cena, j);
    let alvo = null, menor = Infinity;
    cena.npcs.forEach(n => {
      if (this.semConversa(n)) { n.balao.setVisible(false); n.sinal.setVisible(false); return; }
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

  // ---------------------------------------------------------------------------
  // PASSEIO (v2.57)
  // ---------------------------------------------------------------------------
  andarTodos(cena, j) {
    const dt = Math.min(100, cena.game.loop.delta || 16), agora = cena.time.now;
    const cam = cena.cameras.main, cx = cam.midPoint.x, cy = cam.midPoint.y;
    const parar = Interface.algumAberto();
    let andando = 0;
    cena.npcs.forEach(n => {
      const a = n.andar; if (!a) return;
      if (Math.hypot(n.x - cx, n.y - cy) > this.DISTANCIA_ATIVO) { if (a.estado === 'andando') this.ficarParado(n, agora); return; }
      // figurante (sem conversa) não espera o jogador: só desvia dele (v2.63)
      const perto = !this.semConversa(n) && Math.hypot(n.x - j.x, n.y - j.y) <= this.DISTANCIA_BALAO;
      if (perto || parar) {
        // espera o jogador: para e olha para ele
        if (a.estado === 'andando' || perto) {
          const dx = j.x - n.x, dy = j.y - n.y;
          a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esquerda' : 'direita') : (dy < 0 ? 'cima' : 'baixo');
          this.ficarParado(n, agora + 1500);
        }
        return;
      }
      if (a.estado === 'parado') {
        if (agora < a.ate || andando >= this.ANDANDO_MAX) return;
        const alvo = this.escolherAlvo(cena, n);
        if (!alvo) { a.ate = agora + 1500; return; }
        a.alvo = alvo; a.estado = 'andando';
        const dx = alvo.x - n.x, dy = alvo.y - n.y;
        a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esquerda' : 'direita') : (dy < 0 ? 'cima' : 'baixo');
        n.sprite.anims.play(a.k + '_andar_' + a.dir, true);
      }
      if (a.estado !== 'andando') return;
      andando++;
      const dx = a.alvo.x - n.x, dy = a.alvo.y - n.y, d = Math.hypot(dx, dy);
      const passo = this.VELOCIDADE_ANDAR * dt / 1000;
      if (d <= passo) { this.mover(n, a.alvo.x, a.alvo.y); this.ficarParado(n, agora + 1200 + Math.random() * 2800); return; }
      const nx = n.x + dx / d * passo, ny = n.y + dy / d * passo;
      if (!this.livre(cena, n, nx, ny) || Math.hypot(nx - j.x, ny - j.y) < 70) { this.ficarParado(n, agora + 1200); return; }
      this.mover(n, nx, ny);
    });
  },

  ficarParado(n, ate) {
    const a = n.andar;
    a.estado = 'parado'; a.ate = ate; a.alvo = null;
    const linha = ['baixo', 'esquerda', 'direita', 'cima'].indexOf(a.dir);
    n.sprite.anims.stop();
    n.sprite.setFrame(Math.max(0, linha) * a.colunas);
  },

  // Ponto sorteado perto da "casa" do personagem, com o caminho em linha reta livre
  escolherAlvo(cena, n) {
    const a = n.andar;
    for (let t = 0; t < 12; t++) {
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * a.raio;
      const x = a.casa.x + Math.cos(ang) * dist, y = a.casa.y + Math.sin(ang) * dist * 0.75;
      if (Math.hypot(x - n.x, y - n.y) < 50) continue;
      if (this.caminhoLivre(cena, n, n.x, n.y, x, y)) return { x, y };
    }
    return null;
  },

  caminhoLivre(cena, n, x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), passos = Math.max(1, Math.ceil(d / 16));
    for (let i = 1; i <= passos; i++) {
      if (!this.livre(cena, n, x0 + (x1 - x0) * i / passos, y0 + (y1 - y0) * i / passos)) return false;
    }
    return true;
  },

  // Os pés cabem neste ponto? (colisão do mapa + carros e outros personagens)
  livre(cena, n, x, y) {
    if (Conteudo.bloqueado(x - 14, y) || Conteudo.bloqueado(x + 14, y) || Conteudo.bloqueado(x, y - 6)) return false;
    const corpos = cena.physics.overlapRect(x - 14, y - 10, 28, 14, false, true);
    for (let i = 0; i < corpos.length; i++) if (corpos[i] !== n.pe.body) return false;
    return true;
  },

  mover(n, x, y) {
    const dx = x - n.x, dy = y - n.y;
    n.x = x; n.y = y;
    n.sprite.setPosition(x, y).setDepth(10 + y / 100000);
    n.sombra.setPosition(x, y);
    n.pe.setPosition(n.pe.x + dx, n.pe.y + dy); n.pe.body.updateFromGameObject();
    n.sinal.setPosition(x, y + n.topoDy - 18);
    n.balao.setPosition(x, y + n.topoDy - 14);
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
    if (primeira) ObjetosDoMapa.criarLetras(cena);   // v2.58: letras de missões deste personagem aparecem agora
    if (primeira) Achados.criar(cena);               // v2.60: o gatinho se esconde agora
    const agradece = primeira ? null : Achados.entregar(cena, n);   // v2.60: trouxe o gatinho → conclui a missão
    if (primeira) {
      Sons.tocar('descoberta');
      Efeitos.estouro(cena, n.x, n.y - 80, 24);
    }
    const E = Interface.el.bind(Interface), npc = n.npc, e = this.estado(n.id);
    const fala = agradece || (primeira ? (npc.fala_inicial || npc.fala_chamada) : e === 'concluido' ? npc.fala_concluida : (npc.fala_andamento || npc.fala_inicial));
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
          Missoes.elementoLetras(s),
          Achados.elementoEtapa(s, true),
          E('div', { class: 'missao-progresso' },
            E('div', { class: 'barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.meta), 'aria-valuenow': String(s.feito) },
              E('div', { class: 'barra-preenchimento', style: { width: Math.round(100 * s.feito / s.meta) + '%' } })),
            E('span', { class: 'missao-conta' }, `${s.feito} / ${s.meta}`)),
          E('p', { class: 'missao-recompensa' }, 'Recompensa: ', E('strong', {}, Missoes.textoRecompensa(s.missao.recompensa))),
          // v2.54: missão de mini-jogo — o desafio abre por cima desta conversa; ao sair dele, a conversa fecha
          s.missao.tipo === 'mini_jogo' && s.estado !== 'trancada' ? E('div', { class: 'missao-jogar' },
            Interface.botao(s.estado === 'concluida' ? 'Jogar de novo' : 'Jogar: ' + MiniJogos.nome(MiniJogos.config(s.missao).jogo),
              () => MiniJogos.abrir(s.missao, { aoFechar: () => janela.fechar() }), { tipo: s.estado === 'concluida' ? '' : 'principal', icone: 'play' })) : null)))
      ],
      rodape: [Interface.botao(primeira ? 'Bora!' : 'Voltar ao jogo', () => janela.fechar(), { tipo: 'principal', icone: 'play' })]
    });
    if (primeira) Interface.notificar({ tipo: 'missao', titulo: 'Nova missão!', texto: `${npc.nome}: ${(missoes[0] || { missao: { titulo: '' } }).missao.titulo}` });
    this.atualizarSinais(cena);
    cena.aguardarJanelas(() => { this.atualizarSinais(cena); HUD.atualizar(); });
  }
};
