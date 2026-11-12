// =============================================================================
// PARTIDAS SALVAS — tela do botão "Continuar"
// -----------------------------------------------------------------------------
// Lista as partidas deste computador. Para cada uma: Jogar, Exportar
// (cópia de segurança em arquivo .json) e Excluir. Também permite Importar
// uma partida exportada (de outro computador ou de uma cópia de segurança).
//
//   TelaPartidas.abrir({ aoEscolher(id), titulo, textoBotao })
// =============================================================================
const TelaPartidas = {
  abrir(op) {
    const E = Interface.el.bind(Interface);
    const lista = E('ul', { class: 'partidas-lista' });
    const vazio = E('p', { class: 'partidas-vazio' }, 'Nenhuma partida salva neste computador. Comece um Novo Jogo ou importe uma partida.');

    const formatarData = (iso) => {
      const d = new Date(iso);
      return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const desenhar = () => {
      const partidas = Salvamento.listar();
      const total = Conteudo.grafitesPublicados().length;
      lista.replaceChildren(...partidas.map(r => {
        const avatar = Conteudo.avatar(r.avatar_id);
        const moldura = Conteudo.moldura(r.moldura_id);
        return E('li', { class: 'partida-cartao' },
          Interface.temEmblema(moldura) ? E('div', { class: 'com-emblema partida-emblema' }, Interface.emblema(avatar && avatar.retrato, moldura)) :   // v2.43
          E('div', { class: 'com-moldura' + (moldura && moldura.imagem ? ' vazada' : '') },
            E('div', { class: 'retrato-redondo', style: { '--moldura': moldura ? moldura.cor : 'var(--lima)' } },
              avatar ? E('img', { src: avatar.retrato, alt: '' }) : null),
            Interface.molduraVazada(moldura)),
          E('div', { class: 'partida-info' },
            E('strong', { class: 'partida-apelido' }, r.apelido),
            E('span', {}, `Nível ${r.nivel} · ${r.latas} latas · ${r.murais} de ${total} murais`),
            E('small', {}, 'Última vez: ' + formatarData(r.atualizada_em))
          ),
          E('div', { class: 'partida-acoes' },
            Interface.botao(op.textoBotao || 'Jogar', () => { janela.fechar(); op.aoEscolher(r.id); }, { tipo: 'principal', icone: 'play' }),
            op.somenteEscolher ? null : Interface.botao('Exportar', () => {
              if (Salvamento.exportar(r.id)) Interface.avisar('Arquivo da partida baixado. Guarde-o como cópia de segurança.');
              else Interface.avisar('Não foi possível exportar esta partida.', 'erro');
            }, { icone: 'baixar', rotulo: 'Exportar a partida de ' + r.apelido }),
            op.somenteEscolher ? null : Interface.botao('Excluir', async () => {
              const sim = await Interface.confirmar({
                titulo: 'Excluir partida?',
                texto: `A partida de "${r.apelido}" será apagada deste computador. Se quiser guardar, use Exportar antes. Excluir mesmo?`,
                sim: 'Excluir', perigo: true
              });
              if (sim) { Salvamento.excluir(r.id); desenhar(); Interface.avisar('Partida excluída.'); }
            }, { tipo: 'fantasma', icone: 'lixeira', rotulo: 'Excluir a partida de ' + r.apelido })
          )
        );
      }));
      vazio.hidden = partidas.length > 0;
    };

    // Importar: lê um arquivo .json exportado
    const arquivo = E('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (ev) => {
      const f = ev.target.files[0]; ev.target.value = '';
      if (!f) return;
      const p = Salvamento.lerImportacao(await f.text());
      if (!p) { Interface.avisar('Este arquivo não é uma partida do Urbana válida.', 'erro'); return; }
      const mesmoId = Salvamento.listar().find(r => r.id === p.id);
      let modo = 'copia';
      if (mesmoId) {
        const sim = await Interface.confirmar({
          titulo: 'Partida já existe',
          texto: `A partida de "${mesmoId.apelido}" já está neste computador. Substituir pelo arquivo? (o progresso atual dela será trocado pelo do arquivo)`,
          sim: 'Substituir', perigo: true
        });
        if (!sim) return;
        modo = 'substituir';
      } else {
        if (Salvamento.limiteAtingido()) { Interface.avisar('Limite de partidas atingido. Exclua uma partida antes de importar.', 'erro'); return; }
        let apelido = p.apelido, n = 2;
        while (Salvamento.apelidoExiste(apelido)) apelido = `${p.apelido} (${n++})`;
        p.apelido = apelido;
      }
      if (Salvamento.gravarImportada(p, modo)) { desenhar(); Interface.avisar(`Partida de "${p.apelido}" importada!`); }
      else Interface.avisar('Não foi possível gravar a partida (sem espaço no navegador?).', 'erro');
    } });

    const janela = Interface.abrirPainel({
      titulo: op.titulo || 'Continuar',
      classe: 'painel-largo',
      conteudo: [lista, vazio, arquivo],
      rodape: [
        op.somenteEscolher ? null : Interface.botao('Importar partida', () => arquivo.click(), { icone: 'enviar' }),
        Interface.botao('Voltar', () => janela.fechar(), { icone: 'voltar' })
      ].filter(Boolean),
      aoFechar: op.aoFechar
    });
    desenhar();
    return janela;
  }
};
