// =============================================================================
// MOLDURA NOVA (v2.45) — avisa quando o jogador ganha uma moldura e ensina a usar
// -----------------------------------------------------------------------------
// No teste com os alunos, eles não percebiam que tinham ganhado uma moldura nem sabiam
// trocar. Agora:
//  - Janela "Moldura nova!": mostra a moldura já no personagem do jogador, com os botões
//    "Usar agora" (troca na hora) e "Depois". Aparece quando não há outra janela aberta.
//  - Enquanto houver moldura nova ainda não vista no perfil, o retrato do HUD pulsa com o
//    balão "Moldura nova! Toque aqui para usar" (HUD.js) e, no perfil, ela vem marcada
//    com "NOVA" (TelaPerfil.js).
//
// A partida guarda:  molduras_janela = [{ id, motivo }]  (falta mostrar a janela)
//                    molduras_novas  = [id, ...]          (falta ver no perfil)
// Quem enche as listas é o Progresso.ganharMoldura.
// =============================================================================
const TelaMolduraNova = {
  // O retrato do jogador com a moldura m (emblema, vazada ou só a cor)
  retrato(avatar, m) {
    const E = Interface.el.bind(Interface);
    if (Interface.temEmblema(m)) return E('div', { class: 'moldura-nova-retrato com-emblema' }, Interface.emblema(avatar && avatar.retrato, m));
    return E('div', { class: 'moldura-nova-retrato com-moldura' + (m.imagem ? ' vazada' : '') },
      E('div', { class: 'retrato-redondo', style: { '--moldura': m.cor || 'var(--lima)' } },
        avatar ? E('img', { src: avatar.retrato, alt: '' }) : null),
      Interface.molduraVazada(m));
  },

  // Abre a janela da próxima moldura da fila (se houver). Devolve true se abriu.
  mostrarProxima() {
    const p = Salvamento.atual;
    if (!p || !Array.isArray(p.molduras_janela) || !p.molduras_janela.length) return false;
    const item = p.molduras_janela[0], m = Conteudo.moldura(item.id);
    const tirarDaFila = () => { p.molduras_janela = p.molduras_janela.filter(x => x !== item); Salvamento.salvar(); };
    if (!m || !p.molduras_desbloqueadas.includes(m.id)) { tirarDaFila(); return false; }
    const E = Interface.el.bind(Interface), j = p.jogador;
    const avatar = Conteudo.avatar(j.avatar_id);
    let usou = false, janela;
    Sons.tocar('descoberta');
    janela = Interface.abrirPainel({
      titulo: 'Moldura nova!',
      classe: 'painel-pequeno painel-moldura-nova',
      conteudo: [
        E('div', { class: 'moldura-nova-palco' }, E('span', { class: 'moldura-nova-raios', 'aria-hidden': 'true' }), this.retrato(avatar, m)),
        E('p', { class: 'moldura-nova-nome' }, m.nome || 'Moldura'),
        E('p', { class: 'moldura-nova-texto' }, (item.motivo ? item.motivo + ' ' : '') + 'Você ganhou esta moldura para o seu retrato.')
      ],
      rodape: [
        Interface.botao('Depois', () => janela.fechar()),
        Interface.botao('Usar agora', () => { usou = true; janela.fechar(); }, { tipo: 'principal', icone: 'ok' })
      ],
      aoFechar: () => {
        tirarDaFila();
        if (usou) {
          j.moldura_id = m.id;
          p.molduras_novas = (p.molduras_novas || []).filter(id => id !== m.id);
          Salvamento.salvar();
          Interface.avisar('Moldura trocada! Para mudar de novo, toque no seu retrato.');
        } else {
          Interface.avisar('Para usar depois, toque no seu retrato.');
        }
        HUD.atualizar();
      }
    });
    return true;
  }
};
