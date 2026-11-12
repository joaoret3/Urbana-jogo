// =============================================================================
// CONTEÚDO — lê os arquivos de dados (pasta dados/) e confere se estão corretos
// -----------------------------------------------------------------------------
// Todo o conteúdo do jogo vem dos arquivos de dados (dados/*.js) e das imagens em assets/.
// Este módulo:
//   1. lê os arquivos de dados (Conteudo.carregar)
//   2. confere os dados conforme a seção 17.5 da especificação (Conteudo.validar)
//   3. oferece funções para as outras partes do jogo buscarem os dados
//
// Os problemas encontrados aparecem na aba "Conferência" do Editor de conteúdo
// (src/editor/EditorConferencia.js). O jogo dos alunos não mostra a conferência.
//   - erro:  algo que quebra ou esconde conteúdo (precisa corrigir)
//   - aviso: algo que vale revisar, mas o jogo funciona
// =============================================================================
const Conteudo = {
  dados: {},           // conteúdo de cada arquivo: Conteudo.dados.grafites, .artes, ...
  mapa: null,          // informações tiradas do mapa do Tiled (pontos, grafites, muros, latas)
  erros: [],
  avisos: [],
  alcancavel: null,    // grade com as áreas que o jogador consegue alcançar a partir da escola

  TIPOS_MISSAO: ['visitar_murais', 'ler_fichas', 'concluir_quizzes', 'pintar_muros', 'coletar_latas', 'visitar_todos'],
  STATUS_PUBLICACAO: ['publicado', 'rascunho'],
  LETRAS: ['A', 'B', 'C', 'D'],

  // ---------------------------------------------------------------------------
  // 1. LEITURA DOS ARQUIVOS
  // ---------------------------------------------------------------------------
  // Os arquivos de dados são arquivos .js (dados/grafites.js, ...) com o conteúdo
  // em formato JSON. Assim o jogo abre com dois cliques no index.html, sem servidor.
  // Cada arquivo é carregado com uma tag <script>; se faltar ou tiver erro de
  // digitação, o problema aparece na tela "Conferência do conteúdo".
  async carregar() {
    const cfg = window.URBANA;
    this.dados = {}; this.erros = []; this.avisos = [];
    window.URBANA_DADOS = window.URBANA_DADOS || {};
    // erros de digitação dentro de um arquivo de dados
    const errosDeEscrita = {};
    const aoErro = (ev) => {
      const m = (ev.filename || '').match(/dados\/([\w-]+)\.js/);
      if (m) errosDeEscrita[m[1]] = `linha ${ev.lineno}: ${ev.message}`;
    };
    window.addEventListener('error', aoErro);
    await Promise.all(cfg.ARQUIVOS_DADOS.map(nome => this.carregarScript(cfg.PASTA_DADOS + nome + '.js')
      .catch(() => this.erro(cfg.PASTA_DADOS + nome + '.js', 'Arquivo não encontrado.'))));
    window.removeEventListener('error', aoErro);
    for (const nome of cfg.ARQUIVOS_DADOS) {
      const caminho = cfg.PASTA_DADOS + nome + '.js';
      const d = window.URBANA_DADOS[nome];
      if (errosDeEscrita[nome]) this.erro(caminho, 'Erro de escrita no arquivo (confira vírgulas, aspas e chaves). Detalhe: ' + errosDeEscrita[nome]);
      else if (!d && !this.erros.some(e => e.onde === caminho)) {
        // sem servidor, o navegador não informa a linha do erro
        this.erro(caminho, 'O arquivo abriu, mas o conteúdo não foi reconhecido. Provável erro de escrita (confira vírgulas, aspas e chaves) ou use o Editor de conteúdo.');
      }
      this.dados[nome] = (d && typeof d === 'object') ? d : {};
    }
  },

  // Carrega um arquivo .js (devolve uma Promise)
  carregarScript(caminho) {
    return new Promise((resolver, rejeitar) => {
      const s = document.createElement('script');
      s.src = caminho + '?v=' + Date.now();   // evita usar uma cópia antiga guardada pelo navegador
      s.onload = () => { s.remove(); resolver(); };
      s.onerror = () => { s.remove(); rejeitar(new Error('não encontrado')); };
      document.head.append(s);
    });
  },

  // Lê as camadas de objetos do mapa do Tiled (já carregado pelo Phaser)
  lerMapa(mapaTiled) {
    const camada = (nome) => (mapaTiled.layers.find(l => l.name === nome && l.type === 'objectgroup') || { objects: [] }).objects;
    const colisao = mapaTiled.layers.find(l => l.name === 'colisao');
    this.mapa = {
      largura: mapaTiled.width * mapaTiled.tilewidth,
      altura: mapaTiled.height * mapaTiled.tileheight,
      tile: mapaTiled.tilewidth,
      colunas: mapaTiled.width,
      linhas: mapaTiled.height,
      colisao: colisao ? colisao.data : null,
      inicio: camada('pontos').find(o => o.type === 'spawn' || o.name === 'inicio') || null,
      grafites: camada('grafites'),
      muros: camada('muros_livres'),
      latas: camada('coletaveis'),
      faixas: camada('faixas_pedestre'),    // faixas de pedestre (retângulos girados, como os muros)
      carros: camada('carros'),             // carros estacionados (Carros.js)
      npcs: camada('npcs')                  // personagens que dão missões (Npcs.js)
    };
  },

  erro(onde, texto) { this.erros.push({ onde, texto }); },
  aviso(onde, texto) { this.avisos.push({ onde, texto }); },

  // ---------------------------------------------------------------------------
  // 2. CONFERÊNCIA DO CONTEÚDO (seção 17.5)
  // ---------------------------------------------------------------------------
  async validar() {
    const d = this.dados;
    const lista = (arq, chave) => {
      const v = d[arq] && d[arq][chave];
      if (!Array.isArray(v)) { this.erro('dados/' + arq + '.js', `Falta a lista "${chave}".`); return []; }
      return v;
    };
    const niveis = lista('niveis', 'niveis');
    const avatares = lista('avatares', 'avatares');
    const molduras = lista('molduras', 'molduras');
    const grafites = lista('grafites', 'grafites');
    const quizzes = lista('quizzes', 'quizzes');
    const artes = lista('artes', 'artes');
    const missoes = lista('missoes', 'missoes');
    const jogo = d.jogo || {};
    const imagens = [];   // [arquivo de origem, id, caminho da imagem] para conferir no fim

    // Identificadores repetidos ou ausentes
    const conferirIds = (itens, arq) => {
      const vistos = new Set();
      itens.forEach((it, i) => {
        if (!it || typeof it.id !== 'string' || !it.id.trim()) this.erro(arq, `O item nº ${i + 1} está sem "id".`);
        else if (vistos.has(it.id)) this.erro(arq, `O id "${it.id}" está repetido.`);
        else vistos.add(it.id);
      });
      return vistos;
    };
    const idsAvatares = conferirIds(avatares, 'dados/avatares.js');
    const idsMolduras = conferirIds(molduras, 'dados/molduras.js');
    molduras.forEach(m => { if (m.imagem) imagens.push([`dados/molduras.js → ${m.id}`, m.imagem]); if (m.fundo) imagens.push([`dados/molduras.js → ${m.id} (emblema)`, m.fundo]); });   // v2.36 vazada, v2.43 emblema
    const idsGrafites = conferirIds(grafites, 'dados/grafites.js');
    const idsQuizzes = conferirIds(quizzes, 'dados/quizzes.js');
    conferirIds(artes, 'dados/artes.js');
    conferirIds(missoes, 'dados/missoes.js');

    // Níveis
    const nivelMax = niveis.length;
    niveis.forEach((n, i) => {
      const onde = 'dados/niveis.js';
      if (n.nivel !== i + 1) this.erro(onde, `Os níveis devem estar em ordem (1, 2, 3...). Encontrei ${n.nivel} na posição ${i + 1}.`);
      if (i === 0 && n.xp !== 0) this.erro(onde, 'O nível 1 deve começar com xp 0.');
      if (i > 0 && !(n.xp > niveis[i - 1].xp)) this.erro(onde, `O XP do nível ${n.nivel} deve ser maior que o do nível anterior.`);
      const desb = n.desbloqueia || {};
      (desb.avatares || []).forEach(a => { if (!idsAvatares.has(a)) this.erro(onde, `Nível ${n.nivel} desbloqueia o avatar "${a}", que não existe em avatares.js.`); });
      (desb.molduras || []).forEach(m => { if (!idsMolduras.has(m)) this.erro(onde, `Nível ${n.nivel} desbloqueia a moldura "${m}", que não existe em molduras.js.`); });
    });
    const nivelValido = (v) => Number.isInteger(v) && v >= 1 && v <= nivelMax;

    // Avatares
    avatares.forEach(a => {
      const onde = `dados/avatares.js → ${a.id}`;
      if (!a.nome) this.erro(onde, 'Falta o "nome".');
      if (!a.retrato) this.erro(onde, 'Falta a imagem "retrato".'); else imagens.push([onde, a.retrato]);
      if (!nivelValido(a.nivel_minimo)) this.erro(onde, `"nivel_minimo" deve ser um número de 1 a ${nivelMax}.`);
      const s = a.sprite;
      if (!s || !s.arquivo) this.erro(onde, 'Falta a folha de sprites ("sprite": { "arquivo": ... }).');
      else {
        imagens.push([onde, s.arquivo]);
        if (!(s.largura_quadro > 0 && s.altura_quadro > 0)) this.erro(onde, 'A folha de sprites precisa de "largura_quadro" e "altura_quadro".');
        if (!(Number.isInteger(s.quadros_caminhada) && s.quadros_caminhada >= 1)) this.erro(onde, '"quadros_caminhada" deve ser um número inteiro (1 ou mais).');
      }
    });
    if (!avatares.some(a => a.nivel_minimo === 1)) this.erro('dados/avatares.js', 'É preciso pelo menos um avatar com nivel_minimo 1 (disponível desde o início).');

    // Grafites (fichas)
    const pinsMapa = new Map((this.mapa ? this.mapa.grafites : []).map(o => [o.name, o]));
    grafites.forEach(g => {
      const onde = `dados/grafites.js → ${g.id}`;
      ['titulo', 'descricao', 'imagem', 'quiz_id', 'data_registro'].forEach(c => { if (!g[c]) this.erro(onde, `Falta o campo "${c}".`); });
      if (g.imagem) imagens.push([onde, g.imagem]);
      if (g.data_registro && !/^\d{4}-\d{2}-\d{2}$/.test(g.data_registro)) this.erro(onde, '"data_registro" deve estar no formato AAAA-MM-DD (ex.: 2026-09-15).');
      if (!this.STATUS_PUBLICACAO.includes(g.status_publicacao)) this.erro(onde, '"status_publicacao" deve ser "publicado" ou "rascunho".');
      else if (g.status_publicacao === 'rascunho') this.aviso(onde, 'Está como rascunho: não aparece no jogo.');
      if (g.quiz_id && !idsQuizzes.has(g.quiz_id)) this.erro(onde, `O quiz "${g.quiz_id}" não existe em quizzes.js.`);
      if (!('artista' in g)) this.aviso(onde, 'Sem o campo "artista". Use null quando a autoria não for identificada.');
      if (!g.creditos_fotografia) this.aviso(onde, 'Sem "creditos_fotografia". Confira a autorização da foto.');
      if (g.status_publicacao === 'publicado' && !pinsMapa.has(g.id)) {
        this.erro(onde, `Não há ponto "${g.id}" na camada "grafites" do mapa (Tiled). Sem ele o pin não aparece.`);
      }
    });
    // pontos no mapa sem ficha
    pinsMapa.forEach((o, nome) => {
      if (!idsGrafites.has(nome)) this.aviso('mapa → camada grafites', `O ponto "${nome}" não tem ficha em grafites.js.`);
    });

    // Quizzes
    quizzes.forEach(q => {
      const onde = `dados/quizzes.js → ${q.id}`;
      if (!idsGrafites.has(q.grafite_id)) this.erro(onde, `O grafite "${q.grafite_id}" não existe em grafites.js.`);
      else {
        const g = grafites.find(x => x.id === q.grafite_id);
        if (g.quiz_id !== q.id) this.aviso(onde, `A ficha "${g.id}" aponta para outro quiz ("${g.quiz_id}").`);
      }
      ['xp', 'latas'].forEach(c => {
        if (c in q && !(Number.isInteger(q[c]) && q[c] >= 0)) this.erro(onde, `"${c}" deve ser um número inteiro (0 ou mais).`);
      });
      if (!Array.isArray(q.perguntas) || !q.perguntas.length) { this.erro(onde, 'Precisa de pelo menos uma pergunta em "perguntas".'); return; }
      q.perguntas.forEach((p, i) => {
        const ondeP = `${onde}, pergunta ${i + 1}`;
        if (!p.enunciado) this.erro(ondeP, 'Falta o "enunciado".');
        if (!Array.isArray(p.alternativas) || p.alternativas.length !== 4 || p.alternativas.some(a => !String(a || '').trim())) {
          this.erro(ondeP, 'Precisa ter exatamente 4 alternativas preenchidas (A, B, C e D).');
        }
        if (!this.LETRAS.includes(String(p.correta || '').toUpperCase())) this.erro(ondeP, '"correta" deve ser a letra da resposta certa: A, B, C ou D.');
        if (!p.explicacao) this.aviso(ondeP, 'Sem "explicacao" (é opcional, mas ajuda o estudante).');
      });
    });

    // Artes do Black Book
    const categorias = jogo.categorias_arte || {};
    artes.forEach(a => {
      const onde = `dados/artes.js → ${a.id}`;
      if (!a.titulo) this.erro(onde, 'Falta o "titulo".');
      if (!a.imagem) this.erro(onde, 'Falta a "imagem".'); else imagens.push([onde, a.imagem]);
      if (!categorias[a.categoria]) this.erro(onde, `Categoria "${a.categoria}" não existe em jogo.js (use: ${Object.keys(categorias).filter(k => !k.startsWith('_')).join(', ')}).`);
      const preco = this.precoArte(a), nivel = this.nivelArte(a);
      if (!(Number.isInteger(preco) && preco >= 0)) this.erro(onde, 'Preço inválido (deve ser um número inteiro, 0 ou mais).');
      if (!nivelValido(nivel)) this.erro(onde, `Nível mínimo ${nivel} não existe (o jogo tem níveis de 1 a ${nivelMax}).`);
      if (!a.autoria) this.aviso(onde, 'Sem "autoria". Use o nome artístico autorizado.');
      if (!a.autorizacao || a.autorizacao.autorizado !== true) this.aviso(onde, 'Sem autorização confirmada (autorizacao.autorizado = true): a arte não aparece no jogo.');
      if (!this.STATUS_PUBLICACAO.includes(a.status_publicacao)) this.erro(onde, '"status_publicacao" deve ser "publicado" ou "rascunho".');
    });

    // Missões
    missoes.forEach(m => {
      const onde = `dados/missoes.js → ${m.id}`;
      if (!m.titulo) this.erro(onde, 'Falta o "titulo".');
      if (!this.TIPOS_MISSAO.includes(m.tipo)) this.erro(onde, `Tipo "${m.tipo}" desconhecido. Use: ${this.TIPOS_MISSAO.join(', ')}.`);
      if (!(Number.isInteger(m.meta) && m.meta >= 1)) this.erro(onde, '"meta" deve ser um número inteiro (1 ou mais).');
      const r = m.recompensa || {};
      if (r.moldura && !idsMolduras.has(r.moldura)) this.erro(onde, `A moldura "${r.moldura}" não existe em molduras.js.`);
      if (this.TIPOS_MISSAO.includes(m.tipo) && !this.missaoPossivel(m)) {
        this.aviso(onde, `Ficará desativada: pede ${m.meta}, mas o jogo ainda não tem conteúdo suficiente.`);
      }
      if (m.personagem && !this.npc(m.personagem)) this.erro(onde, `O personagem "${m.personagem}" não existe em npcs.js.`);
    });

    // Personagens que dão missões (npcs.js)
    this.npcs().forEach(n => {
      const onde = `dados/npcs.js → ${n.id}`;
      if (!n.nome) this.erro(onde, 'Falta o "nome".');
      const s = n.sprite || {};
      if (!s.arquivo) this.erro(onde, 'Falta a folha de sprites ("sprite.arquivo").');
      else imagens.push([onde, s.arquivo]);
      if (n.retrato) imagens.push([onde, n.retrato]);
      if (!(Number(s.largura_quadro) > 0 && Number(s.altura_quadro) > 0)) this.erro(onde, 'Tamanho do quadro inválido.');
      if (this.mapa && !this.mapa.npcs.some(o => o.name === n.id)) this.aviso(onde, 'Ainda não foi colocado no mapa (Editor > Mapa > Colocar personagem): suas missões não aparecem.');
    });

    // Mapa: início, pins, muros, latas — dentro do mapa e alcançáveis a partir da escola
    this.validarMapa(jogo.interacao || {});

    // Imagens que não existem
    await this.conferirImagens(imagens);

    // Mostra no console para quem estiver testando
    if (this.erros.length) console.warn(`[Urbana] Conteúdo com ${this.erros.length} erro(s):`, this.erros);
    if (this.avisos.length) console.info(`[Urbana] Conteúdo com ${this.avisos.length} aviso(s):`, this.avisos);
  },

  validarMapa(inter) {
    const m = this.mapa;
    if (!m) { this.erro('assets/mapa/mapa.js', 'Mapa não carregado.'); return; }
    if (!m.inicio) { this.erro('mapa → camada pontos', 'Falta o ponto de início (tipo "spawn").'); return; }
    if (!m.colisao) { this.erro('mapa', 'Falta a camada "colisao".'); return; }
    if (this.bloqueado(m.inicio.x, m.inicio.y)) this.erro('mapa → camada pontos', 'O ponto de início está em cima de uma área bloqueada.');
    this.calcularAlcance();

    const dentro = (x, y) => x >= 0 && y >= 0 && x < m.largura && y < m.altura;
    const conferirPonto = (o, camada, raio) => {
      const onde = `mapa → ${camada} → ${o.name || '(sem nome)'}`;
      if (!o.name) this.erro(onde, 'Objeto sem nome. O nome é o id usado nos dados.');
      if (!dentro(o.x, o.y)) { this.erro(onde, 'Está fora do mapa.'); return; }
      if (!this.alcancavelPerto(o.x, o.y, raio)) this.erro(onde, 'Não dá para chegar perto dele andando a partir da escola (confira a colisão).');
    };
    m.grafites.forEach(o => conferirPonto(o, 'grafites', inter.distancia_pin || 140));
    m.latas.forEach(o => conferirPonto(o, 'coletaveis', inter.distancia_lata || 56));
    const nomesLatas = new Set();
    m.latas.forEach(o => { if (nomesLatas.has(o.name)) this.erro('mapa → coletaveis', `Nome "${o.name}" repetido.`); nomesLatas.add(o.name); });

    if (!m.muros.length) this.aviso('mapa → muros_livres', 'Nenhum muro virtual marcado ainda.');
    const nomesMuros = new Set();
    m.muros.forEach(o => {
      const onde = `mapa → muros_livres → ${o.name || '(sem nome)'}`;
      if (!o.name) this.erro(onde, 'Muro sem nome (ex.: muro_01).');
      else if (nomesMuros.has(o.name)) this.erro(onde, 'Nome repetido.');
      nomesMuros.add(o.name);
      if (!(o.width > 0 && o.height > 0)) { this.erro(onde, 'O muro precisa ser um retângulo com largura e altura.'); return; }
      if (this.cantosMuro(o).some(([x, y]) => !dentro(x, y))) { this.erro(onde, 'Está fora do mapa.'); return; }
      const c = this.centroMuro(o);
      if (!this.alcancavelPerto(c.x, c.y, (inter.distancia_muro || 130) + Math.max(o.width, o.height) / 2)) {
        this.erro(onde, 'Não há área de interação alcançável perto deste muro.');
      }
    });
  },

  // --- Muros (retângulos do Tiled, que podem estar girados) -----------------
  // No Tiled o retângulo gira em volta do canto superior esquerdo (x, y).
  cantosMuro(o) {
    const a = (o.rotation || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    return [[o.x, o.y], [o.x + ux * o.width, o.y + uy * o.width],
      [o.x + ux * o.width + vx * o.height, o.y + uy * o.width + vy * o.height], [o.x + vx * o.height, o.y + vy * o.height]];
  },
  centroMuro(o) {
    const c = this.cantosMuro(o);
    return { x: (c[0][0] + c[2][0]) / 2, y: (c[0][1] + c[2][1]) / 2 };
  },
  // A arte do muro sempre fica "em pé" para quem olha da rua: se o giro do retângulo
  // passar de 90° (para um lado ou para o outro), o desenho é virado 180° dentro do mesmo
  // retângulo — o muro continua no mesmo lugar, só a arte deixa de ficar de cabeça para baixo.
  muroVirado(o) {
    const a = ((((o.rotation || 0) % 360) + 540) % 360) - 180;   // -180..180
    return Math.abs(a) > 90;
  },
  // Listras de uma faixa de pedestre (retângulo do Tiled: "width" atravessa a rua,
  // "height" é o comprimento das listras). Devolve os 4 cantos de cada listra, em
  // coordenadas do mapa. Usado pelo jogo (Detalhes.js) e pelo editor.
  LISTRA: { largura: 13, passo: 24 },
  listrasFaixa(o) {
    const a = (o.rotation || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const L = this.LISTRA, n = Math.max(1, Math.floor(o.width / L.passo));
    const ini = (o.width - (n - 1) * L.passo) / 2, h = o.height, out = [];
    for (let k = 0; k < n; k++) {
      const t0 = ini + k * L.passo - L.largura / 2, t1 = t0 + L.largura;
      const p = (t, s) => ({ x: o.x + ux * t + nx * s, y: o.y + uy * t + ny * s });
      out.push([p(t0, 0), p(t1, 0), p(t1, h), p(t0, h)]);
    }
    return out;
  },
  muro(id) { return (this.mapa ? this.mapa.muros : []).find(o => o.name === id); },

  // --- Colisão e alcance ------------------------------------------------------
  bloqueado(x, y) {
    const m = this.mapa, c = Math.floor(x / m.tile), l = Math.floor(y / m.tile);
    if (c < 0 || l < 0 || c >= m.colunas || l >= m.linhas) return true;
    return m.colisao[l * m.colunas + c] !== 0;
  },

  // "Inunda" o mapa a partir do início para descobrir onde o jogador consegue chegar
  calcularAlcance() {
    const m = this.mapa, W = m.colunas, H = m.linhas;
    const ok = new Uint8Array(W * H);
    const c0 = Math.floor(m.inicio.x / m.tile), l0 = Math.floor(m.inicio.y / m.tile);
    const fila = [l0 * W + c0]; ok[fila[0]] = 1;
    for (let i = 0; i < fila.length; i++) {
      const p = fila[i], c = p % W, l = (p - c) / W;
      const viz = [[c + 1, l], [c - 1, l], [c, l + 1], [c, l - 1]];
      for (const [nc, nl] of viz) {
        if (nc < 0 || nl < 0 || nc >= W || nl >= H) continue;
        const q = nl * W + nc;
        if (!ok[q] && m.colisao[q] === 0) { ok[q] = 1; fila.push(q); }
      }
    }
    this.alcancavel = ok;
  },

  alcancavelPerto(x, y, raio) {
    const m = this.mapa, t = m.tile, r = Math.ceil(raio / t);
    const c0 = Math.floor(x / t), l0 = Math.floor(y / t);
    for (let l = l0 - r; l <= l0 + r; l++) for (let c = c0 - r; c <= c0 + r; c++) {
      if (c < 0 || l < 0 || c >= m.colunas || l >= m.linhas) continue;
      if (Math.hypot((c + 0.5) * t - x, (l + 0.5) * t - y) > raio) continue;
      if (this.alcancavel[l * m.colunas + c]) return true;
    }
    return false;
  },

  // Confere se cada imagem existe
  async conferirImagens(lista) {
    await Promise.all(lista.map(([onde, caminho]) => this.imagemExiste(caminho)
      .then(ok => { if (!ok) this.erro(onde, `Imagem não encontrada: ${caminho}`); })));
  },

  // Tenta abrir a imagem (funciona com e sem servidor)
  imagemExiste(caminho) {
    return new Promise((resolver) => {
      const img = new Image();
      img.onload = () => resolver(true);
      img.onerror = () => resolver(false);
      img.src = caminho;
    });
  },

  // ---------------------------------------------------------------------------
  // 3. CONSULTAS USADAS PELO JOGO
  // ---------------------------------------------------------------------------
  // Só o que está publicado (e, nas artes, autorizado) entra no jogo
  grafitesPublicados() {
    const noMapa = new Set((this.mapa ? this.mapa.grafites : []).map(o => o.name));
    return (this.dados.grafites.grafites || []).filter(g => g.status_publicacao === 'publicado' && noMapa.has(g.id));
  },
  artesPublicadas() {
    return (this.dados.artes.artes || []).filter(a => a.status_publicacao === 'publicado' && a.autorizacao && a.autorizacao.autorizado === true);
  },
  grafite(id) { return (this.dados.grafites.grafites || []).find(g => g.id === id); },
  quiz(id) { return (this.dados.quizzes.quizzes || []).find(q => q.id === id); },
  arte(id) { return (this.dados.artes.artes || []).find(a => a.id === id); },
  avatar(id) { return (this.dados.avatares.avatares || []).find(a => a.id === id); },
  moldura(id) { return (this.dados.molduras.molduras || []).find(m => m.id === id); },
  avatares() { return this.dados.avatares.avatares || []; },
  npcs() { return (this.dados.npcs && this.dados.npcs.npcs) || []; },
  npc(id) { return this.npcs().find(n => n.id === id); },
  niveis() { return this.dados.niveis.niveis || []; },
  jogo() { return this.dados.jogo || {}; },

  categoriaArte(a) { return ((this.dados.jogo || {}).categorias_arte || {})[a.categoria] || {}; },
  precoArte(a) { return ('preco' in a) ? a.preco : this.categoriaArte(a).preco; },
  nivelArte(a) { return ('nivel_minimo' in a) ? a.nivel_minimo : this.categoriaArte(a).nivel_minimo; },

  // Uma missão só vale se o jogo tiver conteúdo suficiente para completá-la
  missaoPossivel(m) {
    return this.quantoExiste(m.tipo) >= m.meta;
  },
  // Quanto conteúdo o jogo tem para cada tipo de missão
  quantoExiste(tipo) {
    const nGrafites = this.grafitesPublicados().length;
    const nQuizzes = this.grafitesPublicados().filter(g => this.quiz(g.quiz_id)).length;
    const disponivel = {
      visitar_murais: nGrafites,
      ler_fichas: nGrafites,
      concluir_quizzes: nQuizzes,
      pintar_muros: this.mapa ? this.mapa.muros.length : 0,
      coletar_latas: this.mapa ? this.mapa.latas.length : 0,
      visitar_todos: nGrafites > 0 ? 1 : 0
    };
    return disponivel[tipo] || 0;
  }
};
