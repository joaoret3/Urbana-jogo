// =============================================================================
// JOYSTICK VIRTUAL — controle de movimento por toque ou mouse
// -----------------------------------------------------------------------------
// Fica no canto inferior esquerdo do HUD. Arraste a bolinha para andar.
// O valor fica em Joystick.x e Joystick.y (de -1 a 1); a CenaMapa lê esses
// valores a cada quadro. Quanto mais longe do centro, mais rápido (RF-MOV-004).
// =============================================================================
const Joystick = {
  x: 0, y: 0, ativo: false,
  ZONA_MORTA: 0.18,          // movimentos pequenos demais são ignorados

  // Cria o elemento HTML do joystick
  montar() {
    const E = Interface.el.bind(Interface);
    const bolinha = E('div', { class: 'joystick-bolinha' });
    const base = E('div', { class: 'joystick', role: 'application', 'aria-label': 'Joystick: arraste para andar' },
      E('span', { class: 'joystick-seta s-cima', 'aria-hidden': 'true' }, Icones.svg('seta_cima')),
      E('span', { class: 'joystick-seta s-baixo', 'aria-hidden': 'true' }, Icones.svg('seta_baixo')),
      E('span', { class: 'joystick-seta s-esq', 'aria-hidden': 'true' }, Icones.svg('seta_esq')),
      E('span', { class: 'joystick-seta s-dir', 'aria-hidden': 'true' }, Icones.svg('seta_dir')),
      bolinha);
    let ponteiro = null;

    const mover = (ev) => {
      const r = base.getBoundingClientRect();
      const raio = r.width / 2;
      let dx = (ev.clientX - (r.left + raio)) / raio;
      let dy = (ev.clientY - (r.top + raio)) / raio;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) { dx /= dist; dy /= dist; }
      bolinha.style.transform = `translate(${dx * raio * 0.55}px, ${dy * raio * 0.55}px)`;
      const forca = Math.min(1, dist);
      if (forca < this.ZONA_MORTA) { this.x = 0; this.y = 0; }
      else { this.x = dx; this.y = dy; }
    };
    const soltar = () => {
      ponteiro = null; this.ativo = false; this.x = 0; this.y = 0;
      bolinha.style.transform = '';
      base.classList.remove('pressionado');
    };
    base.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ponteiro = ev.pointerId; this.ativo = true;
      base.setPointerCapture(ev.pointerId);
      base.classList.add('pressionado');
      mover(ev);
    });
    base.addEventListener('pointermove', (ev) => { if (ev.pointerId === ponteiro) mover(ev); });
    base.addEventListener('pointerup', soltar);
    base.addEventListener('pointercancel', soltar);
    base.addEventListener('lostpointercapture', soltar);
    return base;
  },

  zerar() { this.x = 0; this.y = 0; this.ativo = false; }
};
