/**
 * MÓDULO: MEMORIA
 * Encuentra las parejas iguales.
 * Se muestran tarjetas volteadas, el niño toca dos y si coinciden se quedan descubiertas.
 */

const ModuloMemoria = (() => {

  const TOTAL_RONDAS = 3;

  const SETS = [
    {
      nombre: 'Animales',
      pares: ['🐘', '🦁', '🐸', '🐧', '🦋', '🐬'],
    },
    {
      nombre: 'Frutas',
      pares: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊'],
    },
    {
      nombre: 'Cosas',
      pares: ['⭐', '🌙', '☀️', '🌈', '🔥', '❄️'],
    },
  ];

  let roundActual   = 0;
  let tablero       = [];
  let volteasActual = [];
  let bloqueado     = false;
  let paresEncontrados = 0;

  function init() {
    const screen = document.getElementById('screen-memoria');
    if (!screen) return;

    roundActual = 0;

    screen.innerHTML = `
      <div class="memoria-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="memoria-content">

        <div class="memoria-instruccion">
          <h2>¡Encuentra las parejas!</h2>
          <p>Toca dos tarjetas iguales 👆</p>
        </div>

        <div class="memoria-tablero" id="memoria-tablero"></div>

      </div>

      <div class="memoria-footer">
        <div class="memoria-progreso-label">
          <span>Progreso</span>
          <span id="memoria-round-label">0 / ${TOTAL_RONDAS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="memoria-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    iniciarRonda();
    App.hablarVoz('Encuentra las parejas iguales. Toca dos tarjetas');
  }

  function iniciarRonda() {
    if (roundActual >= TOTAL_RONDAS) {
      finalizarModulo();
      return;
    }

    volteasActual    = [];
    bloqueado        = false;
    paresEncontrados = 0;

    const set = SETS[roundActual % SETS.length];

    // Duplicar y mezclar
    tablero = [...set.pares, ...set.pares]
      .map((emoji, i) => ({ id: i, emoji, volteada: false, encontrada: false }))
      .sort(() => Math.random() - 0.5);

    actualizarProgreso();
    renderTablero();

    App.hablarVoz(`Ronda de ${set.nombre}. Encuentra las parejas`);
  }

  function renderTablero() {
    const wrap = document.getElementById('memoria-tablero');
    wrap.innerHTML = '';

    tablero.forEach((carta, i) => {
      const el = document.createElement('div');
      el.className = 'memoria-carta';
      el.dataset.index = i;

      if (carta.encontrada) {
        el.classList.add('encontrada');
        el.textContent = carta.emoji;
      } else if (carta.volteada) {
        el.classList.add('volteada');
        el.textContent = carta.emoji;
      } else {
        el.textContent = '❓';
        el.addEventListener('click', () => voltear(i));
      }

      wrap.appendChild(el);
    });
  }

  function voltear(index) {
    if (bloqueado) return;
    const carta = tablero[index];
    if (carta.volteada || carta.encontrada) return;
    if (volteasActual.length >= 2) return;

    carta.volteada = true;
    volteasActual.push(index);
    renderTablero();

    if (volteasActual.length === 2) {
      bloqueado = true;
      setTimeout(() => verificarPar(), 700);
    }
  }

  function verificarPar() {
    const [i1, i2] = volteasActual;
    const c1 = tablero[i1];
    const c2 = tablero[i2];

    if (c1.emoji === c2.emoji) {
      c1.encontrada = true;
      c2.encontrada = true;
      paresEncontrados++;
      App.sumarPuntos(2);
      App.hablarVoz('¡Muy bien! Encontraste una pareja');

      volteasActual = [];
      bloqueado     = false;
      renderTablero();

      if (paresEncontrados >= SETS[roundActual % SETS.length].pares.length) {
        setTimeout(() => completarRonda(), 500);
      }
    } else {
      App.hablarVoz('Intenta otra vez');
      setTimeout(() => {
        c1.volteada = false;
        c2.volteada = false;
        volteasActual = [];
        bloqueado     = false;
        renderTablero();
      }, 600);
    }
  }

  function completarRonda() {
    roundActual++;
    App.sumarPuntos(2);

    const label = document.getElementById('memoria-round-label');
    if (label) label.textContent = `${roundActual} / ${TOTAL_RONDAS}`;

    actualizarProgreso();

    setTimeout(() => iniciarRonda(), 400);
  }

  function actualizarProgreso() {
    const pct = (roundActual / TOTAL_RONDAS) * 100;
    const bar = document.getElementById('memoria-progreso');
    if (bar) bar.style.width = `${pct}%`;
  }

  function finalizarModulo() {
    App.marcarTareaCompletada('memoria');
    App.sumarPuntos(3);
    App.hablarVoz('¡Excelente memoria! Terminaste');
    setTimeout(() => App.navigate('home'), 1200);
  }

  return { init };

})();