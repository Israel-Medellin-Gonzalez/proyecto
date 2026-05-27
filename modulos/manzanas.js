/**
 * MÓDULO: CUENTA FRUTAS (MANZANAS)
 * El niño cuenta y busca la fruta correcta entre otras
 */

const ModuloManzanas = (() => {

  const TOTAL_ROUNDS = 4;

  // Frutas disponibles
  const FRUTAS = [
    { emoji: '🍎', nombre: 'manzanas' },
    { emoji: '🍊', nombre: 'naranjas' },
    { emoji: '🍌', nombre: 'bananas' },
    { emoji: '🍇', nombre: 'uvas' },
    { emoji: '🍓', nombre: 'fresas' },
    { emoji: '🍋', nombre: 'limones' },
    { emoji: '🍑', nombre: 'duraznos' },
    { emoji: '🍉', nombre: 'sandías' },
  ];

  // Estado
  let roundActual = 0;
  let frutaObjetivo = null;
  let cantidadObjetivo = 0;
  let contadorActual = 0;
  let frutas = []; // array de { emoji, nombre, esObjetivo }

  function init() {
    const screen = document.getElementById('screen-manzanas');
    if (!screen) return;

    roundActual = 0;
    contadorActual = 0;

    screen.innerHTML = `
      <div class="manzanas-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="manzanas-content">

        <div class="manzanas-instruccion">
          <h2>Cuenta las frutas </h2>
          <div class="manzanas-buscar">
            <span>Busca:</span>
            <span class="manzanas-numero" id="cantidad-display">?</span>
            <span class="manzanas-fruta-nombre" id="fruta-nombre-display">?</span>
          </div>
        </div>

        <!-- Numeración de ayuda del 1 al 10 -->
        <div class="manzanas-ayuda-num" id="num-ayuda">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `<div class="num-ayuda" data-num="${n}">${n}</div>`).join('')}
        </div>

        <!-- Área de juego con frutas -->
        <div class="manzanas-area" id="frutas-area"></div>

        <!-- Fruta objetivo abajo -->
        <div class="manzanas-fruta-info">
          <span class="manzanas-fruta-emoji" id="fruta-emoji-display">?</span>
          <span class="manzanas-fruta-label" id="fruta-label-display">Cargando...</span>
        </div>

        <!-- Contador -->
        <div class="manzanas-contador-wrap">
          <button class="btn-contar" id="btn-contar" title="Contar de uno en uno styl" style="display:none;">
            +1
          </button>
          <div class="manzanas-contador">
            <span id="contador-display">0</span>
            <span> / <span id="objetivo-display">?</span></span>
          </div>
          <button class="btn-contar" id="btn-restar" style="display:none;">-1</button>
        </div>

        <div class="manzanas-verificar-wrap">
          <button class="btn btn-primary btn-lg" id="btn-verificar">
            ✅ Verificar
          </button>
        </div>

      </div>

      <div class="manzanas-footer">
        <div class="manzanas-progreso-label">
          <span>Progreso</span>
          <span id="manzanas-round-label">0 / ${TOTAL_ROUNDS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="manzanas-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    document.getElementById('btn-contar').addEventListener('click', () => cambiarContador(1));
    document.getElementById('btn-restar').addEventListener('click', () => cambiarContador(-1));
    document.getElementById('btn-verificar').addEventListener('click', verificar);

    iniciarRound();
    App.hablarVoz('¡Cuenta las frutas y dime cuántas hay! 🍎');
  }

  function iniciarRound() {
    if (roundActual >= TOTAL_ROUNDS) {
      finalizarModulo();
      return;
    }

    contadorActual = 0;

    // Elegir fruta objetivo
    frutaObjetivo = FRUTAS[Math.floor(Math.random() * FRUTAS.length)];

    // Cantidad entre 2 y 8
    cantidadObjetivo = 2 + Math.floor(Math.random() * 7);

    // Elegir 2-3 frutas distractoras
    const distractoras = FRUTAS
      .filter(f => f.emoji !== frutaObjetivo.emoji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));

    // Construir array de frutas para el área
    frutas = [];

    // Agregar objetivo
    for (let i = 0; i < cantidadObjetivo; i++) {
      frutas.push({ ...frutaObjetivo, esObjetivo: true });
    }

    // Agregar distractoras (1-4 de cada una)
    distractoras.forEach(d => {
      const cant = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < cant; i++) {
        frutas.push({ ...d, esObjetivo: false });
      }
    });

    // Mezclar
    frutas = frutas.sort(() => Math.random() - 0.5);

    // Actualizar UI
    document.getElementById('cantidad-display').textContent = cantidadObjetivo;
    document.getElementById('fruta-nombre-display').textContent = frutaObjetivo.nombre;
    document.getElementById('fruta-emoji-display').textContent = frutaObjetivo.emoji;
    document.getElementById('fruta-label-display').textContent = `${frutaObjetivo.nombre} (tócalas para contarlas)`;
    document.getElementById('objetivo-display').textContent = cantidadObjetivo;
    document.getElementById('contador-display').textContent = '0';

    // Resetear numeración de ayuda
    document.querySelectorAll('.num-ayuda').forEach(el => el.classList.remove('activo'));

    // Renderizar frutas en el área
    renderFrutas();

    App.hablarVoz(`Busca ${cantidadObjetivo} ${frutaObjetivo.nombre} entre las demás frutas`);
  }

  function renderFrutas() {
    const area = document.getElementById('frutas-area');
    area.innerHTML = '';

    frutas.forEach((fruta, i) => {
      const item = document.createElement('div');
      item.className = 'fruta-item';
      item.dataset.index = i;
      item.dataset.esObjetivo = fruta.esObjetivo;
      item.textContent = fruta.emoji;
      item.title = fruta.nombre;

      item.addEventListener('click', () => clickFruta(item, fruta));
      area.appendChild(item);
    });
  }

  function clickFruta(item, fruta) {
    if (item.classList.contains('seleccionada')) {
      item.classList.remove('seleccionada');
      if (fruta.esObjetivo) {
        cambiarContador(-1);
      }
      return;
    }

    item.classList.add('seleccionada');
    if (fruta.esObjetivo) {
      cambiarContador(1);
    } else {
      // Pequeño feedback visual de error
      item.style.filter = 'grayscale(1)';
      setTimeout(() => { item.style.filter = ''; item.classList.remove('seleccionada'); }, 600);
      App.hablarVoz(`¡Esa no es! Busca las ${frutaObjetivo.nombre} 🔍`);
    }
  }

  function cambiarContador(delta) {
    contadorActual = Math.max(0, Math.min(contadorActual + delta, 20));
    document.getElementById('contador-display').textContent = contadorActual;

    // Resaltar número de ayuda
    document.querySelectorAll('.num-ayuda').forEach(el => {
      el.classList.toggle('activo', parseInt(el.dataset.num) === contadorActual);
    });
  }

  function verificar() {
    if (contadorActual === cantidadObjetivo) {
      roundActual++;
      actualizarProgreso();
      App.sumarPuntos(10);

      App.mostrarFeedback({
        emoji: frutaObjetivo.emoji,
        titulo: `¡${cantidadObjetivo} ${frutaObjetivo.nombre}!`,
        subtitulo: '¡Contaste perfectamente! 🎉',
        autoCerrar: 1500,
        onContinuar: () => {
          if (roundActual < TOTAL_ROUNDS) {
            iniciarRound();
          } else {
            finalizarModulo();
          }
        },
      });
    } else {
      App.hablarVoz(`Hay ${cantidadObjetivo} ${frutaObjetivo.nombre} ¡sigue contando! 🔢`);

      const contador = document.getElementById('contador-display');
      contador.classList.add('anim-shake');
      setTimeout(() => contador.classList.remove('anim-shake'), 500);
    }
  }

  function actualizarProgreso() {
    const pct = (roundActual / TOTAL_ROUNDS) * 100;
    const bar = document.getElementById('manzanas-progreso');
    const label = document.getElementById('manzanas-round-label');
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${roundActual} / ${TOTAL_ROUNDS}`;
  }

  function finalizarModulo() {
    App.marcarTareaCompletada('manzanas');
    App.sumarPuntos(20);

    App.mostrarFeedback({
      emoji: '🏆',
      titulo: '¡Campeón contando!',
      subtitulo: 'Sabes contar frutas muy bien',
      onContinuar: () => App.navigate('home'),
    });
  }

  return { init };

})();
