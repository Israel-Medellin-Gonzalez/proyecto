/**
 * MÓDULO: VOCALES
 * 30 segundos, el niño toca TODAS las vocales correctas que aparecen.
 * No pasa a siguiente vocal — acumula puntos por cada burbuja tocada.
 * La vocal objetivo cambia sola cada 8 segundos.
 * Burbujas suben de abajo hacia arriba completamente.
 */

const ModuloVocales = (() => {

  const VOCALES      = ['A', 'E', 'I', 'O', 'U'];
  const DURACION_TOTAL = 30;   // segundos totales del minijuego
  const CAMBIO_VOCAL   = 8;    // cada cuántos segundos cambia la vocal objetivo
  const TOTAL_RONDAS   = 3;    // cuántas rondas de 30s

  const COLORES = { A:'burbuja-a', E:'burbuja-e', I:'burbuja-i', O:'burbuja-o', U:'burbuja-u' };

  let activo         = false;
  let timerInterval  = null;
  let burbujasInterval = null;
  let cambioInterval = null;
  let tiempoRestante = DURACION_TOTAL;
  let vocalObjetivo  = '';
  let aciertos       = 0;   // aciertos en la ronda actual
  let rondaActual    = 0;

  // ──────────────────────────────────────────────────
  function init() {
    const screen = document.getElementById('screen-vocales');
    if (!screen) return;

    activo = true; rondaActual = 0; aciertos = 0;

    screen.innerHTML = `
      <div class="vocales-header">
        <button class="nav-back" onclick="ModuloVocales.limpiarVocales(); App.navigate('home')">← Inicio</button>

        <!-- Vocal objetivo: siempre visible, grande, en el centro del header -->
        <div class="vocal-objetivo-header">
          <div class="vocal-objetivo__texto">Toca la vocal:</div>
          <div class="vocal-objetivo__vocal" id="vocal-display">...</div>
        </div>

        <!-- Timer -->
        <div class="vocales-timer" id="vocales-timer">
          ⏱️ <span id="tiempo-display">${DURACION_TOTAL}</span>s
        </div>
      </div>

      <!-- Área de burbujas: ocupa todo el espacio entre header y footer -->
      <div class="vocales-content" id="vocales-area"></div>

      <div class="vocales-footer">
        <div class="vocales-progreso-label">
          <span>Aciertos: <strong id="aciertos-display">0</strong></span>
          <span>Ronda <span id="ronda-display">1</span> de ${TOTAL_RONDAS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="vocales-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    App.hablarVoz('¡Vamos a jugar! Toca todas las burbujas con la vocal que te indico. ¡Toca cuantas puedas!');
    setTimeout(() => iniciarRonda(), 1300);
  }

  // ──────────────────────────────────────────────────
  function limpiarVocales() {
    activo = false;
    clearInterval(timerInterval);
    clearInterval(burbujasInterval);
    clearInterval(cambioInterval);
    App.cancelarVoz();
    const area = document.getElementById('vocales-area');
    if (area) area.innerHTML = '';
  }

  // ──────────────────────────────────────────────────
  function iniciarRonda() {
    if (!activo) return;
    if (rondaActual >= TOTAL_RONDAS) { finalizarModulo(); return; }
    rondaActual++;
    aciertos = 0;
    tiempoRestante = DURACION_TOTAL;

    // Limpiar burbujas anteriores
    const area = document.getElementById('vocales-area');
    if (area) area.innerHTML = '';

    // Elegir primera vocal
    elegirNuevaVocal();

    // Actualizar label de ronda
    const rd = document.getElementById('ronda-display');
    if (rd) rd.textContent = rondaActual;

    // Progreso de rondas en la barra
    _actualizarBarra();

    // Timer de cuenta regresiva
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!activo) { clearInterval(timerInterval); return; }
      tiempoRestante--;
      _actualizarTimer();

      if (tiempoRestante === 20) App.hablarVoz(`Busca la ${vocalObjetivo}`, true);
      if (tiempoRestante === 10) App.hablarVoz('¡Diez segundos! ¡Rápido!', true);
      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        clearInterval(burbujasInterval);
        clearInterval(cambioInterval);
        finalizarRonda();
      }
    }, 1000);

    // Cambiar vocal cada CAMBIO_VOCAL segundos
    clearInterval(cambioInterval);
    cambioInterval = setInterval(() => {
      if (!activo) return;
      elegirNuevaVocal();
    }, CAMBIO_VOCAL * 1000);

    // Crear burbujas periódicamente
    clearInterval(burbujasInterval);
    _crearBurbuja(); // primera inmediata
    burbujasInterval = setInterval(() => {
      if (!activo) return;
      _crearBurbuja();
    }, 700);
  }

  // ──────────────────────────────────────────────────
  function elegirNuevaVocal() {
    let nueva;
    do { nueva = VOCALES[Math.floor(Math.random() * VOCALES.length)]; }
    while (nueva === vocalObjetivo && VOCALES.length > 1);
    vocalObjetivo = nueva;

    const display = document.getElementById('vocal-display');
    if (!display) return;
    display.style.animation = 'none';
    void display.offsetWidth;
    display.style.animation = '';
    display.textContent = vocalObjetivo;

    // Anunciar nueva vocal
    App.hablarVoz(`Ahora busca la ${vocalObjetivo}`);
  }

  // ──────────────────────────────────────────────────
  function _crearBurbuja() {
    const area = document.getElementById('vocales-area');
    if (!area || !activo) return;

    // 45% probabilidad de que sea la vocal correcta
    const esCorrecta = Math.random() < 0.45;
    const vocal = esCorrecta
      ? vocalObjetivo
      : VOCALES.filter(v => v !== vocalObjetivo)[Math.floor(Math.random() * 4)];

    const burbuja = document.createElement('div');
    burbuja.className = `burbuja-vocal ${COLORES[vocal]}`;

    // Tamaño
    const size = 72 + Math.random() * 38;
    burbuja.style.width    = `${size}px`;
    burbuja.style.height   = `${size}px`;
    burbuja.style.fontSize = `${Math.round(size * 0.42)}px`;

    // Posición X dentro del área
    const areaW = area.offsetWidth || window.innerWidth;
    const maxX  = Math.max(areaW - size - 8, 8);
    burbuja.style.left = `${8 + Math.random() * maxX}px`;

    // Empieza abajo
    burbuja.style.bottom = `-${size + 10}px`;

    // Distancia de subida: toda la altura del área + margen extra
    const areaH  = area.offsetHeight || (window.innerHeight * 0.62);
    const subida = areaH + size + 20;
    burbuja.style.setProperty('--subida', `-${subida}px`);

    // Duración: sube más despacio para que el niño pueda tocarla
    const dur = 5.5 + Math.random() * 4;
    burbuja.style.animationDuration       = `${dur}s`;
    burbuja.style.animationTimingFunction = 'linear';

    burbuja.textContent = vocal;

    // Click / touch
    const onTap = (e) => {
      e.preventDefault();
      if (!activo || burbuja.dataset.p) return;
      burbuja.dataset.p = '1';

      if (vocal === vocalObjetivo) {
        burbuja.classList.add('correcta-hit');
        aciertos++;
        App.sumarPuntos(2);
        _actualizarAciertos();
        // Ema felicita rápido
        App.hablarVoz('¡Bien!', true);
      } else {
        burbuja.classList.add('incorrecta-hit');
        burbuja.dataset.p = ''; // permite intentar de nuevo si la animación no la eliminó
        App.hablarVoz(`Esa no. Busca la ${vocalObjetivo}`, true);
      }
    };

    burbuja.addEventListener('click', onTap);
    burbuja.addEventListener('touchstart', onTap, { passive: false });

    area.appendChild(burbuja);

    burbuja.addEventListener('animationend', () => burbuja.remove());
  }

  // ──────────────────────────────────────────────────
  function finalizarRonda() {
    if (!activo) return;
    App.sumarPuntos(aciertos >= 5 ? 15 : aciertos >= 2 ? 8 : 3);

    const area = document.getElementById('vocales-area');
    if (area) area.innerHTML = '';

    if (rondaActual < TOTAL_RONDAS) {
      App.hablarVoz(`¡Ronda terminada! Tuviste ${aciertos} aciertos. ¡Vamos por la siguiente!`);
      setTimeout(() => iniciarRonda(), 2200);
    } else {
      finalizarModulo();
    }
  }

  function finalizarModulo() {
    limpiarVocales();
    App.marcarTareaCompletada('vocales'); // lanza confeti automático
    App.sumarPuntos(25);
    App.hablarVoz('¡Felicidades! Terminaste las vocales. ¡Eres increíble!');
    App.mostrarFeedback({
      emoji:     '🎉',
      titulo:    '¡Vocales completadas!',
      subtitulo: `¡Lo hiciste genial!`,
      onContinuar: () => App.navigate('home'),
    });
  }

  // ──────────────────────────────────────────────────
  function _actualizarTimer() {
    const el      = document.getElementById('tiempo-display');
    const timerEl = document.getElementById('vocales-timer');
    if (!el || !timerEl) return;
    el.textContent = tiempoRestante;
    // Barra de tiempo: reduce de 100% a 0%
    const pct = (tiempoRestante / DURACION_TOTAL) * 100;
    const bar = document.getElementById('vocales-progreso');
    if (bar) bar.style.width = `${pct}%`;
    timerEl.classList.toggle('urgente', tiempoRestante <= 8);
  }

  function _actualizarAciertos() {
    const el = document.getElementById('aciertos-display');
    if (el) el.textContent = aciertos;
  }

  function _actualizarBarra() {
    // barra muestra progreso de rondas completadas
    const pct = ((rondaActual - 1) / TOTAL_RONDAS) * 100;
    const bar = document.getElementById('vocales-progreso');
    if (bar) bar.style.width = `${pct}%`;
  }

  return { init, limpiarVocales };

})();
