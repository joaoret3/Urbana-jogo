// =============================================================================
// HISTÓRIA — história em quadrinhos de abertura
// -----------------------------------------------------------------------------
// Aparece toda vez que o jogador começa um NOVO JOGO (depois de escolher o apelido,
// antes da escolha do avatar). Quem usa "Continuar" não vê a história de novo.
// A imagem fica em assets/ui/historia_intro.webp (para trocar, substitua o arquivo
// mantendo o nome; o ideal é uma imagem horizontal 16:9).
// =============================================================================
const TelaHistoria = {
  IMAGEM: 'assets/ui/historia_intro.webp',

  // aoTerminar() é chamado quando o jogador toca em "Continuar"
  abrir(aoTerminar) {
    const E = Interface.el.bind(Interface);
    let feito = false;
    const fim = () => {
      if (feito) return;
      feito = true;
      document.removeEventListener('keydown', tecla);
      // some suavemente e só depois segue para a próxima tela
      fundo.classList.add('saindo');
      setTimeout(() => { fundo.remove(); aoTerminar(); }, 450);
    };
    const tecla = (ev) => { if (ev.key === 'Escape' || ev.key === 'Enter') { ev.preventDefault(); fim(); } };
    const botao = Interface.botao('Continuar', fim, { tipo: 'principal', icone: 'play', classe: 'historia-botao' });
    botao.setAttribute('data-foco', '');
    const fundo = E('div', { class: 'fundo-historia', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'A história do Urbana' },
      E('img', {
        class: 'historia-img', src: this.IMAGEM, draggable: 'false',
        alt: 'História em quadrinhos: um estudante caminha pelo bairro, vê os grafites nos muros, encontra a Carolina Maria de Jesus pintada num muro, abre o Black Book na mochila e pega a lata de spray para deixar a sua marca.'
      }),
      botao
    );
    Interface.raiz.append(fundo);
    // (registrado depois, para o Enter que confirmou o apelido não pular a história)
    setTimeout(() => { if (!feito) document.addEventListener('keydown', tecla); botao.focus({ preventScroll: true }); }, 250);
  }
};
