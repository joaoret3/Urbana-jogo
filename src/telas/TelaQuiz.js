// =============================================================================
// TELA 05 — QUIZ DO GRAFITE
// -----------------------------------------------------------------------------
// Abre por cima da ficha. Ao fechar, volta para a ficha (RF-QUIZ-013).
// Regras:
//   - 4 alternativas (A, B, C, D); é preciso escolher antes de confirmar;
//   - acerto: caixa verde "Resposta correta!" + explicação;
//   - erro: caixa vermelha "Não foi dessa vez! Tente novamente." (não perde nada);
//   - o quiz fica concluído quando todas as perguntas forem acertadas;
//     as perguntas já acertadas não precisam ser respondidas de novo;
//   - +XP e +latas só na primeira conclusão. Depois, o quiz fica para revisão.
//
//   TelaQuiz.abrir({ quizId, grafite, aoFechar })
// =============================================================================
const TelaQuiz = {
  abrir(op) {
    const E = Interface.el.bind(Interface);
    const q = Conteudo.quiz(op.quizId);
    if (!q) return null;
    const p = Salvamento.atual;
    const jaConcluido = p.quizzes_concluidos.includes(q.id);
    const acertadas = new Set(p.perguntas_acertadas[q.id] || []);
    // revisão: passa por todas; primeira vez: só pelas que faltam
    const fila = q.perguntas.map((_, i) => i).filter(i => jaConcluido || !acertadas.has(i));
    let pos = 0;              // posição na fila
    let escolhida = null;     // índice da alternativa marcada
    const letras = ['A', 'B', 'C', 'D'];

    const area = E('div', { class: 'quiz-area' });
    const rodape = E('div', { class: 'quiz-rodape' });

    const mostrarPergunta = () => {
      escolhida = null;
      const i = fila[pos], pergunta = q.perguntas[i];
      const opcoes = E('div', { class: 'quiz-opcoes', role: 'radiogroup', 'aria-label': 'Alternativas' },
        pergunta.alternativas.map((texto, k) => E('button', {
          type: 'button', class: 'quiz-opcao', role: 'radio', 'aria-checked': 'false',
          onclick: (ev) => {
            escolhida = k;
            opcoes.querySelectorAll('.quiz-opcao').forEach((b, j) => {
              b.classList.toggle('marcada', j === k); b.setAttribute('aria-checked', String(j === k));
            });
            confirmar.disabled = false;
          }
        }, E('span', { class: 'quiz-letra' }, letras[k]), E('span', {}, texto)))
      );
      const confirmar = Interface.botao('Confirmar resposta', () => responder(), { tipo: 'principal', icone: 'ok', desabilitado: true });
      area.replaceChildren(
        E('p', { class: 'quiz-contador' },
          (jaConcluido ? 'Revisão · ' : '') + `Pergunta ${pos + 1} de ${fila.length}` +
          (fila.length < q.perguntas.length ? ` (faltavam ${fila.length} de ${q.perguntas.length})` : '')),
        E('h3', { class: 'quiz-enunciado' }, pergunta.enunciado),
        opcoes,
        E('div', { class: 'quiz-feedback', 'aria-live': 'assertive' })
      );
      rodape.replaceChildren(Interface.botao('Voltar à ficha', () => janela.fechar(), { icone: 'voltar' }), confirmar);
      setTimeout(() => opcoes.querySelector('button').focus(), 30);
    };

    const responder = () => {
      if (escolhida === null) return;
      const i = fila[pos], pergunta = q.perguntas[i];
      const certa = letras.indexOf(String(pergunta.correta).toUpperCase());
      const caixa = area.querySelector('.quiz-feedback');
      area.querySelectorAll('.quiz-opcao').forEach(b => { b.disabled = true; });
      if (escolhida === certa) {
        area.querySelectorAll('.quiz-opcao')[certa].classList.add('certa');
        Sons.tocar('acerto');
        if (!jaConcluido) Progresso.registrarAcerto(q.id, i);
        const ultima = pos === fila.length - 1;
        let recompensa = null;
        if (ultima && !jaConcluido) recompensa = Progresso.concluirQuiz(q.id);
        caixa.replaceChildren(E('div', { class: 'feedback feedback-certo' },
          E('strong', {}, Interface.comIcone('ok', 'Resposta correta!')),
          pergunta.explicacao ? E('p', {}, pergunta.explicacao) : null,
          recompensa ? E('div', { class: 'chips' },
            E('span', { class: 'chip chip-xp' }, `+${recompensa.xp} XP`),
            E('span', { class: 'chip chip-latas' }, `+${recompensa.latas} latas`)) : null,
          ultima && jaConcluido ? E('p', { class: 'quiz-nota' }, 'Quiz já concluído antes: revisão sem nova recompensa.') : null
        ));
        const continuar = Interface.botao(ultima ? 'Continuar' : 'Próxima pergunta', () => {
          if (ultima) janela.fechar(); else { pos++; mostrarPergunta(); }
        }, { tipo: 'principal', icone: 'play' });
        rodape.replaceChildren(continuar);
        continuar.focus();
      } else {
        area.querySelectorAll('.quiz-opcao')[escolhida].classList.add('errada');
        Sons.tocar('erro');
        caixa.replaceChildren(E('div', { class: 'feedback feedback-errado' },
          E('strong', {}, Interface.comIcone('fechar', 'Não foi dessa vez! Tente novamente.')),
          E('p', {}, 'Dica: releia a ficha do grafite. Você não perde XP nem latas.')
        ));
        const tentar = Interface.botao('Tentar novamente', () => mostrarPergunta(), { tipo: 'principal', icone: 'refazer' });
        rodape.replaceChildren(Interface.botao('Voltar à ficha', () => janela.fechar(), { icone: 'voltar' }), tentar);
        tentar.focus();
      }
    };

    const janela = Interface.abrirPainel({
      titulo: 'Quiz · ' + (op.grafite ? op.grafite.titulo : ''),
      classe: 'painel-quiz',
      conteudo: [area],
      rodape: [rodape],
      aoFechar: op.aoFechar
    });
    if (!fila.length) {   // segurança: nada a responder
      if (!jaConcluido) Progresso.concluirQuiz(q.id);
      area.replaceChildren(E('p', {}, 'Todas as perguntas já foram respondidas.'));
    } else mostrarPergunta();
    return janela;
  }
};
