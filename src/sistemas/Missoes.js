// =============================================================================
// MISSÕES — objetivos configurados em dados/missoes.js
// -----------------------------------------------------------------------------
// O progresso de cada missão é contado a partir do que já está na partida
// (murais visitados, fichas lidas, quizzes, muros, latas). Por isso não é
// preciso guardar contadores: basta conferir depois de cada ação.
// Uma missão que pede mais do que o jogo tem fica "indisponível" (RF da seção 10.3).
// Cada missão dá sua recompensa uma única vez.
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

  // Situação de uma missão: { missao, feito, meta, estado: 'concluida' | 'andamento' | 'indisponivel' }
  situacao(m) {
    const p = Salvamento.atual;
    const concluida = !!p && p.missoes_concluidas.includes(m.id);
    const possivel = Conteudo.missaoPossivel(m);
    const feito = Math.min(m.meta, this.contar(m.tipo));
    return { missao: m, feito: concluida ? m.meta : feito, meta: m.meta,
      estado: concluida ? 'concluida' : (possivel ? 'andamento' : 'indisponivel') };
  },

  lista() { return this.todas().map(m => this.situacao(m)); },

  // Confere todas as missões e entrega as recompensas das que acabaram de ser cumpridas
  verificar() {
    const p = Salvamento.atual; if (!p) return;
    for (const m of this.todas()) {
      if (p.missoes_concluidas.includes(m.id) || !Conteudo.missaoPossivel(m)) continue;
      if (this.contar(m.tipo) >= m.meta) {
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
