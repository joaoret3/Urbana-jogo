// =============================================================================
// NOVA PARTIDA — pede o apelido do jogador
// -----------------------------------------------------------------------------
// Cada partida deste computador é identificada por um apelido.
// Não é preciso usar o nome completo do estudante (privacidade).
// Se o apelido já existir, pede confirmação antes de substituir o progresso.
// =============================================================================
const TelaNovaPartida = {
  MIN: 2,
  MAX: 20,

  // aoConfirmar(apelido) é chamado quando o apelido for aceito
  abrir(aoConfirmar) {
    const E = Interface.el.bind(Interface);
    const erro = E('p', { class: 'campo-erro', role: 'alert' });
    const campo = E('input', {
      id: 'campo-apelido', class: 'campo-texto', type: 'text', maxlength: String(this.MAX),
      autocomplete: 'off', spellcheck: 'false', 'data-foco': true,
      placeholder: 'Ex.: Lu, Rafa, MC Goiânia',
      onkeydown: (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); confirmar(); } }
    });
    const confirmar = async () => {
      const apelido = campo.value.replace(/\s+/g, ' ').trim();
      if (apelido.length < this.MIN) { erro.textContent = `Escreva um apelido com pelo menos ${this.MIN} letras.`; campo.focus(); return; }
      if (!/^[\p{L}\p{N} ._-]+$/u.test(apelido)) { erro.textContent = 'Use só letras, números, espaço, ponto, hífen ou sublinhado.'; campo.focus(); return; }
      const existente = Salvamento.apelidoExiste(apelido);
      if (existente) {
        const sim = await Interface.confirmar({
          titulo: 'Apelido já usado',
          texto: `Já existe uma partida de "${existente.apelido}" (nível ${existente.nivel}, ${existente.latas} latas) neste computador. Começar de novo vai APAGAR esse progresso. Deseja substituir?`,
          sim: 'Substituir', nao: 'Escolher outro apelido', perigo: true
        });
        if (!sim) { campo.focus(); campo.select(); return; }
      }
      janela.fechar();
      aoConfirmar(apelido);
    };

    const janela = Interface.abrirPainel({
      titulo: 'Novo jogo',
      classe: 'painel-pequeno',
      conteudo: [
        E('label', { class: 'campo-rotulo', for: 'campo-apelido' }, 'Qual é o seu apelido?'),
        campo,
        E('p', { class: 'campo-dica' }, 'Use um apelido ou só o primeiro nome. Não é preciso escrever o nome completo.'),
        window.URBANA.CONTA_TESTE ? E('p', { class: 'campo-dica' }, 'Conta de teste: use o apelido TESTE (nível máximo e 9999 latas).') : null,
        erro
      ],
      rodape: [
        Interface.botao('Cancelar', () => janela.fechar()),
        Interface.botao('Começar', confirmar, { tipo: 'principal', icone: 'play' })
      ]
    });
    return janela;
  }
};
