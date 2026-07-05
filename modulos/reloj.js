/**
 * MÓDULO: RELOJ MÁGICO
 * El niño mueve las manecillas para poner la hora indicada.
 * Controles separados para manecilla corta (horas) y larga (minutos).
 * Narración de voz al mover cada manecilla.
 */

const ModuloReloj = (() => {

  const TOTAL_ROUNDS = 5;
  const HORAS_POSIBLES = [
    '1:00', '2:00', '3:00', '4:00', '5:00',
    '6:00', '7:00', '8:00', '9:00', '10:00',
    '11:00', '12:00', '6:30', '3:30', '9:30',
  ];

  let roundActual = 0;
  let horaObjetivo = { h: 0, m: 0 };
  let horaActual = { h: 12, m: 0 };

  // ─── Narración de voz ────────────────────────────────────────────────────
  function hablar(texto) {
    App.hablarVoz ? App.hablarVoz(texto) : null;
  }

  /**
   * Convierte la hora actual a una frase legible en español.
   * Ej: 3:30 → "las 3 y media"
   */
  function horaTexto(h, m) {
    const hora = h % 12 === 0 ? 12 : h % 12;
    if (m === 0)  return `las ${hora} en punto`;
    if (m === 30) return `las ${hora} y media`;
    return `las ${hora} y ${m} minutos`;
  }

  // ─── Instrucción detallada de cada ronda ─────────────────────────────────
  function instruccionRound(h, m) {
    const hora = h % 12 === 0 ? 12 : h % 12;
    const numMin = m === 0 ? 12 : m / 5; // posición del número en el reloj
    const mTexto = m === 0
      ? 'en el 12'
      : m === 30 ? 'en el 6'
      : `en el ${numMin}`;
    const mFrase = m === 0 ? 'en punto' : m === 30 ? 'y media' : `y ${m} minutos`;
    return (
      `Pon la manecilla corta en el ${hora} y la larga ${mTexto}. ` +
      `La hora es las ${hora} ${mFrase}.`
    );
  }

  // ─── Renderizado ─────────────────────────────────────────────────────────
  function init() {
    const screen = document.getElementById('screen-reloj');
    if (!screen) return;

    roundActual = 0;
    horaActual = { h: 12, m: 0 };

    screen.innerHTML = `
      <div class="reloj-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="reloj-content">

        <div class="reloj-instruccion">
          <h2>Pon el reloj en esta hora:</h2>
          <p class="reloj-pista">
            La manecilla <strong>corta</strong> marca las horas ·
            La <strong>larga</strong> marca los minutos
          </p>
          <div class="reloj-hora-objetivo" id="hora-objetivo-display">?:??</div>
        </div>

        <div class="reloj-wrap">
          <svg class="reloj-svg" viewBox="0 0 260 260" id="reloj-svg">
            <!-- Cara del reloj -->
            <circle cx="130" cy="130" r="120" fill="#FFFEF5" stroke="#E8D8A0" stroke-width="6"/>
            <circle cx="130" cy="130" r="110" fill="none" stroke="#F0E8C0" stroke-width="1"/>

            <!-- Marcas de minutos -->
            ${generarMarcas()}

            <!-- Números -->
            ${generarNumeros()}

            <!-- Manecilla hora (corta) -->
            <line
              id="manecilla-hora"
              class="manecilla-hora"
              x1="130" y1="130"
              x2="130" y2="80"
              style="transform-origin: 130px 130px;"
            />

            <!-- Manecilla minuto (larga) -->
            <line
              id="manecilla-minuto"
              class="manecilla-minuto"
              x1="130" y1="130"
              x2="130" y2="55"
              style="transform-origin: 130px 130px;"
            />

            <!-- Centro -->
            <circle cx="130" cy="130" r="8" fill="#2D2D3A"/>
            <circle cx="130" cy="130" r="4" fill="white"/>
          </svg>
        </div>

        <!-- Hora actual mostrada en texto -->
        <div class="reloj-hora-actual">
          Hora actual: <span id="reloj-hora-texto">12:00</span>
        </div>

        <!--
          CONTROLES:
          Fila 1: botón "Hora atrás" | separador | botón "Hora adelante"
          Fila 2 (centrada): botón "Minuto atrás" | botón "Minuto adelante"
        -->
        <div class="reloj-controles">

          <!-- Fila manecilla CORTA (horas) -->
          <div class="reloj-fila-ctrl">
            <button class="btn-reloj btn-reloj-hora" id="btn-hora-atras">
              ◀ Hora
              <span class="btn-subtitulo">manecilla corta</span>
            </button>
            <button class="btn-reloj btn-reloj-hora" id="btn-hora-adelante">
              Hora ▶
              <span class="btn-subtitulo">manecilla corta</span>
            </button>
          </div>

          <!-- Fila manecilla LARGA (minutos) -->
          <div class="reloj-fila-ctrl">
            <button class="btn-reloj btn-reloj-minuto" id="btn-min-atras">
              ◀ Minuto
              <span class="btn-subtitulo">manecilla larga</span>
            </button>
            <button class="btn-reloj btn-reloj-minuto" id="btn-min-adelante">
              Minuto ▶
              <span class="btn-subtitulo">manecilla larga</span>
            </button>
          </div>

        </div>

        <div class="reloj-feedback" id="reloj-feedback">
          Usa los botones para mover el reloj ⏰
        </div>

        <div class="reloj-aceptar-wrap">
          <button class="btn btn-primary btn-lg" id="btn-aceptar">
            ✅ Aceptar
          </button>
        </div>

      </div>

      <div class="reloj-footer">
        <div class="reloj-progreso-label">
          <span>Progreso</span>
          <span id="reloj-round-label">0 / ${TOTAL_ROUNDS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="reloj-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-hora-atras').addEventListener('click', () => moverHora(-1));
    document.getElementById('btn-hora-adelante').addEventListener('click', () => moverHora(1));
    document.getElementById('btn-min-atras').addEventListener('click', () => moverMinuto(-5));
    document.getElementById('btn-min-adelante').addEventListener('click', () => moverMinuto(5));
    document.getElementById('btn-aceptar').addEventListener('click', verificarHora);

    iniciarRound();
  }

  // ─── Generadores SVG ─────────────────────────────────────────────────────
  function generarMarcas() {
    let svg = '';
    for (let i = 0; i < 60; i++) {
      const angulo = (i / 60) * 360 - 90;
      const rad = (angulo * Math.PI) / 180;
      const esHora = i % 5 === 0;
      const r1 = esHora ? 98 : 103;
      const r2 = 110;
      const x1 = 130 + r1 * Math.cos(rad);
      const y1 = 130 + r1 * Math.sin(rad);
      const x2 = 130 + r2 * Math.cos(rad);
      const y2 = 130 + r2 * Math.sin(rad);
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
        stroke="${esHora ? '#8B7840' : '#C8B870'}" stroke-width="${esHora ? 3 : 1.5}" stroke-linecap="round"/>`;
    }
    return svg;
  }

  function generarNumeros() {
    let svg = '';
    const nums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    nums.forEach((n, i) => {
      const angulo = (i / 12) * 360 - 90;
      const rad = (angulo * Math.PI) / 180;
      const r = 86;
      const x = 130 + r * Math.cos(rad);
      const y = 130 + r * Math.sin(rad);
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="reloj-numero">${n}</text>`;
    });
    return svg;
  }

  // ─── Lógica de rondas ────────────────────────────────────────────────────
  function iniciarRound() {
    if (roundActual >= TOTAL_ROUNDS) {
      finalizarModulo();
      return;
    }

    const horaStr = HORAS_POSIBLES[Math.floor(Math.random() * HORAS_POSIBLES.length)];
    const [h, m] = horaStr.split(':').map(Number);
    horaObjetivo = { h, m };

    document.getElementById('hora-objetivo-display').textContent = horaStr;

    // Posición aleatoria de inicio (distinta a la objetivo)
    horaActual = {
      h: Math.floor(Math.random() * 12),
      m: [0, 30][Math.floor(Math.random() * 2)],
    };
    actualizarReloj();
    actualizarFeedback();

    hablar(instruccionRound(h, m));
  }

  // ─── Movimiento de manecillas ─────────────────────────────────────────────

  /**
   * Mueve la manecilla CORTA (horas) en pasos de 1 hora.
   * @param {number} delta  +1 adelanta, -1 atrasa
   */
  function moverHora(delta) {
    horaActual.h = (horaActual.h + delta + 12) % 12;
    actualizarReloj();
    actualizarFeedback();
    hablar(`Ahora es ${horaTexto(horaActual.h, horaActual.m)}`);
  }

  /**
   * Mueve la manecilla LARGA (minutos) en pasos de 5 minutos.
   * Al completar una vuelta, la manecilla de hora también avanza/retrocede.
   * @param {number} delta  +5 adelanta, -5 atrasa
   */
  function moverMinuto(delta) {
    horaActual.m += delta;

    if (horaActual.m >= 60) {
      horaActual.m -= 60;
      horaActual.h = (horaActual.h + 1) % 12;
    }
    if (horaActual.m < 0) {
      horaActual.m += 60;
      horaActual.h = (horaActual.h - 1 + 12) % 12;
    }

    actualizarReloj();
    actualizarFeedback();
    hablar(`Ahora es ${horaTexto(horaActual.h, horaActual.m)}`);
  }

  // ─── Visualización ───────────────────────────────────────────────────────
  function actualizarReloj() {
    const h = horaActual.h % 12;
    const m = horaActual.m;

    const gradosMinuto = (m / 60) * 360;
    const gradosHora   = (h / 12) * 360 + (m / 60) * 30;

    const manHora = document.getElementById('manecilla-hora');
    const manMin  = document.getElementById('manecilla-minuto');

    if (manHora) manHora.style.transform = `rotate(${gradosHora}deg)`;
    if (manMin)  manMin.style.transform  = `rotate(${gradosMinuto}deg)`;

    // Etiqueta de texto
    const etiqueta = document.getElementById('reloj-hora-texto');
    if (etiqueta) {
      const hd = h === 0 ? 12 : h;
      etiqueta.textContent = `${hd}:${String(m).padStart(2, '0')}`;
    }
  }

  function calcularDiferencia() {
    const actualMin   = (horaActual.h % 12) * 60 + horaActual.m;
    const objetivoMin = (horaObjetivo.h % 12) * 60 + horaObjetivo.m;
    let diff = Math.abs(actualMin - objetivoMin);
    if (diff > 360) diff = 720 - diff;
    return diff;
  }

  function actualizarFeedback() {
    const diff = calcularDiferencia();
    const feedbackEl = document.getElementById('reloj-feedback');
    if (!feedbackEl) return;

    feedbackEl.className = 'reloj-feedback';

    if (diff === 0) {
      feedbackEl.textContent = '🎯 ¡Perfecto! ¡Esa es la hora!';
      feedbackEl.classList.add('muy-cerca');
    } else if (diff <= 15) {
      feedbackEl.textContent = '🔥 ¡Muy cerca! Un poquito más...';
      feedbackEl.classList.add('muy-cerca');
    } else if (diff <= 60) {
      feedbackEl.textContent = '👍 ¡Casi! Sigue moviendo...';
      feedbackEl.classList.add('cerca');
    } else {
      feedbackEl.textContent = '⏰ Sigue moviendo las manecillas';
      feedbackEl.classList.add('lejos');
    }
  }

  // ─── Verificación ────────────────────────────────────────────────────────
  function verificarHora() {
    const diff = calcularDiferencia();

    if (diff === 0) {
      roundActual++;
      actualizarProgreso();
      App.sumarPuntos(10);

      App.mostrarFeedback({
        emoji: '⏰',
        titulo: '¡Hora correcta!',
        subtitulo: `Pusiste las ${horaObjetivo.h}:${String(horaObjetivo.m).padStart(2, '0')} perfectamente`,
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
      const hd = horaObjetivo.h % 12 === 0 ? 12 : horaObjetivo.h % 12;
      hablar(`Todavía no. Necesitas ${horaTexto(hd, horaObjetivo.m)}`);

      document.getElementById('reloj-feedback').classList.add('anim-shake');
      setTimeout(() => {
        const fb = document.getElementById('reloj-feedback');
        if (fb) fb.classList.remove('anim-shake');
      }, 500);
    }
  }

  function actualizarProgreso() {
    const pct   = (roundActual / TOTAL_ROUNDS) * 100;
    const bar   = document.getElementById('reloj-progreso');
    const label = document.getElementById('reloj-round-label');
    if (bar)   bar.style.width = `${pct}%`;
    if (label) label.textContent = `${roundActual} / ${TOTAL_ROUNDS}`;
  }

  function finalizarModulo() {
    App.marcarTareaCompletada('reloj');
    App.sumarPuntos(25);

    App.mostrarFeedback({
      emoji: '⏰',
      titulo: '¡Experto en relojes!',
      subtitulo: 'Ya sabes leer la hora muy bien',
      onContinuar: () => App.navigate('home'),
    });
  }

  return { init };

})();