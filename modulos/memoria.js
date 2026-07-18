/**
 * MÓDULO: MEMORIA
 * Encuentra las parejas iguales.
 * MEJORADO: Primero muestra todas las parejas 3 segundos, luego las voltea
 */

const ModuloMemoria = (() => {

  const TOTAL_RONDAS = 3;
  const TIEMPO_PREVIEW = 3000; // 3 segundos para memorizar

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
  let enModoPreview = false; // Flag para saber si estamos en fase preview

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
          <p id="memoria-mensaje">Memoriza dónde están las parejas... 👀</p>
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
    App.hablarVoz('Memoriza dónde están las parejas');
  }

  function iniciarRonda() {
    if (roundActual >= TOTAL_RONDAS) {
      finalizarModulo();
      return;
    }

    volteasActual    = [];
    bloqueado        = true; // Bloqueado al inicio
    paresEncontrados = 0;
    enModoPreview    = true; // Estamos en modo preview

    const set = SETS[roundActual % SETS.length];

    // Duplicar y mezclar
    tablero = [...set.pares, ...set.pares]
      .map((emoji, i) => ({ id: i, emoji, volteada: false, encontrada: false }))
      .sort(() => Math.random() - 0.5);

    actualizarProgreso();
    
    // MOSTRAR TODAS LAS PAREJAS (descubiertas)
    renderTableroPreview();
    
    const msg = document.getElementById('memoria-mensaje');
    if (msg) {
      msg.textContent = `Ronda de ${set.nombre} - Memoriza los emojis... ⏱️`;
    }

    App.hablarVoz(`Ronda de ${set.nombre}. Memoriza dónde están los ${set.nombre}`);

    // DESPUÉS DE 3 SEGUNDOS: VOLTEAR LAS CARTAS Y PERMITIR JUGAR
    setTimeout(() => {
      enModoPreview = false;
      bloqueado = false;
      renderTablero();
      
      if (msg) {
        msg.textContent = 'Toca dos tarjetas iguales 👆';
      }

      App.hablarVoz('Ahora encuentra las parejas. Toca dos tarjetas iguales');
    }, TIEMPO_PREVIEW);
  }

  // RENDERIZAR EN MODO PREVIEW (MOSTRAR TODAS LAS PAREJAS)
  function renderTableroPreview() {
    const wrap = document.getElementById('memoria-tablero');
    if (!wrap) return;
    
    wrap.innerHTML = '';

    tablero.forEach((carta, i) => {
      const el = document.createElement('div');
      el.className = 'memoria-carta memoria-carta-preview';
      el.dataset.index = i;

      // En modo preview: mostrar TODOS los emojis
      el.textContent = carta.emoji;
      el.style.pointerEvents = 'none'; // No permite clicks durante preview

      wrap.appendChild(el);
    });
  }

  // RENDERIZAR EN MODO JUEGO (CARTAS VOLTEADAS O ENCONTRADAS)
  function renderTablero() {
    const wrap = document.getElementById('memoria-tablero');
    if (!wrap) return;
    
    wrap.innerHTML = '';

    tablero.forEach((carta, i) => {
      const el = document.createElement('div');
      el.className = 'memoria-carta';
      el.dataset.index = i;

      if (carta.encontrada) {
        // Carta encontrada: mostrar emoji con fondo verde
        el.classList.add('encontrada');
        el.textContent = carta.emoji;
        el.style.pointerEvents = 'none';
      } else if (carta.volteada) {
        // Carta volteada (pero no encontrada): mostrar emoji con fondo blanco
        el.classList.add('volteada');
        el.textContent = carta.emoji;
        el.style.pointerEvents = 'none';
      } else {
        // Carta sin voltear: mostrar ? con fondo turquesa
        el.classList.add('no-volteada');
        el.textContent = '?';
        el.addEventListener('click', () => voltear(i));
      }

      wrap.appendChild(el);
    });
  }

  function voltear(index) {
    if (bloqueado) return;
    if (enModoPreview) return; // No permitir clicks en preview
    
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