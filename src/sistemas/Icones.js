// =============================================================================
// ÍCONES — desenhos em SVG usados nos botões, no HUD e nas janelas
// -----------------------------------------------------------------------------
// O jogo não usa emojis: cada ícone é um desenho simples (traço grosso, cor do
// texto), igual em qualquer celular, tablet ou computador.
//
// Uso:  Interface.icone('caderno', 'minha-classe')         → <span> com o desenho
//       Interface.comIcone('cadeado', 'Nível 3')            → ícone + texto lado a lado
//       Icones.nomes                                        → lista de nomes (editor)
//
// Para criar um ícone novo, acrescente uma linha em DESENHOS: o conteúdo é o miolo de
// um SVG 24 × 24 (linhas e formas; o traço e a cor já vêm do CSS).
// =============================================================================
const Icones = {
  DESENHOS: {
    caderno: '<path d="M7 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7z"/><path d="M3 7h5M3 11h5M3 15h5M3 19h5"/><path d="M11 16.5l2.8-3.2 2 2 2.2-3"/><circle cx="15.5" cy="8" r="1.3"/>',
    lapis: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    livro: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 22H19v-4"/><path d="M12.5 2v7.5l2-1.6 2 1.6V2"/>',   // v2.49: Black Book no HUD
    engrenagem: '<path d="M9.70 5.39L9.77 2.05L14.23 2.05L14.30 5.39L16.57 6.70L19.51 5.10L21.73 8.95L18.88 10.69L18.88 13.31L21.73 15.05L19.51 18.90L16.57 17.30L14.30 18.61L14.23 21.95L9.77 21.95L9.70 18.61L7.43 17.30L4.49 18.90L2.27 15.05L5.12 13.31L5.12 10.69L2.27 8.95L4.49 5.10L7.43 6.70z"/><circle cx="12" cy="12" r="2.8"/>',   // v2.49: Menu no HUD
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    som: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    pessoa: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
    nivel: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    cadeado_aberto: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    andar: '<circle cx="12" cy="4.5" r="2"/><path d="M12 8v6M12 10l-3.5 3M12 10l3.5 3M12 14l-3 7M12 14l3 7"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    lata: '<rect x="7.5" y="9" width="9" height="12" rx="2"/><path d="M10 9V6h4v3M11 6V3.5h2V6"/><path d="M18.5 5.5h.01M20.5 3.5h.01M20.5 7.5h.01"/>',
    mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    bandeira: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    balao: '<path d="M4 5h16v11H10l-4 4v-4H4z"/>',
    disquete: '<path d="M5 4h12l3 3v13H5z"/><path d="M8 4v5h8V4M8 20v-6h8v6"/>',
    imagem: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l5-5 4 4 3-3 6 6"/>',
    paleta: '<path d="M12 3a9 9 0 0 0 0 18c1.6 0 2.2-1.1 1.7-2.3-.5-1.2.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4c0-5-4-9.4-9-9.4z"/><path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01"/>',
    lixeira: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    escola: '<path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-6h4v6"/><path d="M12 3v2"/>',
    carro: '<path d="M3 15v-3l2-4h10l4 4h2v3z"/><path d="M7 8l-1.5 4M11 8v4"/><circle cx="7.5" cy="16" r="2"/><circle cx="16.5" cy="16" r="2"/>',
    faixa: '<path d="M4 5.5h16M4 10h16M4 14.5h16M4 19h16"/>',
    muro: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19"/>',
    cursor: '<path d="M5 3l14 7-6 2-2 6z"/>',
    camera: '<path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    sair: '<path d="M9 4H5v16h4M14 8l4 4-4 4M18 12H9"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
    voltar: '<path d="M15 5l-7 7 7 7"/>',
    ir: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    estrela: '<path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.1-5.6 3.1 1.3-6.2L3 9.5l6.3-.7z"/>',
    refazer: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
    girar_esq: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    menos: '<path d="M5 12h14"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    baixar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    enviar: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
    duplicar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    seta_cima: '<path d="M6 15l6-6 6 6"/>',
    seta_baixo: '<path d="M6 9l6 6 6-6"/>',
    seta_esq: '<path d="M15 6l-6 6 6 6"/>',
    seta_dir: '<path d="M9 6l6 6-6 6"/>',
    celular: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'
  },

  get nomes() { return Object.keys(this.DESENHOS); },
  existe(nome) { return Object.prototype.hasOwnProperty.call(this.DESENHOS, nome); },

  // Devolve o <svg>. Nome que não existe vira uma estrela (não quebra o jogo).
  svg(nome) {
    const miolo = this.existe(nome) ? this.DESENHOS[nome] : this.DESENHOS.estrela;
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    e.setAttribute('viewBox', '0 0 24 24');
    e.setAttribute('class', 'icone-svg icone-' + (this.existe(nome) ? nome : 'estrela'));
    e.setAttribute('aria-hidden', 'true');
    e.setAttribute('focusable', 'false');
    e.innerHTML = miolo;   // texto fixo deste arquivo (não vem do usuário)
    return e;
  }
};
