// =============================================================================
// PROGRESSO — regras do jogo: XP, níveis, latas, visitas, quizzes, compras e muros
// -----------------------------------------------------------------------------
// TODA mudança no progresso do jogador passa por aqui. Assim as regras ficam
// num lugar só:
//   - recompensas "únicas" (primeira visita, quiz, lata, missão) nunca se repetem;
//   - o saldo de latas nunca fica negativo;
//   - o nível é calculado pelo XP acumulado (o XP nunca é gasto);
//   - depois de cada ação o jogo confere as missões e salva automaticamente.
//
// Para mostrar avisos e efeitos, a cena do mapa define Progresso.aoNotificar.
// =============================================================================
const Progresso = {
  // Função chamada a cada novidade: aoNotificar({ tipo, titulo, texto, xp, latas })
  // tipos: 'recompensa', 'nivel', 'missao', 'descoberta'
  aoNotificar: null,

  p() { return Salvamento.atual; },

  // ---------------------------------------------------------------------------
  // NÍVEIS
  // ---------------------------------------------------------------------------
  nivelDoXp(xp) {
    let nivel = 1;
    for (const n of Conteudo.niveis()) if (xp >= n.xp) nivel = n.nivel;
    return nivel;
  },

  // Informações para a barra de XP do HUD
  //   { nivel, xp, xpNivel, xpProximo (null no último nível), fracao (0 a 1) }
  infoNivel(xp) {
    const niveis = Conteudo.niveis();
    const nivel = this.nivelDoXp(xp);
    const atual = niveis.find(n => n.nivel === nivel) || { xp: 0 };
    const proximo = niveis.find(n => n.nivel === nivel + 1) || null;
    const fracao = proximo ? (xp - atual.xp) / (proximo.xp - atual.xp) : 1;
    return { nivel, xp, xpNivel: atual.xp, xpProximo: proximo ? proximo.xp : null, fracao: Math.max(0, Math.min(1, fracao)) };
  },

  // Um avatar está disponível se foi desbloqueado na partida ou se o nível permite
  avatarDisponivel(partida, avatar) {
    if (!avatar) return false;
    if (partida && partida.avatares_desbloqueados.includes(avatar.id)) return true;
    const nivel = partida ? this.nivelDoXp(partida.jogador.xp) : 1;
    return nivel >= (avatar.nivel_minimo || 1);
  },

  // Personagens na ordem de exibição: primeiro os disponíveis, depois os bloqueados;
  // em cada grupo, pela sequência de níveis (nível 1, 2, 3...). Empate: ordem do cadastro.
  avataresOrdenados(partida) {
    return Conteudo.avatares()
      .map((a, i) => ({ a, i, livre: this.avatarDisponivel(partida, a) ? 0 : 1, nivel: a.nivel_minimo || 1 }))
      .sort((x, y) => x.livre - y.livre || x.nivel - y.nivel || x.i - y.i)
      .map(x => x.a);
  },

  notificar(n) { if (this.aoNotificar) this.aoNotificar(n); },

  // ---------------------------------------------------------------------------
  // RECOMPENSAS
  // ---------------------------------------------------------------------------
  // Soma XP e latas e cuida da subida de nível. Não salva (quem chama salva).
  ganhar(rec, titulo) {
    const p = this.p(); if (!p) return;
    const xp = Math.max(0, Math.floor(rec.xp || 0)), latas = Math.max(0, Math.floor(rec.latas || 0));
    const nivelAntes = this.nivelDoXp(p.jogador.xp);
    p.jogador.xp += xp;
    p.jogador.latas += latas;
    if (rec.moldura && !p.molduras_desbloqueadas.includes(rec.moldura)) p.molduras_desbloqueadas.push(rec.moldura);
    if (titulo && (xp || latas || rec.moldura)) this.notificar({ tipo: 'recompensa', titulo, xp, latas, moldura: rec.moldura });
    const nivelDepois = this.nivelDoXp(p.jogador.xp);
    for (let n = nivelAntes + 1; n <= nivelDepois; n++) this.subirNivel(n);
    p.jogador.nivel = nivelDepois;
  },

  // Desbloqueia automaticamente os itens do novo nível (RF-XP-006)
  subirNivel(n) {
    const p = this.p();
    const dados = Conteudo.niveis().find(x => x.nivel === n) || {};
    const d = dados.desbloqueia || {};
    const nomes = [];
    (d.avatares || []).forEach(id => {
      if (!p.avatares_desbloqueados.includes(id)) p.avatares_desbloqueados.push(id);
      const a = Conteudo.avatar(id); if (a) nomes.push('Avatar: ' + a.nome);
    });
    (d.molduras || []).forEach(id => {
      if (!p.molduras_desbloqueadas.includes(id)) p.molduras_desbloqueadas.push(id);
      const m = Conteudo.moldura(id); if (m) nomes.push(m.nome);
    });
    const artes = Conteudo.artesPublicadas().filter(a => Conteudo.nivelArte(a) === n);
    if (artes.length) nomes.push(`${artes.length} arte(s) liberada(s) para compra no Black Book`);
    this.notificar({ tipo: 'nivel', titulo: `Nível ${n}!`, itens: nomes });
  },

  // Conta de teste (só se URBANA.CONTA_TESTE for true): apelido "teste" começa no nível máximo,
  // com 9999 latas e tudo o que os níveis liberam. Não mostra avisos de nível.
  ehContaTeste(apelido) {
    return window.URBANA.CONTA_TESTE === true && String(apelido || '').trim().toLowerCase() === 'teste';
  },
  prepararContaTeste() {
    const p = this.p(); if (!p) return;
    const niveis = Conteudo.niveis();
    niveis.forEach(n => {
      const d = n.desbloqueia || {};
      (d.avatares || []).forEach(id => { if (!p.avatares_desbloqueados.includes(id)) p.avatares_desbloqueados.push(id); });
      (d.molduras || []).forEach(id => { if (!p.molduras_desbloqueadas.includes(id)) p.molduras_desbloqueadas.push(id); });
    });
    const ultimo = niveis[niveis.length - 1];
    if (ultimo) { p.jogador.xp = Math.max(p.jogador.xp, ultimo.xp); p.jogador.nivel = this.nivelDoXp(p.jogador.xp); }
    p.jogador.latas = Math.max(p.jogador.latas, 9999);
    Salvamento.salvar();
  },

  // Termina uma ação: confere missões e salva
  concluirAcao() {
    Missoes.verificar();
    Salvamento.salvar();
  },

  // ---------------------------------------------------------------------------
  // AÇÕES DO JOGADOR
  // ---------------------------------------------------------------------------
  // Primeira visita a um grafite (ficha aberta de perto). Devolve true na primeira vez.
  registrarVisita(grafiteId) {
    const p = this.p(); if (!p || p.murais_visitados.includes(grafiteId)) return false;
    p.murais_visitados.push(grafiteId);
    const g = Conteudo.grafite(grafiteId);
    this.notificar({ tipo: 'descoberta', titulo: 'Grafite descoberto!', texto: g ? g.titulo : '' });
    this.ganhar(Conteudo.jogo().recompensas.primeira_visita || {}, 'Primeira visita');
    this.concluirAcao();
    return true;
  },

  // Ficha lida até o fim
  registrarLeitura(grafiteId) {
    const p = this.p(); if (!p || p.fichas_lidas.includes(grafiteId)) return false;
    p.fichas_lidas.push(grafiteId);
    this.concluirAcao();
    return true;
  },

  // Uma pergunta do quiz foi acertada
  registrarAcerto(quizId, indicePergunta) {
    const p = this.p(); if (!p) return;
    const lista = p.perguntas_acertadas[quizId] || (p.perguntas_acertadas[quizId] = []);
    if (!lista.includes(indicePergunta)) lista.push(indicePergunta);
    Salvamento.salvar();
  },

  // Quiz concluído (todas as perguntas acertadas). Recompensa só na primeira vez.
  // Devolve a recompensa dada ({xp, latas}) ou null se já tinha sido concluído.
  concluirQuiz(quizId) {
    const p = this.p(); if (!p || p.quizzes_concluidos.includes(quizId)) return null;
    p.quizzes_concluidos.push(quizId);
    const q = Conteudo.quiz(quizId) || {};
    const padrao = Conteudo.jogo().recompensas.quiz_padrao || {};
    const rec = { xp: 'xp' in q ? q.xp : padrao.xp, latas: 'latas' in q ? q.latas : padrao.latas };
    this.ganhar(rec, null);   // a própria tela do quiz mostra a recompensa
    this.concluirAcao();
    return rec;
  },

  // v2.37: ao abrir uma partida, volta ao mapa uma parte sorteada das latas que estavam coletadas.
  // No mínimo "latas_renascem_percentual" (dados/jogo.js, padrão 60%); a quantidade exata é sorteada entre esse
  // mínimo e todas. Não mexe em itens_coletados, então o progresso das missões de latas não diminui.
  renascerLatas(p) {
    const existentes = new Set(((Conteudo.mapa && Conteudo.mapa.latas) || []).map(o => o.name));
    p.latas_vazias = p.latas_vazias.filter(id => existentes.has(id));
    const n = p.latas_vazias.length; if (!n) return 0;
    const pct = Math.max(0, Math.min(100, Number((Conteudo.jogo() || {}).latas_renascem_percentual ?? 60)));
    const minimo = Math.ceil(n * pct / 100), qtd = minimo + Math.floor(Math.random() * (n - minimo + 1));
    const v = p.latas_vazias.slice();
    for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
    const voltam = new Set(v.slice(0, qtd));
    p.latas_vazias = p.latas_vazias.filter(id => !voltam.has(id));
    return qtd;
  },

  // Lata coletada no mapa
  coletarLata(itemId) {
    const p = this.p(); if (!p || p.latas_vazias.includes(itemId)) return false;
    p.latas_vazias.push(itemId);
    if (!p.itens_coletados.includes(itemId)) p.itens_coletados.push(itemId);   // as missões contam latas diferentes, então o progresso nunca diminui
    this.ganhar({ latas: Conteudo.jogo().recompensas.lata_coletavel || 1 }, null);
    this.concluirAcao();
    return true;
  },

  // ---------------------------------------------------------------------------
  // BLACK BOOK E MUROS
  // ---------------------------------------------------------------------------
  // Uma arte está liberada se foi comprada, ou se é grátis (preço 0) e o nível do jogador já permite
  arteDesbloqueada(arteId) {
    const p = this.p(); if (!p) return false;
    if (p.artes_desbloqueadas.includes(arteId)) return true;
    const arte = Conteudo.arte(arteId);
    return !!arte && this.arteGratis(arte) && this.nivelDoXp(p.jogador.xp) >= Conteudo.nivelArte(arte);
  },
  arteGratis(arte) { return Number(Conteudo.precoArte(arte)) === 0; },

  // Pode comprar? Devolve { pode, motivo }
  podeDesbloquear(arte) {
    const p = this.p();
    if (!p) return { pode: false, motivo: 'Sem partida aberta.' };
    if (this.arteDesbloqueada(arte.id)) return { pode: false, motivo: 'Já desbloqueada.' };
    const nivel = this.nivelDoXp(p.jogador.xp), precisa = Conteudo.nivelArte(arte), preco = Conteudo.precoArte(arte);
    if (nivel < precisa) return { pode: false, motivo: `Precisa do nível ${precisa} (você está no nível ${nivel}).` };
    if (p.jogador.latas < preco) return { pode: false, motivo: `Faltam ${preco - p.jogador.latas} latas (você tem ${p.jogador.latas}).` };
    return { pode: true, motivo: '' };
  },

  // Compra uma arte (a tela já pediu confirmação). Devolve true se comprou.
  desbloquearArte(arteId) {
    const arte = Conteudo.arte(arteId); if (!arte) return false;
    if (!this.podeDesbloquear(arte).pode) return false;
    const p = this.p();
    p.jogador.latas = Math.max(0, p.jogador.latas - Conteudo.precoArte(arte));   // nunca negativo
    p.artes_desbloqueadas.push(arteId);
    this.concluirAcao();
    return true;
  },

  // Aplica (ou troca) a arte de um muro virtual. Não custa latas.
  pintarMuro(muroId, arteId) {
    const p = this.p(); if (!p || !this.arteDesbloqueada(arteId)) return false;
    p.muros_pintados[muroId] = arteId;
    this.concluirAcao();
    return true;
  },

  // Em quantos muros cada arte está aplicada
  usosDaArte(arteId) {
    const p = this.p(); if (!p) return 0;
    return Object.values(p.muros_pintados).filter(a => a === arteId).length;
  }
};
