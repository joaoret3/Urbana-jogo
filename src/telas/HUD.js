// =============================================================================
// HUD — informações e botões que ficam na tela durante a exploração (Tela 03)
// -----------------------------------------------------------------------------
//   canto superior esquerdo:  retrato do avatar (com moldura), nível e barra de XP
//   canto superior direito:   latas de spray, Missões (estrela com quantas já foram concluídas),
//                             Black Book (livro) e Menu (engrenagem), numa linha só de ícones
//   canto inferior esquerdo:  joystick virtual
//   canto inferior direito:   botão de ação "A" (fica destacado perto de algo)
//
// A CenaMapa usa:
//   HUD.montar({ aoAbrirMenu, aoAbrirBlackBook, aoAbrirPerfil, aoAbrirMissoes })
//   HUD.atualizar()                  depois de mudar XP, latas, avatar...
//   HUD.definirAcao(rotulo, funcao)  mostra o que o botão A faz (ou null)
//   HUD.acionar()                    aperta o botão A (teclas E, Espaço, Enter)
// =============================================================================
const HUD = {
  elementos: null,
  acao: null,

  // Ícone da lata de spray: o mesmo desenho das latas do mapa (v2.48)
  iconeLata() {
    return Interface.el('img', { class: 'icone-lata', src: 'assets/ui/lata.png', alt: '', draggable: 'false', 'aria-hidden': 'true' });
  },

  montar(op) {
    const E = Interface.el.bind(Interface);
    const el = this.elementos = {};

    // v2.35: barra do jogador em "anel de XP" — o XP é o anel em volta do retrato e o nível fica no selo
    el.retrato = E('img', { alt: '' });
    el.moldura = E('div', { class: 'retrato-redondo hud-retrato' }, el.retrato);
    el.anel = E('div', { class: 'hud-xp-anel', role: 'progressbar', 'aria-label': 'Experiência (XP) até o próximo nível', 'aria-valuemin': '0', 'aria-valuemax': '100' }, el.moldura);
    el.molduraVazada = E('img', { class: 'moldura-vazada', alt: '', draggable: 'false', hidden: true });   // v2.36
    el.emblema = E('div', { class: 'hud-emblema', hidden: true });                                       // v2.43
    el.botaoPerfil = E('button', { class: 'hud-botao-perfil', type: 'button', 'aria-label': 'Abrir perfil', title: 'Perfil (P)', onclick: op.aoAbrirPerfil }, el.anel, el.molduraVazada, el.emblema);
    el.nivel = E('span', { class: 'hud-nivel', 'aria-hidden': 'true' });
    // v2.45: balão "Moldura nova!" ao lado do retrato (só aparece enquanto houver moldura nova não vista no perfil)
    el.balaoMoldura = E('button', { class: 'hud-balao-moldura', type: 'button', hidden: true, onclick: op.aoAbrirPerfil },
      E('strong', {}, 'Moldura nova!'), E('span', {}, 'Toque aqui para usar'));
    el.xpTexto = E('span', { class: 'sr-only' });
    el.apelido = E('span', { class: 'sr-only' });
    el.latas = E('span', { class: 'hud-latas-valor' });
    el.botaoA = E('button', { class: 'hud-botao-a', type: 'button', 'aria-label': 'Ação', disabled: true, onclick: () => this.acionar() }, 'A');
    el.rotuloA = E('span', { class: 'hud-rotulo-a', 'aria-live': 'polite' });
    el.missoesConta = E('span', { class: 'hud-missoes-conta' });

    const raiz = E('div', { class: 'hud' },
      E('section', { class: 'hud-bloco hud-perfil hud-anel', 'aria-label': 'Jogador' },
        el.botaoPerfil, el.nivel, el.apelido, el.xpTexto, el.balaoMoldura
      ),
      // v2.49 (desenho D2): uma linha só, sem palavras — latas, Missões (estrela com o selo "feitas/total"), Black Book e Menu
      E('section', { class: 'hud-bloco hud-direita', 'aria-label': 'Latas, missões e menus' },
        E('div', { class: 'hud-direita-linha' },
          E('div', { class: 'hud-latas', title: 'Latas de Spray' }, this.iconeLata(), el.latas,
            E('span', { class: 'sr-only' }, ' latas de spray')),
          E('button', { class: 'hud-icone hud-aba-missoes', type: 'button', title: 'Missões (M)', onclick: op.aoAbrirMissoes },
            Interface.icone('estrela', 'hud-icone-img'), el.missoesConta),
          E('button', { class: 'hud-icone', type: 'button', 'aria-label': 'Black Book', title: 'Black Book (B)', onclick: op.aoAbrirBlackBook },
            Interface.icone('livro', 'hud-icone-img')),
          E('button', { class: 'hud-icone', type: 'button', 'aria-label': 'Menu', title: 'Menu (Esc)', onclick: op.aoAbrirMenu },
            Interface.icone('engrenagem', 'hud-icone-img'))
        )
      ),
      E('section', { class: 'hud-bloco hud-joystick' }, Joystick.montar()),
      E('section', { class: 'hud-bloco hud-acao' }, el.rotuloA, el.botaoA)
    );
    el.raiz = raiz;
    Interface.raiz.append(raiz);
    this.atualizar();
    this.definirAcao(null);
  },

  atualizar() {
    const p = Salvamento.atual, el = this.elementos;
    if (!p || !el) return;
    const avatar = Conteudo.avatar(p.jogador.avatar_id);
    const moldura = Conteudo.moldura(p.jogador.moldura_id);
    const info = Progresso.infoNivel(p.jogador.xp);
    if (avatar) el.retrato.src = avatar.retrato;
    el.moldura.style.setProperty('--moldura', moldura ? moldura.cor : 'var(--lima)');
    // v2.43: moldura emblema (arte atrás do personagem) troca o anel; o XP vai para a barrinha do selo
    const temNova = !!(p.molduras_novas && p.molduras_novas.some(id => id !== p.jogador.moldura_id && p.molduras_desbloqueadas.includes(id)));   // v2.47: some se já está usando ela
    el.balaoMoldura.hidden = !temNova;
    el.botaoPerfil.parentElement.classList.toggle('moldura-nova', temNova);
    const emblema = Interface.temEmblema(moldura);
    if (emblema) {
      const chave = [avatar && avatar.retrato, moldura.id, moldura.fundo, moldura.imagem, JSON.stringify(moldura.encaixe || {})].join('|');
      if (el.emblema.dataset.chave !== chave) { el.emblema.replaceChildren(Interface.emblema(avatar && avatar.retrato, moldura)); el.emblema.dataset.chave = chave; }
    }
    el.emblema.hidden = !emblema;
    el.anel.hidden = emblema;
    el.botaoPerfil.parentElement.classList.toggle('modo-emblema', emblema);
    const vazada = !emblema && !!(moldura && moldura.imagem);
    if (vazada && el.molduraVazada.getAttribute('src') !== moldura.imagem) el.molduraVazada.src = moldura.imagem;
    el.molduraVazada.hidden = !vazada;
    el.botaoPerfil.parentElement.classList.toggle('vazada', vazada);
    const pct = Math.round(info.fracao * 100);
    const xpTexto = info.xpProximo !== null ? `${info.xp} / ${info.xpProximo} XP · faltam ${info.xpProximo - info.xp} XP para o nível ${info.nivel + 1}` : `${info.xp} XP · nível máximo`;
    el.nivel.textContent = 'NV ' + info.nivel;
    el.apelido.textContent = `${p.apelido}, nível ${info.nivel}. `;
    el.xpTexto.textContent = xpTexto;
    el.anel.style.setProperty('--xp', String(pct));
    el.botaoPerfil.parentElement.style.setProperty('--xp', String(pct));   // barrinha de XP do selo (moldura emblema)
    el.anel.setAttribute('aria-valuenow', String(pct));
    el.anel.setAttribute('aria-valuetext', xpTexto);
    el.botaoPerfil.title = `${p.apelido} · nível ${info.nivel} · ${xpTexto}. Toque para abrir o perfil (P)`;
    el.latas.textContent = p.jogador.latas;
    // aba de missões: concluídas / disponíveis
    const missoes = Missoes.lista().filter(s => s.estado !== 'indisponivel');
    const feitas = missoes.filter(s => s.estado === 'concluida').length;
    el.missoesConta.textContent = `${feitas}/${missoes.length}`;
    el.missoesConta.parentElement.setAttribute('aria-label', `Missões: ${feitas} de ${missoes.length} concluídas`);
  },

  // Mostra (ou esconde) o que o botão A vai fazer
  definirAcao(rotulo, funcao) {
    const el = this.elementos;
    if (!el) return;
    if (this.acao && this.acao.rotulo === rotulo) { this.acao.funcao = funcao; return; }
    this.acao = rotulo ? { rotulo, funcao } : null;
    el.botaoA.disabled = !rotulo;
    el.botaoA.setAttribute('aria-label', rotulo ? 'A: ' + rotulo : 'Ação (nada por perto)');
    el.rotuloA.textContent = rotulo || '';
    el.rotuloA.classList.toggle('visivel', !!rotulo);
    el.botaoA.classList.toggle('disponivel', !!rotulo);
  },

  acionar() {
    if (this.acao && this.acao.funcao) this.acao.funcao();
  },

  destruir() { this.elementos = null; this.acao = null; Joystick.zerar(); }
};
