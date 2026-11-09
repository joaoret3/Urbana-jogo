// =============================================================================
// TELA 07 — PERSONALIZAÇÃO DE MURO VIRTUAL
// -----------------------------------------------------------------------------
// Aberta ao apertar A perto de um muro livre (camada "muros_livres" do Tiled).
// Mostra o muro, a prévia da arte escolhida sobre ele, o título e a autoria.
// Só aceita artes desbloqueadas; o botão "Abrir Black Book" permite
// desbloquear outras ali mesmo. Aplicar ou trocar a arte não custa latas.
//
//   TelaPintarMuro.abrir({ muroId, aoAplicar(arteId) })
// =============================================================================
const TelaPintarMuro = {
  abrir(op) {
    const E = Interface.el.bind(Interface);
    const p = Salvamento.atual;
    const muro = Conteudo.muro(op.muroId);
    const atual = p.muros_pintados[op.muroId] || null;
    let escolhida = atual;

    const imgPrevia = E('img', { alt: '' });
    const previa = E('div', { class: 'muro-previa', style: { aspectRatio: `${muro.width} / ${muro.height}` } },
      E('img', { class: 'muro-fundo', src: 'assets/ui/muro_livre.webp', alt: '' }), imgPrevia);
    const fundoPrevia = previa.querySelector('.muro-fundo');
    const legenda = E('p', { class: 'muro-legenda' });
    const lista = E('div', { class: 'muro-artes', role: 'listbox', 'aria-label': 'Artes desbloqueadas' });
    const aplicar = Interface.botao('Aplicar arte', () => {
      if (!escolhida || escolhida === atual) return;
      janela.fechar();
      op.aoAplicar(escolhida);
    }, { tipo: 'principal', icone: 'paleta' });

    const desenhar = () => {
      const livres = Conteudo.artesPublicadas().filter(a => Progresso.arteDesbloqueada(a.id));
      lista.replaceChildren(...livres.map(a => E('button', {
        type: 'button', class: 'muro-arte' + (a.id === escolhida ? ' ativa' : ''), role: 'option',
        'aria-selected': String(a.id === escolhida), 'aria-label': `${a.titulo}, de ${a.autoria || '—'}`,
        onclick: () => { escolhida = a.id; desenhar(); }
      }, E('img', { src: a.imagem, alt: '' }), E('span', {}, a.titulo))));
      if (!livres.length) lista.append(E('p', { class: 'muro-vazio' }, 'Você ainda não tem artes desbloqueadas. Abra o Black Book para desbloquear uma com suas latas.'));
      const arte = escolhida && Conteudo.arte(escolhida);
      imgPrevia.hidden = !arte;
      fundoPrevia.src = arte ? 'assets/ui/muro_base.webp' : 'assets/ui/muro_livre.webp';
      if (arte) imgPrevia.src = arte.imagem;
      legenda.replaceChildren(arte
        ? E('span', {}, E('strong', {}, arte.titulo), ' · arte de ', E('strong', {}, arte.autoria || '—'),
            escolhida === atual ? ' (já está neste muro)' : '')
        : 'Muro sem arte. Escolha uma arte desbloqueada abaixo.');
      aplicar.disabled = !arte || escolhida === atual;
      aplicar.querySelector('.botao-texto').textContent = atual && escolhida !== atual ? 'Trocar arte' : 'Aplicar arte';
    };

    const janela = Interface.abrirPainel({
      titulo: 'Pintar muro',
      classe: 'painel-largo painel-muro',
      conteudo: [
        E('p', { class: 'muro-selo' }, Interface.comIcone('paleta', 'Muro virtual · personalização da sua partida (não é um grafite real catalogado)')),
        previa, legenda,
        E('h3', { class: 'ficha-subtitulo' }, 'Suas artes'),
        lista
      ],
      rodape: [
        Interface.botao('Cancelar', () => janela.fechar()),
        Interface.botao('Abrir Black Book', () => {
          const bb = TelaBlackBook.abrir({
            modo: 'escolher',
            aoEscolher: (id) => { escolhida = id; bb.fechar(); },
            aoFechar: desenhar
          });
        }, { icone: 'caderno' }),
        aplicar
      ]
    });
    desenhar();
    return janela;
  }
};
