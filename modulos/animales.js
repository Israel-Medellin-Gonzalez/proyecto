/**
 * MÓDULO: ANIMALES
 * ¿Qué animal es este?
 * El niño ve 4 opciones de emoji y debe tocar el animal correcto.
 */

const ModuloAnimales = (() => {

  const TOTAL_RONDAS = 5;

  const ANIMALES = [
    { emoji: '🐘', nombre: 'Elefante',   pista: 'Es muy grande y tiene trompa' },
    { emoji: '🦁', nombre: 'León',       pista: 'Es el rey de la selva' },
    { emoji: '🐸', nombre: 'Rana',       pista: 'Salta y vive cerca del agua' },
    { emoji: '🐧', nombre: 'Pingüino',   pista: 'Vive en el hielo y no vuela' },
    { emoji: '🦋', nombre: 'Mariposa',   pista: 'Tiene alas de colores y vuela' },
    { emoji: '🐬', nombre: 'Delfín',     pista: 'Nada muy rápido en el mar' },
    { emoji: '🦒', nombre: 'Jirafa',     pista: 'Tiene el cuello muy largo' },
    { emoji: '🐼', nombre: 'Panda',      pista: 'Es blanco y negro y come bambú' },
    { emoji: '🐢', nombre: 'Tortuga',    pista: 'Camina lento y lleva su casa' },
    { emoji: '🦊', nombre: 'Zorro',      pista: 'Es anaranjado y muy listo' },
    { emoji: '🐨', nombre: 'Koala',      pista: 'Duerme en los árboles de Australia' },
    { emoji: '🦓', nombre: 'Cebra',      pista: 'Tiene rayas negras y blancas' },
    { emoji: '🐙', nombre: 'Pulpo',      pista: 'Tiene ocho brazos y vive en el mar' },
    { emoji: '🦜', nombre: 'Loro',       pista: 'Es colorido y puede hablar' },
    { emoji: '🐺', nombre: 'Lobo',       pista: 'Aúlla a la luna y vive en manada' },
    { emoji: '🐊', nombre: 'Cocodrilo',  pista: 'Tiene muchos dientes y vive en el río' },
  ];

  let roundActual    = 0;
  let correcto       = null;
  let opciones       = [];
  let respondido     = false;
  let rondaSeleccionadas = [];

  function init() {
    const screen = document.getElementById('screen-animales');
    if (!screen) return;

    roundActual = 0;
    rondaSeleccionadas = seleccionarRondas();

    screen.innerHTML = `
      <div class="animales-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="animales-content">

        <div class="animales-instruccion">
          <h2>¿Qué animal es este?</h2>
          <p>Toca el animal correcto 👆</p>
        </div>

        <div class="animales-emoji-grande" id="animales-emoji-grande"></div>
        <div class="animales-pista" id="animales-pista"></div>
        <div class="animales-opciones" id="animales-opciones"></div>

      </div>

      <div class="animales-footer">
        <div class="animales-progreso-label">
          <span>Progreso</span>
          <span id="animales-round-label">0 / ${TOTAL_RONDAS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="animales-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    iniciarRonda();
    App.hablarVoz('¿Qué animal es este? Toca el correcto');
  }

  function seleccionarRondas() {
    const mezclados = [...ANIMALES].sort(() => Math.random() - 0.5);
    return mezclados.slice(0, TOTAL_RONDAS);
  }

  function iniciarRonda() {
    if (roundActual >= TOTAL_RONDAS) {
      finalizarModulo();
      return;
    }

    respondido = false;
    correcto   = rondaSeleccionadas[roundActual];

    // 3 distractores que no sean el correcto
    const distractores = ANIMALES
      .filter(a => a.nombre !== correcto.nombre)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    opciones = [...distractores, correcto].sort(() => Math.random() - 0.5);

    renderRonda();
    App.hablarVoz(correcto.pista);
  }

  function renderRonda() {
    // Emoji grande
    const grande = document.getElementById('animales-emoji-grande');
    grande.textContent = correcto.emoji;
    grande.classList.remove('acierto-anim', 'error-anim');

    // Pista
    const pista = document.getElementById('animales-pista');
    pista.textContent = correcto.pista;

    // Opciones (SOLO TEXTO, sin emoji, para que no se pueda adivinar por la forma)
    const wrap = document.getElementById('animales-opciones');
    wrap.innerHTML = '';

    opciones.forEach(animal => {
      const btn = document.createElement('button');
      btn.className = 'animales-opcion';
      btn.innerHTML = `<span class="opcion-nombre">${animal.nombre}</span>`;
      btn.addEventListener('click', () => elegir(animal, btn));

      // Mantener presionado el botón repite el nombre en voz alta
      btn.addEventListener('mousedown', () => App.hablarVoz(animal.nombre));

      wrap.appendChild(btn);
    });

    actualizarProgreso();
    leerOpciones();
  }

  // Lee en voz alta el nombre de cada opción disponible, para que el niño
  // pueda relacionar el animal grande con su nombre sin depender de leer
  function leerOpciones() {
    const nombres = opciones.map(a => a.nombre).join(', ');
    setTimeout(() => {
      App.hablarVoz(`Las opciones son: ${nombres}`);
    }, 1800);
  }

  function elegir(animal, btnEl) {
    if (respondido) return;
    respondido = true;

    const grande = document.getElementById('animales-emoji-grande');

    if (animal.nombre === correcto.nombre) {
      btnEl.classList.add('opcion-correcta');
      grande.classList.add('acierto-anim');
      App.sumarPuntos(2);
      App.hablarVoz(`¡Correcto! Es un ${correcto.nombre}`);
      setTimeout(() => siguienteRonda(), 1200);
    } else {
      btnEl.classList.add('opcion-incorrecta');
      grande.classList.add('error-anim');

      // Resaltar la correcta
      document.querySelectorAll('.animales-opcion').forEach(b => {
        const nombre = b.querySelector('.opcion-nombre').textContent;
        if (nombre === correcto.nombre) b.classList.add('opcion-correcta');
      });

      App.hablarVoz(`Es un ${correcto.nombre}, ¡inténtalo de nuevo!`);
      setTimeout(() => siguienteRonda(), 1600);
    }
  }

  function siguienteRonda() {
    roundActual++;
    const label = document.getElementById('animales-round-label');
    if (label) label.textContent = `${roundActual} / ${TOTAL_RONDAS}`;
    iniciarRonda();
  }

  function actualizarProgreso() {
    const pct = (roundActual / TOTAL_RONDAS) * 100;
    const bar = document.getElementById('animales-progreso');
    if (bar) bar.style.width = `${pct}%`;
  }

  function finalizarModulo() {
    App.marcarTareaCompletada('animales');
    App.sumarPuntos(3);
    App.hablarVoz('¡Muy bien! Conoces todos los animales');
    setTimeout(() => App.navigate('home'), 1200);
  }

  return { init };

})();