// =============================================================================
// TELA 01 — MENU PRINCIPAL
// -----------------------------------------------------------------------------
// Fundo: um pedaço do mapa do bairro (em volta da escola), desenhado pelo
// Phaser e passeando devagar. Por cima: a logo e os botões, feitos em HTML
// (aparência em estilo/urbana.css, seção "MENU PRINCIPAL").
//
// Novo Jogo  → pede o apelido (TelaNovaPartida) → história em quadrinhos (TelaHistoria) → seleção de avatar (CenaAvatar)
// Continuar  → lista de partidas deste computador (TelaPartidas) → mapa
// =============================================================================
class CenaMenu extends Phaser.Scene {
  constructor() { super('CenaMenu'); }

  create() {
    FundoBairro.montar(this);   // mapa em volta da escola, ao fundo (sistemas/FundoBairro.js)
    this.montarMenu();
    Sons.iniciarMusica();
    // ao sair desta cena, remove o HTML do menu
    this.events.once('shutdown', () => Interface.limpar());
  }

  // --- Botões do menu (HTML) -------------------------------------------------
  montarMenu() {
    const E = Interface.el.bind(Interface);
    const temPartida = Salvamento.listar().length > 0;

    const botoes = E('nav', { class: 'menu-botoes', 'aria-label': 'Menu principal' },
      Interface.botao('Novo Jogo', () => this.novoJogo(), { tipo: 'principal', icone: 'play' }),
      Interface.botao('Continuar', () => this.continuar(), {
        icone: 'refazer', desabilitado: !temPartida, detalhe: temPartida ? null : 'Nenhuma partida salva'
      }),
      Interface.botao('Meu Black Book', () => this.abrirBlackBook(), {
        icone: 'caderno', desabilitado: !temPartida, detalhe: temPartida ? null : 'Comece uma partida primeiro'
      }),
      E('div', { class: 'menu-linha' },
        Interface.botao('Créditos', () => TelaCreditos.abrir(), { icone: 'estrela' }),
        Interface.botao('Som', () => TelaConfiguracoes.abrir(), { icone: 'som', rotulo: 'Configurações de som e qualidade' })
      )
    );

    const tela = E('div', { class: 'tela-menu' },
      E('div', { class: 'menu-vinheta', 'aria-hidden': 'true' }),
      E('main', { class: 'menu-centro' },
        E('h1', { class: 'menu-logo' }, E('img', { src: 'assets/ui/logo_urbana.webp', alt: 'Urbana' })),
        E('p', { class: 'menu-chamada' }, 'Explore o bairro Goiânia e descubra os grafites da nossa comunidade.'),
        botoes
      ),
      E('footer', { class: 'menu-rodape' },
        E('span', {}, 'Escola Municipal Carolina Maria de Jesus · Bairro Goiânia · Belo Horizonte/MG'),
        // v2.38: se a versão do conteúdo (dados/jogo.js) estiver vazia, só aparece a versão do jogo
        E('span', { class: 'menu-versao' }, `Urbana v${window.URBANA.VERSAO}` + (Conteudo.jogo().versao_conteudo ? ` · conteúdo ${Conteudo.jogo().versao_conteudo}` : '')),
        // (o link para o Editor de conteúdo saiu do menu dos alunos na v2.0: o editor abre pelo editor.html)
      )
    );
    Interface.raiz.append(tela);
    Interface.focarPrimeiro(tela);
  }

  novoJogo() {
    if (Salvamento.limiteAtingido()) {
      Interface.confirmar({
        titulo: 'Limite de partidas',
        texto: `Este computador já tem ${Salvamento.listar().length} partidas, o máximo permitido. Para começar outra, exclua uma partida em Continuar (se quiser, exporte antes).`,
        sim: 'Ver partidas', nao: 'Voltar'
      }).then(sim => { if (sim) this.continuar(); });
      return;
    }
    TelaNovaPartida.abrir((apelido) => TelaHistoria.abrir(() => this.scene.start('CenaAvatar', { apelido })));
  }

  continuar() {
    TelaPartidas.abrir({
      aoEscolher: (id) => this.jogar(id),
      aoFechar: () => this.atualizarBotoes()
    });
  }

  // Abre uma partida salva e vai para o mapa
  jogar(id) {
    const r = Salvamento.abrir(id);
    if (!r) {
      Interface.confirmar({
        titulo: 'Partida danificada',
        texto: 'Não foi possível abrir esta partida e não há cópia anterior. Se você tiver um arquivo exportado, use "Importar partida" em Continuar.',
        sim: 'Entendi', nao: 'Fechar'
      });
      return;
    }
    if (r.recuperada) Interface.avisar('A partida estava danificada. Recuperamos a última cópia salva.');
    this.scene.start('CenaMapa');
  }

  abrirBlackBook() {
    TelaPartidas.abrir({
      titulo: 'Black Book de quem?', textoBotao: 'Abrir', somenteEscolher: true,
      aoEscolher: (id) => {
        // abre a partida escolhida só para ver/desbloquear artes no Black Book
        const r = Salvamento.abrir(id);
        if (!r) { Interface.avisar('Não foi possível abrir esta partida.', 'erro'); return; }
        TelaBlackBook.abrir({ modo: 'ver', aoFechar: () => this.atualizarBotoes() });
      }
    });
  }

  // Depois de excluir/importar partidas, os botões Continuar e Black Book mudam
  atualizarBotoes() {
    Interface.limpar();
    this.montarMenu();
  }
}
