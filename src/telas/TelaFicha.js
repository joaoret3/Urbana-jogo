// =============================================================================
// TELA 04 — FICHA DO MURAL (grafite real catalogado pelos estudantes)
// -----------------------------------------------------------------------------
// Abre por cima do mapa, sem tirar o jogador do lugar (o avatar fica parado).
//
//   TelaFicha.abrir({ grafiteId, perto, aoIrAte })
//     perto = true  → ficha completa (o mapa já registrou a visita)
//     perto = false → prévia: o jogador tocou num pin distante. Mostra o básico
//                     e pede para chegar perto (recompensa só de perto, seção 6.4).
//     aoIrAte()     → botão "Ir até lá" da prévia (o avatar caminha até o pin)
//
// A ficha conta como "lida" quando o estudante rola o texto até o fim.
// =============================================================================
const TelaFicha = {
  formatarData(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || '—');
  },

  abrir(op) {
    const E = Interface.el.bind(Interface);
    const g = Conteudo.grafite(op.grafiteId);
    if (!g) return null;
    const p = Salvamento.atual;
    const autoria = g.artista ? g.artista : 'Autoria não identificada';

    // Foto: mantém a proporção original (sem distorcer)
    const foto = E('figure', { class: 'ficha-foto' },
      E('img', { src: g.imagem, alt: 'Fotografia do grafite ' + g.titulo, loading: 'lazy' }),
      g.creditos_fotografia ? E('figcaption', {}, 'Foto: ' + g.creditos_fotografia) : null
    );
    const selo = E('p', { class: 'ficha-selo' }, Interface.comIcone('pin', 'Registro cultural · grafite real do bairro Goiânia'));
    const dados = E('dl', { class: 'ficha-dados' },
      E('dt', {}, 'Artista'), E('dd', {}, autoria),
      E('dt', {}, 'Registrado em'), E('dd', {}, this.formatarData(g.data_registro))
    );

    let janela;
    if (!op.perto) {
      // ---------- PRÉVIA (pin distante) ----------
      janela = Interface.abrirPainel({
        titulo: g.titulo,
        classe: 'painel-ficha',
        conteudo: [
          selo, foto, dados,
          E('p', { class: 'ficha-aviso-longe' }, Interface.comIcone('andar', 'Você está longe deste grafite. Chegue perto do pin para ler a ficha completa, fazer o quiz e ganhar a recompensa de descoberta.'))
        ],
        rodape: [
          Interface.botao('Fechar', () => janela.fechar()),
          op.aoIrAte ? Interface.botao('Ir até lá', () => { janela.fechar(); op.aoIrAte(); }, { tipo: 'principal', icone: 'ir' }) : null
        ].filter(Boolean)
      });
      return janela;
    }

    // ---------- FICHA COMPLETA ----------
    const estado = E('div', { class: 'ficha-estado' });
    const botaoQuiz = Interface.botao('Fazer Quiz', () => {
      TelaQuiz.abrir({ quizId: g.quiz_id, grafite: g, aoFechar: atualizarEstado });
    }, { tipo: 'principal', icone: 'ajuda' });
    const atualizarEstado = () => {
      const visitado = p.murais_visitados.includes(g.id);
      const concluido = p.quizzes_concluidos.includes(g.quiz_id);
      estado.replaceChildren(
        E('span', { class: 'chip ' + (visitado ? 'chip-ok' : '') }, visitado ? Interface.comIcone('ok', 'Visitado') : 'Não visitado'),
        E('span', { class: 'chip ' + (concluido ? 'chip-ok' : 'chip-pendente') }, concluido ? Interface.comIcone('estrela', 'Quiz concluído') : 'Quiz não realizado')
      );
      botaoQuiz.querySelector('.botao-texto').textContent = concluido ? 'Rever o quiz' : 'Fazer Quiz';
      botaoQuiz.disabled = !Conteudo.quiz(g.quiz_id);
    };

    const fimDoTexto = E('div', { class: 'ficha-fim', 'aria-hidden': 'true' });
    janela = Interface.abrirPainel({
      titulo: g.titulo,
      classe: 'painel-ficha',
      conteudo: [
        selo, estado, foto, dados,
        E('h3', { class: 'ficha-subtitulo' }, 'História'),
        E('p', { class: 'ficha-texto' }, g.descricao),
        g.curiosidades ? E('h3', { class: 'ficha-subtitulo' }, 'Curiosidades') : null,
        g.curiosidades ? E('p', { class: 'ficha-texto' }, g.curiosidades) : null,
        fimDoTexto
      ],
      rodape: [
        Interface.botao('Fechar', () => janela.fechar(), { icone: 'fechar' }),
        botaoQuiz
      ],
      aoFechar: () => observador && observador.disconnect()
    });
    atualizarEstado();

    // ficha "lida" quando o fim do texto aparece na tela
    let observador = null;
    if ('IntersectionObserver' in window) {
      observador = new IntersectionObserver((entradas) => {
        if (entradas.some(e => e.isIntersecting)) { Progresso.registrarLeitura(g.id); observador.disconnect(); }
      }, { root: janela.corpo, threshold: 1 });
      // espera a foto carregar para o texto ficar na posição certa
      setTimeout(() => { if (!janela.fechado && observador) observador.observe(fimDoTexto); }, 1200);
    } else {
      Progresso.registrarLeitura(g.id);
    }
    return janela;
  }
};
