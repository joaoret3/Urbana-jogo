// =============================================================================
// HUD — informações e botões que ficam na tela durante a exploração (Tela 03)
// -----------------------------------------------------------------------------
//   canto superior esquerdo:  retrato do avatar (com moldura), nível e barra de XP
//   canto superior direito:   latas de spray, botão do Black Book, botão de menu;
//                             logo abaixo, a aba de Missões (com quantas já foram concluídas)
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

  // Ícone da lata de spray (desenho simples em SVG)
  iconeLata() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 32'); svg.setAttribute('class', 'icone-lata'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<rect x="9" y="1" width="6" height="4" rx="1" fill="#0f0c14"/>' +
      '<path d="M6 8c0-2 3-3 6-3s6 1 6 3v20c0 2-2 3-6 3s-6-1-6-3z" fill="#ff3fbf" stroke="#0f0c14" stroke-width="2"/>' +
      '<rect x="6" y="13" width="12" height="7" fill="#ffe14d" stroke="#0f0c14" stroke-width="1.5"/>' +
      '<circle cx="20.5" cy="3" r="1.4" fill="#22d3ee"/><circle cx="22.5" cy="6" r="1" fill="#9be21b"/>';
    return svg;
  },

  montar(op) {
    const E = Interface.el.bind(Interface);
    const el = this.elementos = {};

    // v2.35: barra do jogador em "anel de XP" — o XP é o anel em volta do retrato e o nível fica no selo
    el.retrato = E('img', { alt: '' });
    el.moldura = E('div', { class: 'retrato-redondo hud-retrato' }, el.retrato);
    el.anel = E('div', { class: 'hud-xp-anel', role: 'progressbar', 'aria-label': 'Experiência (XP) até o próximo nível', 'aria-valuemin': '0', 'aria-valuemax': '100' }, el.moldura);
    el.botaoPerfil = E('button', { class: 'hud-botao-perfil', type: 'button', 'aria-label': 'Abrir perfil', title: 'Perfil (P)', onclick: op.aoAbrirPerfil }, el.anel);
    el.nivel = E('span', { class: 'hud-nivel', 'aria-hidden': 'true' });
    el.xpTexto = E('span', { class: 'sr-only' });
    el.apelido = E('span', { class: 'sr-only' });
    el.latas = E('span', { class: 'hud-latas-valor' });
    el.botaoA = E('button', { class: 'hud-botao-a', type: 'button', 'aria-label': 'Ação', disabled: true, onclick: () => this.acionar() }, 'A');
    el.rotuloA = E('span', { class: 'hud-rotulo-a', 'aria-live': 'polite' });
    el.missoesConta = E('span', { class: 'hud-missoes-conta' });

    const raiz = E('div', { class: 'hud' },
      E('section', { class: 'hud-bloco hud-perfil hud-anel', 'aria-label': 'Jogador' },
        el.botaoPerfil, el.nivel, el.apelido, el.xpTexto
      ),
      // latas, Black Book e Menu numa linha; logo abaixo, a aba de Missões com a mesma largura
      E('section', { class: 'hud-bloco hud-direita', 'aria-label': 'Latas, menus e missões' },
        E('div', { class: 'hud-direita-linha' },
          E('div', { class: 'hud-latas', title: 'Latas de Spray' }, this.iconeLata(), el.latas,
            E('span', { class: 'sr-only' }, ' latas de spray')),
          E('button', { class: 'hud-icone', type: 'button', 'aria-label': 'Black Book', title: 'Black Book (B)', onclick: op.aoAbrirBlackBook },
            Interface.icone('caderno', 'hud-icone-img'), E('small', {}, 'Black Book')),
          E('button', { class: 'hud-icone', type: 'button', 'aria-label': 'Menu', title: 'Menu (Esc)', onclick: op.aoAbrirMenu },
            Interface.icone('menu', 'hud-icone-img'), E('small', {}, 'Menu'))
        ),
        E('button', { class: 'hud-aba-missoes', type: 'button', title: 'Missões (M)', onclick: op.aoAbrirMissoes },
          Interface.icone('estrela', 'hud-missoes-icone'),
          E('span', { class: 'hud-missoes-texto' }, 'Missões'),
          el.missoesConta)
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
    const pct = Math.round(info.fracao * 100);
    const xpTexto = info.xpProximo !== null ? `${info.xp} / ${info.xpProximo} XP · faltam ${info.xpProximo - info.xp} XP para o nível ${info.nivel + 1}` : `${info.xp} XP · nível máximo`;
    el.nivel.textContent = 'NV ' + info.nivel;
    el.apelido.textContent = `${p.apelido}, nível ${info.nivel}. `;
    el.xpTexto.textContent = xpTexto;
    el.anel.style.setProperty('--xp', String(pct));
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
