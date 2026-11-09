// =============================================================================
// TELA 10 — CRÉDITOS
// Os nomes vêm de dados/creditos.js (coloque apenas nomes autorizados).
// =============================================================================
const TelaCreditos = {
  abrir() {
    const E = Interface.el.bind(Interface);
    const c = Conteudo.dados.creditos || {};
    const conteudo = [
      E('p', { class: 'creditos-projeto' }, c.projeto || ''),
      E('div', { class: 'creditos-grade' },
        (c.categorias || []).map(cat => E('section', { class: 'creditos-bloco' },
          E('h3', {}, cat.titulo),
          E('ul', {}, (cat.nomes || []).map(n => E('li', {}, n)))
        ))
      ),
      (c.tecnologia && c.tecnologia.length)
        ? E('p', { class: 'creditos-tec' }, 'Feito com: ' + c.tecnologia.join(' · '))
        : null
    ];
    let janela;
    janela = Interface.abrirPainel({
      titulo: 'Créditos',
      classe: 'painel-largo',
      conteudo,
      rodape: [Interface.botao('Voltar', () => janela.fechar(), { tipo: 'principal', icone: 'voltar' })]
    });
    return janela;
  }
};
