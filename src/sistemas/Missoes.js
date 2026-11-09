// =============================================================================
// MISSÕES — objetivos configurados em dados/missoes.js
// -----------------------------------------------------------------------------
// O progresso de cada missão é contado a partir do que já está na partida
// (murais visitados, fichas lidas, quizzes, muros, latas). Por isso não é
// preciso guardar contadores: basta conferir depois de cada ação.
// Uma missão que pede mais do que o jogo tem fica "indisponível" (RF da seção 10.3).
// Cada missão dá sua recompensa uma única vez.
// Missões com "personagem" (quests, v2.29): ficam trancadas até o jogador conversar
// com o personagem no mapa e só contam o que for feito DEPOIS da conversa
// (se o jogo não tiver mais conteúdo suficiente, conta o que faltar para ser possível).
// =============================================================================
const Missoes = {
  todas() { return (Conteudo.dados.missoes && Conteudo.dados.missoes.missoes) || []; },

  // Quanto o jogador já fez para um tipo de missão
  contar(tipo) {
    const p = Salvamento.atual; if (!p) return 0;
    const publicados = new Set(Conteudo.grafitesPublicados().map(g => g.id));
    const latasMapa = new Set((Conteudo.mapa ? Conteudo.mapa.latas : []).map(o => o.name));
    switch (tipo) {
      case 'visitar_murais': return p.murais_visitados.filter(id => publicados.has(id)).length;
      case 'ler_fichas': return p.fichas_lidas.filter(id => publicados.has(id)).length;
      case 'concluir_quizzes': return p.quizzes_concluidos.length;
      case 'pintar_muros': return Object.keys(p.muros_pintados).length;
      case 'coletar_latas': return p.itens_coletados.filter(id => latasMapa.has(id)).length;
      case 'visitar_todos': return publicados.size > 0 && [...publicados].every(id => p.murais_visitados.includes(id)) ? 1 : 0;
      default: return 0;
    }
  },

  // O jogador já conversou com o personagem desta missão? (missões sem personagem: sempre liberadas)
  liberada(m) {
    if (!m.personagem) return true;
    const p = Salvamento.atual;
    return !!(p && p.personagens_encontrados[m.personagem]);
  },

  // Progresso de uma missão (nas de personagem, só o que foi feito depois da conversa)
  feito(m) {
    const total = this.contar(m.tipo);
    if (!m.personagem || m.tipo === 'visitar_todos') return total;
    const p = Salvamento.atual, enc = p && p.personagens_encontrados[m.personagem];
    if (!enc) return 0;
    const base = Math.min((enc.bases || {})[m.id] || 0, Math.max(0, Conteudo.quantoExiste(m.tipo) - m.meta));
    return Math.max(0, total - base);
  },

  // Guarda o ponto de partida das missões do personagem (chamado na 1ª conversa)
  encontrar(npcId) {
    const p = Salvamento.atual; if (!p || p.personagens_encontrados[npcId]) return false;
    const bases = {};
    this.todas().filter(m => m.personagem === npcId).forEach(m => { bases[m.id] = this.contar(m.tipo); });
    p.personagens_encontrados[npcId] = { data: new Date().toISOString(), bases };
    Salvamento.salvar();
    this.verificar();
    return true;
  },

  doPersonagem(npcId) { return this.todas().filter(m => m.personagem === npcId); },

  // Situação de uma missão: { missao, feito, meta, estado: 'concluida' | 'andamento' | 'indisponivel' | 'trancada' }
  situacao(m) {
    const p = Salvamento.atual;
    const concluida = !!p && p.missoes_concluidas.includes(m.id);
    const possivel = Conteudo.missaoPossivel(m);
    const feito = Math.min(m.meta, this.feito(m));
    const estado = concluida ? 'concluida' : !possivel ? 'indisponivel' : !this.liberada(m) ? 'trancada' : 'andamento';
    return { missao: m, feito: concluida ? m.meta : (estado === 'trancada' ? 0 : feito), meta: m.meta, estado };
  },

  lista() { return this.todas().map(m => this.situacao(m)); },

  // Confere todas as missões e entrega as recompensas das que acabaram de ser cumpridas
  verificar() {
    const p = Salvamento.atual; if (!p) return;
    for (const m of this.todas()) {
      if (p.missoes_concluidas.includes(m.id) || !Conteudo.missaoPossivel(m) || !this.liberada(m)) continue;
      if (this.feito(m) >= m.meta) {
        p.missoes_concluidas.push(m.id);
        Progresso.notificar({ tipo: 'missao', titulo: 'Missão concluída!', texto: m.titulo });
        Progresso.ganhar(m.recompensa || {}, 'Recompensa da missão');
      }
    }
  },

  // Texto da recompensa (ex.: "+10 XP · +5 latas · Moldura Ouro")
  textoRecompensa(r) {
    r = r || {};
    const partes = [];
    if (r.xp) partes.push(`+${r.xp} XP`);
    if (r.latas) partes.push(`+${r.latas} latas`);
    if (r.moldura) { const m = Conteudo.moldura(r.moldura); partes.push(m ? m.nome : r.moldura); }
    return partes.join(' · ') || '—';
  }
};
