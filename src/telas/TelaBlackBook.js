// =============================================================================
// TELA 06 — BLACK BOOK (caderno com as artes dos estudantes)
// -----------------------------------------------------------------------------
// Mostra todas as artes publicadas e autorizadas (dados/artes.js) em grade:
//   - bloqueadas: em preto e branco, com cadeado, preço e nível necessário;
//   - desbloqueadas: nas cores originais, sempre no topo da lista.
// Tocar numa arte abre a visualização ampliada, com o botão de desbloqueio
// (pede confirmação, confere nível e saldo) e, no modo "escolher", o botão
// para usar a arte num muro virtual.
//
//   TelaBlackBook.abrir({ modo: 'ver' | 'escolher', aoEscolher(arteId), aoFechar })
// =============================================================================
const TelaBlackBook = {
  abrir(op = {}) {
    const E = Interface.el.bind(Interface);
    const p = Salvamento.atual;
    const saldo = E('span', { class: 'bb-saldo-valor' });
    const grade = E('div', { class: 'bb-grade' });

    const desenhar = () => {
      saldo.textContent = p.jogador.latas;
      // 1º as desbloqueadas (na ordem do cadastro); depois as bloqueadas, da mais "barata" para a mais
      // "cara": menor nível, depois menor preço em latas (empate: ordem do cadastro)
      const todas = Conteudo.artesPublicadas();
      const bloqueadas = todas.map((a, i) => ({ a, i })).filter(x => !Progresso.arteDesbloqueada(x.a.id))
        .sort((x, y) => Conteudo.nivelArte(x.a) - Conteudo.nivelArte(y.a)
          || Conteudo.precoArte(x.a) - Conteudo.precoArte(y.a) || x.i - y.i).map(x => x.a);
      const artes = todas.filter(a => Progresso.arteDesbloqueada(a.id)).concat(bloqueadas);
      grade.replaceChildren(...artes.map(a => {
        const livre = Progresso.arteDesbloqueada(a.id);
        const usos = Progresso.usosDaArte(a.id);
        return E('button', {
          type: 'button', class: 'bb-arte' + (livre ? '' : ' bloqueada'),
          'aria-label': `${a.titulo}, ${a.autoria || ''}` + (livre ? ', desbloqueada' : `, bloqueada, custa ${Conteudo.precoArte(a)} latas`),
          onclick: () => this.detalhe(a, op, desenhar)
        },
          E('span', { class: 'bb-arte-moldura' }, E('img', { src: a.imagem, alt: '', loading: 'lazy' }),
            livre ? null : E('span', { class: 'bb-cadeado', 'aria-hidden': 'true' }, Interface.icone('cadeado', 'bb-cadeado-icone'))),
          E('strong', { class: 'bb-arte-titulo' }, a.titulo),
          E('span', { class: 'bb-arte-autor' }, a.autoria || 'Autoria autorizada não informada'),
          livre
            ? E('span', { class: 'bb-etiqueta ok' }, Interface.comIcone('ok', usos ? `Em ${usos} muro${usos > 1 ? 's' : ''}` : 'Desbloqueada'))
            : E('span', { class: 'bb-etiqueta' }, Interface.comIcone('cadeado', `${Progresso.arteGratis(a) ? 'Grátis' : Conteudo.precoArte(a) + ' latas'} · Nv ${Conteudo.nivelArte(a)}`))
        );
      }));
      if (!artes.length) grade.append(E('p', {}, 'Nenhuma arte cadastrada ainda.'));
    };

    let janela;
    janela = Interface.abrirPainel({
      titulo: 'Meu Black Book',
      classe: 'painel-blackbook',
      conteudo: [
        E('div', { class: 'bb-cabecalho' },
          E('p', { class: 'bb-explica' }, op.modo === 'escolher'
            ? 'Escolha uma arte desbloqueada para pintar o muro. Toque numa arte bloqueada para desbloquear.'
            : 'Artes criadas pelos estudantes. Desbloqueie com latas de spray e pinte os muros livres do bairro.'),
          E('div', { class: 'bb-saldo', title: 'Seu saldo' }, HUD.iconeLata(), saldo, E('span', { class: 'sr-only' }, ' latas'))
        ),
        grade
      ],
      rodape: [Interface.botao(op.modo === 'escolher' ? 'Cancelar' : 'Fechar', () => janela.fechar(), { icone: 'voltar' })],
      aoFechar: op.aoFechar
    });
    desenhar();
    return janela;
  },

  // Visualização ampliada de uma arte
  detalhe(a, op, aoMudar) {
    const E = Interface.el.bind(Interface);
    const p = Salvamento.atual;
    const corpo = E('div', { class: 'bb-detalhe' });
    const rodape = E('div', { class: 'bb-detalhe-acoes' });
    let janela;

    const desenhar = () => {
      const livre = Progresso.arteDesbloqueada(a.id);
      const preco = Conteudo.precoArte(a), cat = Conteudo.categoriaArte(a);
      const pode = Progresso.podeDesbloquear(a);
      const usos = Progresso.usosDaArte(a.id);
      corpo.replaceChildren(...[
        E('figure', { class: 'bb-ampliada' + (livre ? '' : ' bloqueada') }, E('img', { src: a.imagem, alt: 'Arte ' + a.titulo })),
        E('dl', { class: 'ficha-dados' },
          E('dt', {}, 'Autoria'), E('dd', {}, a.autoria || '—'),
          E('dt', {}, 'Categoria'), E('dd', {}, cat.nome || a.categoria),
          E('dt', {}, livre ? 'Situação' : 'Custo'), E('dd', {}, livre ? (usos ? `Desbloqueada · em ${usos} muro(s)` : 'Desbloqueada') : `${Progresso.arteGratis(a) ? 'Grátis' : preco + ' latas'} · a partir do nível ${Conteudo.nivelArte(a)}`)
        ),
        !livre && !pode.pode ? E('p', { class: 'bb-motivo' }, Interface.comIcone('alerta', pode.motivo)) : null
      ].filter(Boolean));   // (replaceChildren escreveria a palavra "null" no lugar de um item vazio)
      const botoes = [Interface.botao('Voltar', () => janela.fechar(), { icone: 'voltar' })];
      // arte grátis bloqueada só pelo nível: libera sozinha quando o jogador chegar ao nível
      if (!livre && !Progresso.arteGratis(a)) {
        botoes.push(Interface.botao(`Desbloquear por ${preco} latas`, async () => {
          const sim = await Interface.confirmar({
            titulo: 'Desbloquear arte?',
            texto: `"${a.titulo}" custa ${preco} latas. Seu saldo vai de ${p.jogador.latas} para ${p.jogador.latas - preco} latas. Confirmar?`,
            sim: 'Desbloquear'
          });
          if (sim && Progresso.desbloquearArte(a.id)) {
            Interface.notificar({ tipo: 'recompensa', titulo: 'Arte desbloqueada!', texto: a.titulo });
            HUD.atualizar(); aoMudar(); desenhar();
          }
        }, { tipo: 'principal', icone: 'cadeado_aberto', desabilitado: !pode.pode }));
      } else if (op.modo === 'escolher') {
        botoes.push(Interface.botao('Usar esta arte', () => { janela.fechar(); op.aoEscolher(a.id); }, { tipo: 'principal', icone: 'ok' }));
      }
      rodape.replaceChildren(...botoes);
    };

    janela = Interface.abrirPainel({ titulo: a.titulo, classe: 'painel-blackbook painel-detalhe', conteudo: [corpo], rodape: [rodape] });
    desenhar();
    Interface.focarPrimeiro(janela.elemento);
  }
};
