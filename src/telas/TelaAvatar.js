// =============================================================================
// TELA 02 — SELEÇÃO DE AVATAR
// -----------------------------------------------------------------------------
// Mostra todos os personagens (dados/avatares.js), com pré-visualização
// ampliada e indicação de bloqueado/disponível. Não deixa escolher bloqueados.
// Usada ao começar um jogo (CenaAvatar) e, mais tarde, no Perfil para trocar
// de personagem sem perder o progresso.
//
//   TelaAvatar.montar({ partida, selecionado, textoBotao, aoSelecionar(id), aoVoltar })
//   devolve o elemento HTML da tela.
// =============================================================================
const TelaAvatar = {
  montar(op) {
    const E = Interface.el.bind(Interface);
    const avatares = Progresso.avataresOrdenados(op.partida);   // disponíveis primeiro, depois por nível
    let indice = Math.max(0, avatares.findIndex(a => a.id === op.selecionado));
    const disponivel = (a) => Progresso.avatarDisponivel(op.partida, a);

    // Pré-visualização ampliada
    const imgGrande = E('img', { class: 'avatar-grande-img', alt: '' });
    const nome = E('h2', { class: 'titulo-grafite avatar-nome' });
    const descricao = E('p', { class: 'avatar-descricao' });
    const estado = E('p', { class: 'avatar-estado' });
    const botaoSelecionar = Interface.botao(op.textoBotao || 'Selecionar', () => {
      const a = avatares[indice];
      if (disponivel(a)) op.aoSelecionar(a.id);
    }, { tipo: 'principal', icone: 'ok', classe: 'avatar-selecionar' });

    // Miniaturas (lista para escolher)
    const miniaturas = E('div', { class: 'avatar-miniaturas', role: 'listbox', 'aria-label': 'Personagens' },
      avatares.map((a, i) => E('button', {
        type: 'button', class: 'avatar-mini', role: 'option', 'data-i': String(i),
        'aria-label': a.nome + (disponivel(a) ? '' : ` (bloqueado, nível ${a.nivel_minimo})`),
        onclick: () => { indice = i; atualizar(); }
      },
        E('img', { src: a.retrato, alt: '' }),
        disponivel(a) ? null : E('span', { class: 'cadeado' }, Interface.comIcone('cadeado', 'Nv ' + a.nivel_minimo))
      ))
    );

    const atualizar = () => {
      const a = avatares[indice];
      const ok = disponivel(a);
      imgGrande.src = a.retrato;
      imgGrande.classList.toggle('bloqueado', !ok);
      nome.textContent = a.nome;
      descricao.textContent = a.descricao || '';
      estado.replaceChildren(ok ? Interface.comIcone('ok', 'Disponível') : Interface.comIcone('cadeado', `Bloqueado — libera no nível ${a.nivel_minimo}`));
      estado.className = 'avatar-estado ' + (ok ? 'ok' : 'trancado');
      botaoSelecionar.disabled = !ok;
      botaoSelecionar.querySelector('.botao-texto').textContent = ok ? (op.textoBotao || 'Selecionar') : 'Bloqueado';
      miniaturas.querySelectorAll('.avatar-mini').forEach((b, i) => {
        b.classList.toggle('ativo', i === indice);
        b.classList.toggle('bloqueado', !disponivel(avatares[i]));
        b.setAttribute('aria-selected', String(i === indice));
      });
    };

    const passo = (d) => { indice = (indice + d + avatares.length) % avatares.length; atualizar(); };
    const tela = E('div', { class: 'tela-avatar' },
      E('div', { class: 'menu-vinheta', 'aria-hidden': 'true' }),
      E('header', { class: 'avatar-topo' },
        Interface.botao('Voltar', op.aoVoltar, { icone: 'voltar' }),
        E('h1', { class: 'titulo-grafite avatar-titulo' }, 'Escolha seu avatar'),
        op.partida ? null : E('span', { class: 'avatar-apelido' }, op.apelido ? 'Jogador: ' + op.apelido : '')
      ),
      E('main', { class: 'avatar-palco' },
        E('button', { class: 'seta', type: 'button', 'aria-label': 'Personagem anterior', onclick: () => passo(-1) }, Interface.icone('seta_esq', 'seta-icone')),
        E('div', { class: 'avatar-cartao' },
          E('div', { class: 'avatar-grande' }, imgGrande),
          E('div', { class: 'avatar-texto' }, nome, estado, descricao, botaoSelecionar)
        ),
        E('button', { class: 'seta', type: 'button', 'aria-label': 'Próximo personagem', onclick: () => passo(1) }, Interface.icone('seta_dir', 'seta-icone'))
      ),
      miniaturas
    );
    // setas do teclado trocam o personagem
    tela.addEventListener('keydown', (ev) => {
      if (Interface.algumAberto()) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); passo(-1); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); passo(1); }
    });
    atualizar();
    setTimeout(() => botaoSelecionar.disabled ? miniaturas.querySelector('.ativo').focus() : botaoSelecionar.focus(), 30);
    return tela;
  }
};
