// =============================================================================
// TELA DE CONFIGURAÇÕES — som, acessibilidade e qualidade do mapa
// As escolhas ficam salvas neste computador (sistemas/Preferencias.js).
// =============================================================================
const TelaConfiguracoes = {
  abrir() {
    const E = Interface.el.bind(Interface);

    // Linha com interruptor (liga/desliga) + volume
    const linhaSom = (titulo, chaveLigado, chaveVolume) => {
      const id = 'vol-' + chaveVolume;
      const ligado = Preferencias.obter(chaveLigado);
      const estado = E('span', { class: 'interruptor-estado' }, ligado ? 'Ligado' : 'Desligado');
      const interruptor = E('button', {
        class: 'interruptor', type: 'button', role: 'switch', 'aria-checked': String(ligado), 'aria-label': titulo,
        onclick: () => {
          const novo = !Preferencias.obter(chaveLigado);
          Preferencias.definir(chaveLigado, novo);
          interruptor.setAttribute('aria-checked', String(novo));
          estado.textContent = novo ? 'Ligado' : 'Desligado';
          volume.disabled = !novo;
          Sons.aplicarPreferencias();
        }
      }, E('span', { class: 'interruptor-bolinha' }));
      const valor = E('output', { for: id, class: 'volume-valor' }, Math.round(Preferencias.obter(chaveVolume) * 100) + '%');
      const volume = E('input', {
        id, type: 'range', min: '0', max: '100', step: '5',
        value: String(Math.round(Preferencias.obter(chaveVolume) * 100)),
        disabled: !ligado,
        oninput: (ev) => {
          Preferencias.definir(chaveVolume, Number(ev.target.value) / 100);
          valor.textContent = ev.target.value + '%';
          Sons.aplicarPreferencias();
        }
      });
      return E('div', { class: 'config-linha' },
        E('div', { class: 'config-rotulo' }, E('strong', {}, titulo), E('div', { class: 'config-interruptor' }, interruptor, estado)),
        E('label', { class: 'config-volume', for: id }, E('span', {}, 'Volume'), volume, valor)
      );
    };

    // Interruptor simples (liga/desliga) com explicação
    const linhaInterruptor = (titulo, explicacao, lerValor, aoMudar) => {
      const estado = E('span', { class: 'interruptor-estado' });
      const interruptor = E('button', {
        class: 'interruptor', type: 'button', role: 'switch', 'aria-label': titulo,
        onclick: () => { aoMudar(!lerValor()); atualizar(); }
      }, E('span', { class: 'interruptor-bolinha' }));
      const atualizar = () => {
        interruptor.setAttribute('aria-checked', String(lerValor()));
        estado.textContent = lerValor() ? 'Ligado' : 'Desligado';
      };
      atualizar();
      return E('div', { class: 'config-linha' },
        E('div', { class: 'config-rotulo' }, E('strong', {}, titulo), E('div', { class: 'config-interruptor' }, interruptor, estado)),
        E('small', { class: 'config-explica' }, explicacao));
    };

    // Escolha da qualidade do mapa
    const atual = Preferencias.qualidadeMapa();
    const opcaoQualidade = (valor, titulo, texto) => E('label', { class: 'opcao-cartao' },
      E('input', {
        type: 'radio', name: 'qualidade', value: valor, checked: atual === valor,
        onchange: () => { Preferencias.definir('qualidade', valor); Interface.avisar('Qualidade salva: ' + titulo); }
      }),
      E('span', { class: 'opcao-conteudo' }, E('strong', {}, titulo), E('small', {}, texto))
    );

    const conteudo = [
      E('h3', { class: 'config-secao' }, 'Som'),
      linhaSom('Música', 'musica_ligada', 'volume_musica'),
      linhaSom('Efeitos sonoros', 'efeitos_ligados', 'volume_efeitos'),
      E('h3', { class: 'config-secao' }, 'Acessibilidade'),
      linhaInterruptor('Movimento reduzido', 'Desliga animações decorativas (balanço dos pins, partículas, passeio do fundo).',
        () => Preferencias.menosMovimento(), (v) => Preferencias.definir('movimento_reduzido', v)),
      linhaInterruptor('Controles grandes', 'Joystick e botão A maiores, para telas de toque.',
        () => !!Preferencias.obter('controles_grandes'), (v) => Preferencias.definir('controles_grandes', v)),
      E('h3', { class: 'config-secao' }, 'Qualidade do mapa'),
      E('div', { class: 'opcoes-grade', role: 'radiogroup', 'aria-label': 'Qualidade do mapa' },
        opcaoQualidade('alta', 'Alta', 'Mapa mais nítido. Para computadores e tablets mais novos.'),
        opcaoQualidade('leve', 'Leve', 'Carrega mais rápido e usa menos memória. Para computadores mais fracos.')
      ),
      E('p', { class: 'config-nota' }, 'A qualidade nova vale na próxima vez que o mapa abrir.')
    ];
    let janela;
    janela = Interface.abrirPainel({
      titulo: 'Configurações',
      classe: 'painel-config',
      conteudo,
      rodape: [Interface.botao('Pronto', () => janela.fechar(), { tipo: 'principal', icone: 'ok' })]
    });
    return janela;
  }
};
