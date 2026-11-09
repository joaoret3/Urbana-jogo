// =============================================================================
// TELA 08 — MISSÕES
// Lista as missões de dados/missoes.js com objetivo, progresso, recompensa
// e situação (concluída, em andamento ou indisponível por falta de conteúdo).
// =============================================================================
const TelaMissoes = {
  abrir() {
    const E = Interface.el.bind(Interface);
    const lista = Missoes.lista();
    const ordem = { andamento: 0, concluida: 1, indisponivel: 2 };
    lista.sort((a, b) => ordem[a.estado] - ordem[b.estado]);
    const rotulos = {
      concluida: Interface.comIcone('ok', 'Concluída'),
      andamento: Interface.comIcone('play', 'Em andamento'),
      indisponivel: Interface.comIcone('cadeado', 'Indisponível')
    };
    const itens = lista.map(s => E('li', { class: 'missao missao-' + s.estado },
      E('div', { class: 'missao-topo' },
        E('h3', {}, s.missao.titulo),
        E('span', { class: 'missao-selo' }, rotulos[s.estado])
      ),
      E('p', { class: 'missao-descricao' }, s.missao.descricao),
      s.estado === 'indisponivel'
        ? E('p', { class: 'missao-nota' }, 'Ainda não há conteúdo suficiente no jogo para esta missão.')
        : E('div', { class: 'missao-progresso' },
            E('div', { class: 'barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(s.meta), 'aria-valuenow': String(s.feito) },
              E('div', { class: 'barra-preenchimento', style: { width: Math.round(100 * s.feito / s.meta) + '%' } })),
            E('span', { class: 'missao-conta' }, `${s.feito} / ${s.meta}`)
          ),
      E('p', { class: 'missao-recompensa' }, 'Recompensa: ', E('strong', {}, Missoes.textoRecompensa(s.missao.recompensa)))
    ));
    const feitas = lista.filter(s => s.estado === 'concluida').length;
    let janela;
    janela = Interface.abrirPainel({
      titulo: 'Missões',
      classe: 'painel-largo painel-missoes',
      conteudo: [
        E('p', { class: 'missoes-resumo' }, `${feitas} de ${lista.filter(s => s.estado !== 'indisponivel').length} missões disponíveis concluídas`),
        E('ul', { class: 'missoes-lista' }, itens)
      ],
      rodape: [Interface.botao('Voltar ao jogo', () => janela.fechar(), { tipo: 'principal', icone: 'play' })]
    });
    return janela;
  }
};
