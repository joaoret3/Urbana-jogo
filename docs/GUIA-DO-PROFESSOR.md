# Urbana — guia do professor

## Instalação (uma vez por computador)

1. Copie a pasta do Urbana inteira para o computador (pendrive, rede da escola etc.).
   Nos computadores dos alunos use a pasta **Urbana_…_alunos** (só o jogo, mais leve);
   no seu, a pasta **Urbana_…_professor** (com o Editor de conteúdo e os originais).
2. Dê **dois cliques em `index.html`**. O jogo abre no navegador, sem internet e sem instalar nada.
3. Use **Google Chrome** ou **Microsoft Edge** atualizados.

> Computador lento? Existe um modo mais rápido, opcional: dois cliques em
> **`Abrir Urbana (Windows).bat`** (precisa do Python instalado). As partidas salvas num modo
> não aparecem no outro; para passar de um para o outro, use Exportar e Importar partida.

## Celular e tablet

Para jogar no celular ou tablet, o jogo precisa estar num endereço da web: veja
`docs/COMO-PUBLICAR-NA-WEB.md`.

## Primeiro uso em sala

- Cada aluno clica em **Novo Jogo** e digita um **apelido** (não precisa do nome completo).
- O progresso fica salvo **no navegador daquele computador**. Até 6 partidas por computador
  (o número fica em `dados/jogo.js` → `max_partidas_por_computador`).
- Na aula seguinte, o aluno usa **Continuar** e escolhe o próprio apelido.
- Se o aluno trocar de computador: no computador antigo, **Continuar → Exportar**
  (baixa um arquivo `.json`); no novo, **Continuar → Importar partida**.

## Configurações úteis

No menu, botão **Som** (ou **Menu → Configurações** durante o jogo):

- **Qualidade do mapa: Leve** para computadores mais fracos;
- **Movimento reduzido** para alunos que se incomodam com animações;
- **Controles grandes** para telas de toque;
- música e efeitos podem ser desligados (o jogo funciona igual sem som).

## O que o aluno faz no jogo

1. Anda pelo bairro a partir da escola (teclado, joystick ou clique).
2. Encontra os **pins** dos grafites reais, lê a ficha e responde ao **quiz**.
3. Ganha **XP** (sobe de nível) e **latas de spray** (moeda do jogo, sem dinheiro real).
4. Desbloqueia artes da turma no **Black Book** e pinta os **muros livres**.
5. Acompanha as **missões** (aba Missões no canto superior direito, ou tecla M) e o **perfil** (tecla P).
6. Se orienta pelo **mini-mapa** (canto superior esquerdo): clique nele ou aperte N para ampliar.

As pinturas nos muros virtuais ficam só na partida de cada aluno (o jogo é offline).
Para todos verem uma mesma pintura, ela precisa entrar numa nova versão do conteúdo.

## Atualizar o conteúdo

Use o **Editor de conteúdo**: dois cliques em `editor.html`, na pasta do professor (o menu dos alunos não mostra o link do editor).
Depois de editar, para atualizar a pasta dos alunos copie por cima as pastas `dados/` e `assets/`.
Veja `docs/GUIA-DE-CONTEUDO.md`. Antes de usar em sala, confira a aba **Conferência** do editor:
ela aponta erros de cadastro. O jogo dos alunos não mostra a conferência.
As partidas dos alunos continuam valendo depois de uma atualização de conteúdo.

## Problemas comuns

| Problema | Solução |
|---|---|
| Tela preta com aviso do Phaser | Falta `lib/phaser.min.js`: copie a pasta completa de novo |
| Abriu e não aparece nada | Use Chrome ou Edge; confira se copiou a pasta inteira |
| As partidas sumiram ao trocar de versão | Na versão antiga, Exportar; na nova, Importar partida |
| Jogo lento | Configurações → Qualidade do mapa: **Leve** |
| "Partida danificada" | O jogo tenta a cópia anterior sozinho; se não der, importe um arquivo exportado |
| Limite de partidas | Em Continuar, exporte e exclua partidas antigas |
