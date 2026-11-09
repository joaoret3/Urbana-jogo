// =============================================================================
// MENU DE PAUSA — aberto pelo botão de menu do HUD ou pela tecla Esc
// O progresso é salvo automaticamente; "Salvar e sair" grava e volta ao menu.
// =============================================================================
const TelaPausa = {
  // op: { aoSair, aoAbrirPerfil }
  abrir(op) {
    const E = Interface.el.bind(Interface);
    const p = Salvamento.atual;
    let janela;
    const itens = E('div', { class: 'pausa-itens' },
      Interface.botao('Continuar jogando', () => janela.fechar(), { tipo: 'principal', icone: 'play' }),
      Interface.botao('Perfil', () => { janela.fechar(); op.aoAbrirPerfil(); }, { icone: 'pessoa', detalhe: 'Trocar avatar e moldura' }),
      Interface.botao('Missões', () => TelaMissoes.abrir(), { icone: 'estrela', detalhe: 'Tecla M' }),
      Interface.botao('Como jogar', () => TelaTutorial.abrir(), { icone: 'ajuda' }),
      Interface.botao('Configurações', () => TelaConfiguracoes.abrir(), { icone: 'som' }),
      Interface.botao('Exportar partida', () => {
        Salvamento.salvar();
        if (Salvamento.exportar(p.id)) Interface.avisar('Arquivo da partida baixado. Guarde-o como cópia de segurança.');
      }, { icone: 'baixar', detalhe: 'Cópia de segurança em arquivo' }),
      Interface.botao('Salvar e sair', () => { janela.fechar(); op.aoSair(); }, { icone: 'sair', detalhe: 'Volta ao menu principal' })
    );
    janela = Interface.abrirPainel({
      titulo: 'Pausa',
      classe: 'painel-pequeno painel-pausa',
      conteudo: [
        E('p', { class: 'pausa-quem' }, `Jogando como ${p.apelido}`),
        itens,
        E('p', { class: 'pausa-nota' }, Interface.comIcone('ok', 'Seu progresso é salvo automaticamente neste computador.'))
      ]
    });
    return janela;
  }
};
