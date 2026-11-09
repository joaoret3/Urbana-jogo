// =============================================================================
// CENA DE SELEÇÃO DE AVATAR (ao começar um novo jogo)
// -----------------------------------------------------------------------------
// Recebe o apelido escolhido no menu. Ao selecionar um avatar, cria a partida
// (sistemas/Salvamento.js) e abre o mapa, com o jogador em frente à escola.
// A tela em si está em src/telas/TelaAvatar.js.
// =============================================================================
class CenaAvatar extends Phaser.Scene {
  constructor() { super('CenaAvatar'); }

  init(dados) { this.apelido = dados.apelido; }

  create() {
    FundoBairro.montar(this);
    this.events.once('shutdown', () => Interface.limpar());

    const primeiroLivre = Progresso.avataresOrdenados(null).find(a => Progresso.avatarDisponivel(null, a));
    Interface.raiz.append(TelaAvatar.montar({
      partida: null,
      apelido: this.apelido,
      selecionado: primeiroLivre && primeiroLivre.id,
      textoBotao: 'Começar a explorar',
      aoVoltar: () => this.scene.start('CenaMenu'),
      aoSelecionar: (avatarId) => {
        const partida = Salvamento.criar(this.apelido, avatarId);
        if (!partida) {
          Interface.avisar('Não foi possível criar a partida: o navegador está sem espaço. Exclua partidas antigas.', 'erro');
          return;
        }
        if (Progresso.ehContaTeste(this.apelido)) Progresso.prepararContaTeste();
        this.scene.start('CenaMapa');
      }
    }));
  }
}
