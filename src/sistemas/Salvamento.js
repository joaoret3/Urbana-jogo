// =============================================================================
// SALVAMENTO — partidas guardadas neste computador (localStorage)
// -----------------------------------------------------------------------------
// Cada computador pode ter várias partidas, uma por apelido (o máximo fica
// em dados/jogo.js → max_partidas_por_computador).
//
// Como fica guardado no navegador (chaves do localStorage):
//   urbana_partidas               lista resumida das partidas (para a tela Continuar)
//   urbana_partida_<id>           a partida
//   urbana_partida_<id>_anterior  cópia da gravação anterior (recuperação)
//   urbana_partida_<id>_tmp       gravação temporária (existe só durante a gravação)
//
// Gravação segura (RF-SAV-015): grava primeiro na chave temporária, confere se
// ficou legível, guarda a versão atual como "anterior" e só então substitui.
// Se a partida estiver estragada, o jogo tenta a cópia "anterior".
//
// Principais funções:
//   Salvamento.listar()               partidas existentes (resumo)
//   Salvamento.criar(apelido, avatar) nova partida (vira a partida atual)
//   Salvamento.abrir(id)              carrega uma partida (vira a partida atual)
//   Salvamento.salvar()               grava a partida atual
//   Salvamento.excluir(id)
//   Salvamento.exportar(id)           baixa um arquivo .json (cópia de segurança)
//   Salvamento.importar(texto)        lê um arquivo exportado
// =============================================================================
const Salvamento = {
  VERSAO: 1,                                       // aumente quando o formato mudar (veja migrar)
  PREFIXO: window.URBANA.PREFIXO_ARMAZENAMENTO,
  atual: null,                                     // partida em jogo agora

  chaveIndice() { return this.PREFIXO + 'partidas'; },
  chave(id, sufixo = '') { return this.PREFIXO + 'partida_' + id + sufixo; },

  // ---------------------------------------------------------------------------
  // Estrutura de uma partida nova
  // ---------------------------------------------------------------------------
  partidaNova(apelido, avatarId) {
    const agora = new Date().toISOString();
    const inicio = Conteudo.mapa.inicio || { x: 0, y: 0 };
    const nivel1 = (Conteudo.niveis()[0] || {}).desbloqueia || {};
    return {
      versao_save: this.VERSAO,
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      apelido,
      criada_em: agora,
      atualizada_em: agora,
      versao_conteudo: Conteudo.jogo().versao_conteudo || '',
      jogador: {
        avatar_id: avatarId,
        moldura_id: (nivel1.molduras || [])[0] || null,
        xp: 0,
        nivel: 1,
        latas: 0,
        posicao: { x: inicio.x, y: inicio.y }
      },
      murais_visitados: [],         // ids dos grafites cuja ficha foi aberta de perto
      fichas_lidas: [],             // ids dos grafites cuja ficha foi lida até o fim
      quizzes_concluidos: [],       // ids dos quizzes acertados por completo
      perguntas_acertadas: {},      // quiz_id → índices das perguntas já acertadas
      itens_coletados: [],          // ids das latas do mapa já coletadas
      artes_desbloqueadas: [],
      muros_pintados: {},           // muro_id → arte_id
      missoes_concluidas: [],
      avatares_desbloqueados: (nivel1.avatares || []).slice(),
      molduras_desbloqueadas: (nivel1.molduras || []).slice(),
      tutorial_visto: false
    };
  },

  // Completa campos que faltarem (partidas antigas) e confere os tipos.
  // Devolve a partida corrigida ou null se não for uma partida válida.
  normalizar(p) {
    if (!p || typeof p !== 'object' || typeof p.id !== 'string' || typeof p.apelido !== 'string') return null;
    if (!p.jogador || typeof p.jogador !== 'object') return null;
    p = this.migrar(p);
    const base = this.partidaNova(p.apelido, p.jogador.avatar_id);
    for (const k of Object.keys(base)) if (!(k in p)) p[k] = base[k];
    for (const k of Object.keys(base.jogador)) if (!(k in p.jogador)) p.jogador[k] = base.jogador[k];
    const listas = ['murais_visitados', 'fichas_lidas', 'quizzes_concluidos', 'itens_coletados', 'artes_desbloqueadas',
      'missoes_concluidas', 'avatares_desbloqueados', 'molduras_desbloqueadas'];
    for (const k of listas) if (!Array.isArray(p[k])) p[k] = [];
    for (const k of ['muros_pintados', 'perguntas_acertadas']) if (!p[k] || typeof p[k] !== 'object' || Array.isArray(p[k])) p[k] = {};
    const j = p.jogador;
    j.xp = Math.max(0, Math.floor(Number(j.xp) || 0));
    j.latas = Math.max(0, Math.floor(Number(j.latas) || 0));     // saldo nunca negativo
    j.nivel = Progresso.nivelDoXp(j.xp);
    if (!j.posicao || !isFinite(j.posicao.x) || !isFinite(j.posicao.y)) j.posicao = { ...base.jogador.posicao };
    // avatar que não existe mais no conteúdo → volta para o primeiro disponível
    if (!Conteudo.avatar(j.avatar_id)) j.avatar_id = base.avatares_desbloqueados[0] || (Conteudo.avatares()[0] || {}).id;
    return p;
  },

  // Atualiza partidas gravadas em versões antigas do jogo (RNF-CON-004)
  migrar(p) {
    if (!p.versao_save) p.versao_save = 1;
    // Exemplo para o futuro:
    // if (p.versao_save === 1) { ...converter...; p.versao_save = 2; }
    return p;
  },

  // ---------------------------------------------------------------------------
  // Leitura e gravação no navegador
  // ---------------------------------------------------------------------------
  lerChave(chave) {
    try { const t = localStorage.getItem(chave); return t ? JSON.parse(t) : null; }
    catch (e) { return null; }
  },

  // Lista das partidas (resumo). Se a lista estiver estragada, reconstrói
  // procurando as partidas guardadas.
  listar() {
    let indice = this.lerChave(this.chaveIndice());
    if (!Array.isArray(indice)) {
      indice = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const m = k && k.match(new RegExp('^' + this.PREFIXO + 'partida_([a-z0-9]+)$'));
        if (m) { const p = this.normalizar(this.lerChave(k)); if (p) indice.push(this.resumo(p)); }
      }
      this.gravarIndice(indice);
    }
    // só as que ainda existem (ou têm cópia anterior), mais recentes primeiro
    return indice
      .filter(r => localStorage.getItem(this.chave(r.id)) || localStorage.getItem(this.chave(r.id, '_anterior')))
      .sort((a, b) => String(b.atualizada_em).localeCompare(String(a.atualizada_em)));
  },

  resumo(p) {
    return {
      id: p.id, apelido: p.apelido, avatar_id: p.jogador.avatar_id, moldura_id: p.jogador.moldura_id,
      nivel: Progresso.nivelDoXp(p.jogador.xp), xp: p.jogador.xp, latas: p.jogador.latas,
      murais: p.murais_visitados.length, atualizada_em: p.atualizada_em
    };
  },

  gravarIndice(indice) {
    try { localStorage.setItem(this.chaveIndice(), JSON.stringify(indice)); } catch (e) { /* sem espaço */ }
  },

  atualizarIndice(p) {
    const indice = (this.lerChave(this.chaveIndice()) || []).filter(r => r.id !== p.id);
    indice.push(this.resumo(p));
    this.gravarIndice(indice);
  },

  apelidoExiste(apelido) {
    const a = apelido.trim().toLowerCase();
    return this.listar().find(r => r.apelido.trim().toLowerCase() === a) || null;
  },

  limiteAtingido() {
    return this.listar().length >= (Conteudo.jogo().max_partidas_por_computador || 6);
  },

  // Grava uma partida com segurança. Devolve true se deu certo.
  gravar(p) {
    p.atualizada_em = new Date().toISOString();
    p.jogador.nivel = Progresso.nivelDoXp(p.jogador.xp);
    const texto = JSON.stringify(p);
    const kPrincipal = this.chave(p.id), kTmp = this.chave(p.id, '_tmp'), kAnterior = this.chave(p.id, '_anterior');
    try {
      localStorage.setItem(kTmp, texto);                                 // 1. grava temporária
      const conferida = this.normalizar(JSON.parse(localStorage.getItem(kTmp)));   // 2. confere
      if (!conferida) throw new Error('gravação inválida');
      const antiga = localStorage.getItem(kPrincipal);
      if (antiga) localStorage.setItem(kAnterior, antiga);               // 3. guarda a anterior
      localStorage.setItem(kPrincipal, texto);                           // 4. substitui
      localStorage.removeItem(kTmp);
      this.atualizarIndice(p);
      return true;
    } catch (e) {
      try { localStorage.removeItem(kTmp); } catch (e2) { /* nada */ }
      console.warn('[Urbana] Não foi possível salvar a partida:', e);
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Operações usadas pelas telas
  // ---------------------------------------------------------------------------
  criar(apelido, avatarId) {
    const existente = this.apelidoExiste(apelido);
    if (existente) this.excluir(existente.id);   // a tela já pediu confirmação para substituir
    const p = this.partidaNova(apelido.trim(), avatarId);
    if (!this.gravar(p)) return null;
    this.atual = p;
    return p;
  },

  // Carrega uma partida. Devolve { partida, recuperada } ou null.
  abrir(id) {
    let p = this.normalizar(this.lerChave(this.chave(id)));
    let recuperada = false;
    if (!p) {                                        // principal estragada: tenta a anterior
      p = this.normalizar(this.lerChave(this.chave(id, '_anterior')));
      recuperada = !!p;
      if (p) this.gravar(p);
    }
    if (!p) return null;
    this.atual = p;
    return { partida: p, recuperada };
  },

  salvar() {
    if (!this.atual) return false;
    return this.gravar(this.atual);
  },

  excluir(id) {
    ['', '_anterior', '_tmp'].forEach(s => localStorage.removeItem(this.chave(id, s)));
    this.gravarIndice((this.lerChave(this.chaveIndice()) || []).filter(r => r.id !== id));
    if (this.atual && this.atual.id === id) this.atual = null;
  },

  // Baixa a partida como arquivo .json (cópia de segurança)
  exportar(id) {
    const p = this.normalizar(this.lerChave(this.chave(id))) || this.normalizar(this.lerChave(this.chave(id, '_anterior')));
    if (!p) return false;
    const pacote = { tipo: 'urbana_partida', exportado_em: new Date().toISOString(), partida: p };
    const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const nomeSeguro = p.apelido.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    const a = Interface.el('a', { href: url, download: `urbana_${nomeSeguro || 'partida'}_${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  },

  // Lê o texto de um arquivo exportado. Devolve a partida (ainda não gravada) ou null.
  lerImportacao(texto) {
    try {
      const j = JSON.parse(texto);
      const p = (j && j.tipo === 'urbana_partida') ? j.partida : j;
      return this.normalizar(p);
    } catch (e) { return null; }
  },

  // Grava uma partida importada. modo: 'substituir' (mesmo id) ou 'copia' (novo id)
  gravarImportada(p, modo) {
    if (modo === 'copia') {
      p.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    return this.gravar(p);
  }
};
