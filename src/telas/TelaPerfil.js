// =============================================================================
// TELA 09 — PERFIL DO JOGADOR
// -----------------------------------------------------------------------------
// Mostra avatar, nível, XP, latas e o que já foi feito na partida.
// Permite trocar de avatar e de moldura sem perder nada do progresso
// (RF-AVA-006, RF-AVA-007, RN-012).
//
//   TelaPerfil.abrir({ aoTrocarAvatar(id) })
// =============================================================================
const TelaPerfil = {
  abrir(op) {
    const E = Interface.el.bind(Interface);
    const p = Salvamento.atual;
    const corpo = E('div', { class: 'perfil' });
    const novas = (p.molduras_novas || []).slice();   // v2.45: molduras ganhas e ainda não vistas (marcadas com "NOVA")
    let janela;

    // Como liberar uma moldura (nível ou missão)
    const comoLiberar = (molduraId) => {
      const n = Conteudo.niveis().find(x => ((x.desbloqueia || {}).molduras || []).includes(molduraId));
      if (n) return 'Nível ' + n.nivel;
      const m = Missoes.todas().find(x => (x.recompensa || {}).moldura === molduraId);
      return m ? 'Missão: ' + m.titulo : 'Bloqueada';
    };

    const desenhar = () => {
      const j = p.jogador, info = Progresso.infoNivel(j.xp);
      const avatar = Conteudo.avatar(j.avatar_id), moldura = Conteudo.moldura(j.moldura_id);
      const grafites = Conteudo.grafitesPublicados();
      const quizzes = grafites.filter(g => Conteudo.quiz(g.quiz_id)).length;
      const muros = Conteudo.mapa.muros.length;
      const missoes = Missoes.lista().filter(s => s.estado !== 'indisponivel').length;
      const estat = (rotulo, valor) => E('div', { class: 'perfil-estat' }, E('strong', {}, valor), E('span', {}, rotulo));

      corpo.replaceChildren(
        E('section', { class: 'perfil-topo' },
          Interface.temEmblema(moldura) ? E('div', { class: 'com-emblema perfil-emblema' }, Interface.emblema(avatar && avatar.retrato, moldura)) :   // v2.43
          E('div', { class: 'com-moldura' + (moldura && moldura.imagem ? ' vazada' : '') },
            E('div', { class: 'retrato-redondo perfil-retrato', style: { '--moldura': moldura ? moldura.cor : 'var(--lima)' } },
              avatar ? E('img', { src: avatar.retrato, alt: '' }) : null),
            Interface.molduraVazada(moldura)),
          E('div', { class: 'perfil-nome' },
            E('h3', {}, p.apelido),
            E('p', {}, `Nível ${info.nivel} · ${j.xp} XP` + (info.xpProximo !== null ? ` (faltam ${info.xpProximo - j.xp} para o nível ${info.nivel + 1})` : ' · nível máximo')),
            E('div', { class: 'barra' }, E('div', { class: 'barra-preenchimento', style: { width: Math.round(info.fracao * 100) + '%' } }))
          )
        ),
        E('section', { class: 'perfil-estats' },
          estat('latas de spray', j.latas),
          estat('murais visitados', `${p.murais_visitados.filter(id => grafites.some(g => g.id === id)).length} / ${grafites.length}`),
          estat('fichas lidas', `${p.fichas_lidas.length} / ${grafites.length}`),
          estat('quizzes concluídos', `${p.quizzes_concluidos.length} / ${quizzes}`),
          estat('muros personalizados', `${Object.keys(p.muros_pintados).length} / ${muros}`),
          estat('missões concluídas', `${p.missoes_concluidas.length} / ${missoes}`),
          estat('artes desbloqueadas', `${Conteudo.artesPublicadas().filter(a => Progresso.arteDesbloqueada(a.id)).length} / ${Conteudo.artesPublicadas().length}`)
        ),
        E('h3', { class: 'ficha-subtitulo' }, 'Avatares'),
        E('div', { class: 'perfil-opcoes' }, Progresso.avataresOrdenados(p).map(a => {
          const livre = Progresso.avatarDisponivel(p, a), atual = a.id === j.avatar_id;
          return E('button', {
            type: 'button', class: 'perfil-opcao' + (livre ? '' : ' bloqueado') + (atual ? ' ativo' : ''),
            disabled: !livre || atual, 'aria-label': a.nome + (atual ? ' (em uso)' : livre ? '' : ` (bloqueado, nível ${a.nivel_minimo})`),
            onclick: () => { janela.fechar(); op.aoTrocarAvatar(a.id); }
          }, E('img', { src: a.retrato, alt: '' }), E('span', {}, atual ? Interface.comIcone('ok', 'Em uso') : livre ? a.nome : Interface.comIcone('cadeado', `Nível ${a.nivel_minimo}`)));
        })),
        E('h3', { class: 'ficha-subtitulo', id: 'perfil-molduras' }, 'Molduras'),
        E('div', { class: 'perfil-opcoes' }, (Conteudo.dados.molduras.molduras || []).map(m => {
          const livre = p.molduras_desbloqueadas.includes(m.id), atual = m.id === j.moldura_id;
          const nova = livre && !atual && novas.includes(m.id);          // v2.45: ganha há pouco e ainda não usada
          return E('button', {
            type: 'button', class: 'perfil-opcao perfil-moldura' + (livre ? '' : ' bloqueado') + (atual ? ' ativo' : '') + (nova ? ' nova' : ''),
            disabled: !livre || atual,
            onclick: () => { j.moldura_id = m.id; Salvamento.salvar(); HUD.atualizar(); desenhar(); }
          }, nova ? E('span', { class: 'perfil-nova' }, 'NOVA') : null, m.fundo
            ? E('span', { class: 'amostra-moldura amostra-emblema' }, E('img', { src: m.fundo, alt: '' }))
            : m.imagem
            ? E('span', { class: 'amostra-moldura amostra-vazada', style: { borderColor: m.cor } }, Interface.molduraVazada(m))
            : E('span', { class: 'amostra-moldura', style: { borderColor: m.cor } }),
            E('span', {}, atual ? Interface.comIcone('ok', m.nome) : livre ? m.nome : Interface.comIcone('cadeado', comoLiberar(m.id))));
        }))
      );
    };

    janela = Interface.abrirPainel({
      titulo: 'Perfil',
      classe: 'painel-largo painel-perfil',
      // v2.45: ao fechar o perfil, as molduras novas já foram vistas: o retrato para de chamar
      aoFechar: () => { if (p.molduras_novas && p.molduras_novas.length) { p.molduras_novas = []; Salvamento.salvar(); } HUD.atualizar(); },
      conteudo: [corpo],
      rodape: [
        Interface.botao('Exportar partida', () => {
          Salvamento.salvar();
          if (Salvamento.exportar(p.id)) Interface.avisar('Arquivo da partida baixado.');
        }, { icone: 'baixar' }),
        Interface.botao('Voltar ao jogo', () => janela.fechar(), { tipo: 'principal', icone: 'play' })
      ]
    });
    desenhar();
    if (novas.length) {   // leva a lista de molduras para a tela, para o jogador ver a nova
      const alvo = corpo.querySelector('.perfil-moldura.nova') || corpo.querySelector('#perfil-molduras');
      if (alvo && alvo.scrollIntoView) setTimeout(() => alvo.scrollIntoView({ block: 'center' }), 60);
    }
    return janela;
  }
};
