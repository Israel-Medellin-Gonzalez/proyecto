const ModuloInicial = (() => {


  let nombreUsuario = '';
  let inicialCorrecta = '';
  let fase = 1;


  const OBJETOS_POR_LETRA = {
    A: { emoji: '🍎', nombre: 'Manzana' },
    B: { emoji: '🦋', nombre: 'Mariposa' },
    C: { emoji: '🐕', nombre: 'Cachorro' },
    D: { emoji: '🦕', nombre: 'Dinosaurio' },
    E: { emoji: '⭐', nombre: 'Estrella' },
    F: { emoji: '🌸', nombre: 'Flor' },
    G: { emoji: '🐱', nombre: 'Gatito' },
    H: { emoji: '🦛', nombre: 'Hipopótamo' },
    I: { emoji: '🌈', nombre: 'Iris (arcoíris)' },
    J: { emoji: '🦒', nombre: 'Jirafa' },
    K: { emoji: '🥝', nombre: 'Kiwi' },
    L: { emoji: '🦁', nombre: 'León' },
    M: { emoji: '🍄', nombre: 'Mago' },
    N: { emoji: '🌙', nombre: 'Noche' },
    O: { emoji: '🐻', nombre: 'Oso' },
    P: { emoji: '🦜', nombre: 'Perico' },
    Q: { emoji: '🧀', nombre: 'Queso' },
    R: { emoji: '🐸', nombre: 'Rana' },
    S: { emoji: '☀️', nombre: 'Sol' },
    T: { emoji: '🐢', nombre: 'Tortuga' },
    U: { emoji: '🦄', nombre: 'Unicornio' },
    V: { emoji: '🎻', nombre: 'Violín' },
    W: { emoji: '🍉', nombre: 'Sandía' },
    X: { emoji: '🎮', nombre: 'Videojuego' },
    Y: { emoji: '🏅', nombre: 'Yate' },
    Z: { emoji: '🦓', nombre: 'Cebra' },
  };


  function generarOpciones(correcta) {
    const todas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const incorrectas = todas.filter(l => l !== correcta);
    // Mezclar y tomar 4
    const mezcladas = incorrectas.sort(() => Math.random() - 0.5).slice(0, 4);
    const opciones = [...mezcladas, correcta].sort(() => Math.random() - 0.5);
    return opciones;
  }

  /**
   * Renderiza la pantalla completa
   */
  function init() {
    const screen = document.getElementById('screen-inicial');
    if (!screen) return;

    nombreUsuario = localStorage.getItem('nombre_usuario') || 'Amigo';
    inicialCorrecta = nombreUsuario.charAt(0).toUpperCase();
    fase = 1;

    const opciones = generarOpciones(inicialCorrecta);

    screen.innerHTML = `
      <div class="inicial-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="inicial-content">

        <!-- FASE 1: ENCONTRAR LA INICIAL -->
        <div class="inicial-instruccion">
          <h2>La inicial de tu nombre es:</h2>
          <p>Encuentra la letra <strong style="color: var(--color-primary); font-size: 1.2em;">${inicialCorrecta}</strong></p>
          <p style="font-size: 1.1rem; margin-top: 12px;">
            ¡Hola, <strong style="color: var(--color-primary);">${nombreUsuario}</strong>!<br>
            <span style="color:var(--text-medium);font-size:1rem;">Selecciona la inicial de tu nombre 👆</span>
          </p>
        </div>

        <div class="inicial-opciones" id="opciones-wrap">
          ${opciones.map(letra => `
            <button class="letra-btn" data-letra="${letra}">${letra}</button>
          `).join('')}
        </div>

        <div class="inicial-divider"></div>

        <!-- FASE 2: RESULTADO (oculto al inicio) -->
        <div class="inicial-resultado" id="resultado-wrap">
          <div class="inicial-resultado__letra-wrap">
            <div class="inicial-resultado__intro">Tu inicial es una</div>
            <div class="inicial-resultado__letra" id="letra-grande">${inicialCorrecta}</div>
            <div class="inicial-resultado__de">¡Muy bien!</div>
          </div>
          <div class="inicial-resultado__imagen-wrap">
            <div class="inicial-resultado__imagen" id="objeto-imagen">?</div>
            <div class="inicial-resultado__nombre" id="objeto-nombre">?</div>
            <div class="inicial-resultado__frase">empieza con la letra <strong>${inicialCorrecta}</strong></div>
            <button class="btn btn-primary" onclick="App.navigate('home')" style="margin-top:16px;">
              ✅ Listo
            </button>
          </div>
        </div>

      </div>
    `;

    // Eventos en botones de letras
    screen.querySelectorAll('.letra-btn').forEach(btn => {
      btn.addEventListener('click', () => elegirLetra(btn));
    });

    // Mascota
    setTimeout(() => {
      App.hablarVoz(`¡Encuentra la letra ${inicialCorrecta}, que es la inicial de "${nombreUsuario}"!`);
    }, 600);
  }

  /**
   * Maneja la elección de una letra
   */
  function elegirLetra(btn) {
    if (fase !== 1) return;

    const letraElegida = btn.dataset.letra;

    if (letraElegida === inicialCorrecta) {
      // Correcta
      btn.classList.add('correcta');
      fase = 2;

      // Deshabilitar todos los botones
      document.querySelectorAll('.letra-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = b === btn ? '1' : '0.4';
      });

      // Sumar puntos
      App.sumarPuntos(10);
      App.marcarTareaCompletada('inicial');

      // FUNCIONAL: primero felicita, y SOLO cuando termina de decirlo
      // (onEnd, no un setTimeout adivinado) muestra el resultado y
      // entonces narra el animal/objeto asociado a la letra.
      App.hablarVoz(`¡Excelente! La ${inicialCorrecta} es tu inicial`, false, () => {
        mostrarResultado();
      });

    } else {
      // Incorrecta
      btn.classList.add('incorrecta');
      setTimeout(() => btn.classList.remove('incorrecta'), 500);
      App.hablarVoz(`¡Esa no es! Busca la ${inicialCorrecta}`, true);
    }
  }

  /**
   * Muestra el bloque de resultado y NARRA el objeto asociado a la letra
   */
  function mostrarResultado() {
    const objeto = OBJETOS_POR_LETRA[inicialCorrecta] || { emoji: '⭐', nombre: 'Especial' };

    document.getElementById('objeto-imagen').textContent = objeto.emoji;
    document.getElementById('objeto-nombre').textContent = objeto.nombre;

    const resultadoWrap = document.getElementById('resultado-wrap');
    resultadoWrap.style.display = 'flex';
    requestAnimationFrame(() => {
      resultadoWrap.classList.add('visible');
    });

    // Scroll suave hacia resultado
    resultadoWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Narrar el objeto: "La J es como Jirafa"
    setTimeout(() => {
      App.hablarVoz(`La ${inicialCorrecta} es como ${objeto.nombre}`);
    }, 350);
  }

  return { init };

})();