// =============================================================================
// TUTORIAL — "Como jogar" (textos em dados/tutorial.js)
// Aparece sozinho na primeira entrada no mapa e pode ser aberto no menu de pausa.
//   TelaTutorial.abrir({ aoFechar })
// =============================================================================
const TelaTutorial = {
  abrir(op = {}) {
    const E = Interface.el.bind(Interface);
    const t = Conteudo.dados.tutorial || {};
    let janela;
    janela = Interface.abrirPainel({
      titulo: t.titulo || 'Como jogar',
      classe: 'painel-largo painel-tutorial',
      conteudo: [
        t.introducao ? E('p', { class: 'tutorial-intro' }, t.introducao) : null,
        E('ol', { class: 'tutorial-passos' }, (t.passos || []).map(p => E('li', { class: 'tutorial-passo' },
          Interface.icone(p.icone || 'estrela', 'tutorial-icone'),
          E('div', {}, E('strong', {}, p.titulo), E('p', {}, p.texto))
        )))
      ],
      rodape: [Interface.botao(t.botao || 'Entendi', () => janela.fechar(), { tipo: 'principal', icone: 'play' })],
      aoFechar: op.aoFechar
    });
    return janela;
  }
};
