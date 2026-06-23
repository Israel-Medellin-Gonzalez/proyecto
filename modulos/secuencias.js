/**
 * MÓDULO: SECUENCIAS
 */

const ModuloSecuencias = (() => {

  const TOTAL_RONDAS = 5;

  const SECUENCIAS = [
    {
      patron: ["🔴","🔵","🔴","🔵","🔴"],
      opciones: ["🔴","🟡","🔵"],
      correcta: "🔵"
    },
    {
      patron: ["🟡","🟡","🔵","🟡","🟡"],
      opciones: ["🔵","🟡","🔴"],
      correcta: "🔵"
    },
    {
      patron: ["🔵","🔴","🔵","🔴"],
      opciones: ["🔴","🟡","🔵"],
      correcta: "🔴"
    },
    {
      patron: ["🟢","🟡","🟢","🟡"],
      opciones: ["🟢","🔵","🟡"],
      correcta: "🟢"
    },
    {
      patron: ["🔴","🔴","🟡","🔴","🔴"],
      opciones: ["🔴","🟡","🔵"],
      correcta: "🟡"
    }
  ];

  let round = 0;
  let actual = null;

  function init() {
    const screen = document.getElementById('screen-secuencias');
    if (!screen) return;

    round = 0;

    screen.innerHTML = `
      <div class="sec-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="sec-content">

        <div class="sec-instruccion">
          <h2>¿Cuál sigue en la secuencia?</h2>
          <p>Observa el patrón y elige la respuesta 👀</p>
        </div>

        <div class="sec-patron" id="sec-patron"></div>

      </div>

      <!-- 🔥 PANEL FLOTANTE DE OPCIONES -->
      <div class="sec-interaccion">
        <div class="sec-opciones" id="sec-opciones"></div>
      </div>

      <!-- 🔥 FOOTER PROGRESO -->
      <div class="sec-footer">
        <div class="sec-progreso-label">
          <span>Progreso</span>
          <span id="sec-round-label">0 / ${TOTAL_RONDAS}</span>
        </div>

        <div class="progress-bar">
          <div class="progress-bar__fill" id="sec-progreso"></div>
        </div>
      </div>
    `;

    iniciarRonda();

    App.hablarVoz("Observa la secuencia y elige la respuesta");
  }

  function iniciarRonda() {
    if (round >= TOTAL_RONDAS) {
      finalizar();
      return;
    }

    actual = SECUENCIAS[round];
    render();
  }

  function render() {
    const patron = document.getElementById('sec-patron');
    const opciones = document.getElementById('sec-opciones');

    patron.innerHTML = actual.patron.join("  ");
    opciones.innerHTML = "";

    actual.opciones.forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'sec-btn';
      btn.textContent = op;

      btn.onclick = () => seleccionar(op);

      opciones.appendChild(btn);
    });

    actualizarBarra();
  }

  function seleccionar(valor) {

    if (valor === actual.correcta) {

      App.hablarVoz(randomOk());
      App.sumarPuntos(2);
      App.lanzarConfeti();

      animacionCorrecto();

    } else {

      App.hablarVoz(randomError());
      animacionError();
      return;
    }

    round++;

    document.getElementById('sec-round-label')
      .textContent = `${round} / ${TOTAL_RONDAS}`;

    setTimeout(iniciarRonda, 500);
  }

  function actualizarBarra() {
    const pct = (round / TOTAL_RONDAS) * 100;
    const bar = document.getElementById('sec-progreso');
    if (bar) bar.style.width = `${pct}%`;
  }

  function finalizar() {
    App.marcarTareaCompletada('secuencias');
    App.sumarPuntos(3);

    App.hablarVoz("Muy bien, terminaste las secuencias");

    setTimeout(() => App.navigate('home'), 1200);
  }

  // 🎯 feedback dinámico
  function randomOk() {
    const m = [
      "¡Excelente! ",
      "¡Muy bien! ",
      "¡Lo lograste! ",
      "¡Increíble! "
    ];
    return m[Math.floor(Math.random() * m.length)];
  }

  function randomError() {
    const m = [
      "Casi, intenta otra vez ",
      "Observa mejor el patrón ",
      "Tú puedes ",
      "Inténtalo de nuevo "
    ];
    return m[Math.floor(Math.random() * m.length)];
  }

  // 🎨 animaciones visuales
  function animacionCorrecto() {
    const panel = document.querySelector('.sec-opciones');
    if (!panel) return;
    panel.classList.add('ok');
    setTimeout(() => panel.classList.remove('ok'), 400);
  }

  function animacionError() {
    const panel = document.querySelector('.sec-opciones');
    if (!panel) return;
    panel.classList.add('error');
    setTimeout(() => panel.classList.remove('error'), 400);
  }

  return { init };

})();