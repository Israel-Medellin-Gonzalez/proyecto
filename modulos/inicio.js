/**
 * MÓDULO: INICIO & HOME
 * Maneja la pantalla de bienvenida y el menú principal
 */

const ModuloInicio = (() => {

  // Estado
  let nombreUsuario = '';

  // Datos de módulos del home
  const MODULOS = [
    {
      id: 'inicial',
      nombre: 'Mi Inicial',
      desc: 'Encuentra la letra de tu nombre',
      icon: '🔤',
    },
    {
      id: 'vocales',
      nombre: 'Vocales',
      desc: 'Atrapa las vocales voladoras',
      icon: '🫧',
    },
    {
      id: 'reloj',
      nombre: 'Reloj Mágico',
      desc: 'Aprende a leer el reloj',
      icon: '🕐',
    },
    {
      id: 'manzanas',
      nombre: 'Cuenta Frutas',
      desc: 'Cuenta y busca las frutas',
      icon: '🍎',
    },

    {
    id: 'clasifica',
    nombre: 'Clasifica',
    desc: 'Agrupa los objetos',
    icon: '🧩',
    },
    
    {
    id: 'secuencias',
    nombre: 'Secuencias',
    desc: 'Descubre el patrón correcto',
    icon: '🔢',
    },

   {
      id: 'tienda',
      nombre: 'Tienda',
      desc: 'Compra tus premios',
      icon: '🏪',
    },
  ];

  const TAREAS = [
    { id: 'inicial', nombre: 'Mi Inicial', icon: '🔤' },
    { id: 'vocales', nombre: 'Vocales', icon: '🫧' },
    { id: 'reloj', nombre: 'Reloj', icon: '🕐' },
    { id: 'manzanas', nombre: 'Contar', icon: '🍎' },
  ];

  /**
   * Inicializa la pantalla de bienvenida
   */
  function initBienvenida() {
    const screen = document.getElementById('screen-bienvenida');
    if (!screen) return;

    screen.innerHTML = `
      <div class="bienvenida-logo">🦊</div>
      <h1 class="bienvenida-titulo">
        Bienvenido a una<br><span>nueva aventura</span>
      </h1>
      <div class="bienvenida-form">
        <label class="bienvenida-label" for="nombre-input">¡Hola! ¿Cuál es tu nombre?</label>
        <input
          class="bienvenida-input"
          id="nombre-input"
          type="text"
          placeholder="Escribe tu nombre..."
          maxlength="20"
          autocomplete="off"
          autocapitalize="words"
        />
        <button class="btn btn-primary btn-lg" id="btn-iniciar">
          🚀 Iniciar aprendizaje
        </button>
      </div>
    `;

    const input = document.getElementById('nombre-input');
    const btnIniciar = document.getElementById('btn-iniciar');

    // Recuperar nombre guardado
    const nombreGuardado = localStorage.getItem('nombre_usuario');
    if (nombreGuardado) {
      input.value = nombreGuardado;
    }

    // Enter para continuar
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') iniciarAprendizaje();
    });

    btnIniciar.addEventListener('click', iniciarAprendizaje);
  }

  /**
   * Valida y navega al home
   */
  function iniciarAprendizaje() {
    const input = document.getElementById('nombre-input');
    const nombre = input.value.trim();

    if (!nombre) {
      input.focus();
      input.style.borderColor = 'var(--color-error)';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      App.hablarVoz('¡Escribe tu nombre para continuar! 😊');
      return;
    }

    nombreUsuario = nombre;
    localStorage.setItem('nombre_usuario', nombre);
    App.navigate('home');
  }

  /**
   * Inicializa la pantalla home/menú
   */
  function initHome() {
    const screen = document.getElementById('screen-home');
    if (!screen) return;

    nombreUsuario = localStorage.getItem('nombre_usuario') || 'Amigo';
    const inicial = nombreUsuario.charAt(0).toUpperCase();
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    const tareasCompletadas = JSON.parse(localStorage.getItem('tareas_completadas') || '[]');
    const tema = App.getTemaGlobal();
    const esOscuro = tema && tema.oscuro;
    const esClaro  = tema && !tema.oscuro;

    // Clases CSS que se añaden a los elementos según el tema
    const temaCard   = tema ? ` tema-activo${esOscuro ? ' tema-oscuro' : ' tema-claro'}` : '';
    const textoClass = esOscuro ? 'texto-blanco' : (esClaro ? 'texto-oscuro' : '');
    const temaStyle  = tema ? `style="--acento-tema:${tema.acento}"` : '';

    screen.innerHTML = `
      <div class="home-header" ${temaStyle}>
        <div>
          <div class="home-saludo ${textoClass}">¡Hola, <span>${nombreUsuario}</span>! 👋</div>
          <div class="home-subtitle ${textoClass}">Tu inicial es la <strong>${inicial}</strong> · ¿Listo para aprender?</div>
        </div>
        <div class="home-puntos">
          <span class="home-puntos__icon">🪙</span>
          <span class="home-puntos__valor">${puntos}</span>
        </div>
      </div>

      <div class="home-grid">
        ${MODULOS.map(m => `
          <a class="modulo-card${temaCard}" data-modulo="${m.id}" href="#" tabindex="0">
            <span class="modulo-card__icon">${m.icon}</span>
            <div class="modulo-card__nombre">${m.nombre}</div>
            <div class="modulo-card__desc">${m.desc}</div>
          </a>
        `).join('')}
      </div>

      <div class="tareas-section">
        <div class="tareas-titulo ${textoClass}">📋 Tareas del día</div>
        <div class="tareas-grid">
          ${TAREAS.map(t => `
            <div class="tarea-item${tareasCompletadas.includes(t.id) ? ' completada' : ''}${tema ? ' tema-activo' : ''}">
              <span class="tarea-icon">${t.icon}</span>
              <div class="tarea-nombre ${textoClass}">${t.nombre}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Eventos de navegación
    screen.querySelectorAll('.modulo-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate(card.dataset.modulo);
      });
    });

    // Saludo de Ema al cargar
    setTimeout(() => {
      App.hablarVoz(`¡Hola ${nombreUsuario}! ¿Qué aprendemos hoy?`);
    }, 800);
  }

  return { initBienvenida, initHome };

})();
