/**
 * APP.JS — Router principal, Ema, tema global persistente, confeti
 */

const App = (() => {

  const SCREENS = {
    bienvenida: { id: 'screen-bienvenida', init: () => ModuloInicio.initBienvenida() },
    home:       { id: 'screen-home',       init: () => ModuloInicio.initHome() },
    inicial:    { id: 'screen-inicial',    init: () => ModuloInicial.init() },
    vocales:    { id: 'screen-vocales',    init: () => ModuloVocales.init() },
    reloj:      { id: 'screen-reloj',      init: () => ModuloReloj.init() },
    manzanas:   { id: 'screen-manzanas',   init: () => ModuloManzanas.init() },
    tienda:     { id: 'screen-tienda',     init: () => ModuloTienda.init() },
  };

  let pantallaActual = null;

  /* ════════════════════════════════════════════════
     TEMA GLOBAL — persiste en sessionStorage
     Se aplica a body + partículas flotantes en todas
     las pantallas tras comprar en la tienda
  ════════════════════════════════════════════════ */
  let _temaGlobal = null;

  function setTemaGlobal(tema) {
    _temaGlobal = tema;
    if (tema) sessionStorage.setItem('tema_global', JSON.stringify(tema));
    else       sessionStorage.removeItem('tema_global');
    _aplicarTemaAlBody(tema);
  }

  function getTemaGlobal() {
    if (_temaGlobal) return _temaGlobal;
    try {
      const s = sessionStorage.getItem('tema_global');
      if (s) { _temaGlobal = JSON.parse(s); return _temaGlobal; }
    } catch(e) {}
    return null;
  }

  function _aplicarTemaAlBody(tema) {
    // Eliminar estilos de tema previos
    const prevStyle = document.getElementById('_tema_screen_style');
    if (prevStyle) prevStyle.remove();

    if (!tema) {
      document.body.style.background = '';
      document.body.style.transition = '';
      const pw = document.getElementById('particulas-globales');
      if (pw) { pw.innerHTML = ''; pw.remove(); }
      return;
    }

    // Fondo del body con el gradiente del tema
    document.body.style.background = tema.bgBody;
    document.body.style.transition  = 'background 1.2s ease';

    // Inyectar CSS que hace TODAS las pantallas de módulo transparentes
    // para que el fondo del body se vea a través de ellas
    const s = document.createElement('style');
    s.id = '_tema_screen_style';
    s.textContent = `
      #screen-home,
      #screen-inicial,
      #screen-vocales,
      #screen-reloj,
      #screen-manzanas,
      #screen-tienda {
        background: transparent !important;
      }
    `;
    document.head.appendChild(s);

    _crearParticulasGlobales(tema);
  }

  function _crearParticulasGlobales(tema) {
    let wrap = document.getElementById('particulas-globales');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'particulas-globales';
      wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
      document.body.appendChild(wrap);
    }
    wrap.innerHTML = '';
    if (!tema.particulas) return;
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position:absolute; bottom:-40px; user-select:none; pointer-events:none;
        left:${Math.random() * 95}%;
        font-size:${0.9 + Math.random() * 1.5}rem;
        opacity:${0.2 + Math.random() * 0.45};
        animation: _subirP ${5 + Math.random() * 8}s ${Math.random() * 6}s linear infinite;
      `;
      p.textContent = tema.particulas;
      wrap.appendChild(p);
    }
  }

  /* ════════════════════════════════════════════════
     VOZ DE EMA — Web Speech API
     Cancela inmediatamente si el niño hace clic rápido.
     soloSiLibre=true → no interrumpe (para errores).
  ════════════════════════════════════════════════ */
  const _synth   = window.speechSynthesis || null;
  let _vozEma    = null;
  let _freezeTimer = null;
  let _lastTexto = '';
  let _lastTs    = 0;

  // Frases de Ema al tocarla — rotan en orden para que siempre sea diferente
  const FRASES_EMA = [
    '¡Hola! Soy tu amiga Ema.',
    '¡Tú puedes lograrlo, yo sé que sí!',
    '¡Sigue así, eres un campeón!',
    '¡Qué bien que estás aprendiendo hoy!',
    '¡Me encanta jugar contigo!',
    '¡Eres súper inteligente, amigo!',
    '¡Vamos, un poco más, casi llegas!',
    '¡Qué divertido es aprender juntos!',
    '¡Eres mi estudiante favorito!',
    '¡Hoy vas a aprender algo nuevo y emocionante!',
    '¡Cada vez que aprendes, te haces más listo!',
    '¡Wow, qué rápido aprendes!',
  ];
  let _fraseEmaIdx = 0;

  function _cargarVozEma() {
    if (!_synth) return;
    const voces = _synth.getVoices();
    if (!voces.length) return;

    // Orden de preferencia para voz en español lo más natural posible
    const filtros = [
      v => v.lang === 'es-MX' && /paulina|natural|enhanced|premium|google/i.test(v.name),
      v => v.lang === 'es-ES' && /natural|enhanced|premium|google/i.test(v.name),
      v => v.lang === 'es-MX',
      v => v.lang === 'es-US',
      v => v.lang === 'es-ES',
      v => v.lang.startsWith('es-') && /female|woman|mujer/i.test(v.name),
      v => v.lang.startsWith('es-'),
      v => v.lang.startsWith('es'),
    ];
    for (const f of filtros) {
      const voz = voces.find(f);
      if (voz) { _vozEma = voz; break; }
    }
  }

  if (_synth) {
    _cargarVozEma();
    _synth.onvoiceschanged = _cargarVozEma;
  }

  /**
   * Ema habla en voz + burbuja visual.
   * Si soloSiLibre=true y ya está hablando, no interrumpe.
   */
  function hablarVoz(texto, soloSiLibre = false) {
    // Debounce: mismo texto en menos de 350ms → ignorar
    const ahora = Date.now();
    if (texto === _lastTexto && ahora - _lastTs < 350) return;
    _lastTexto = texto;
    _lastTs    = ahora;

    // Siempre mostrar burbuja visual
    mascotaHabla(texto);

    if (!_synth) return;
    if (soloSiLibre && _synth.speaking) return;

    // Cancelar voz anterior inmediatamente
    _synth.cancel();
    clearInterval(_freezeTimer);

    const u      = new SpeechSynthesisUtterance(texto);
    u.lang       = 'es-MX';
    u.rate       = 0.87;   // un poco lento para niños pequeños
    u.pitch      = 1.18;   // amigable sin sonar artificial
    u.volume     = 1;
    if (_vozEma) u.voice = _vozEma;

    // Workaround: Chrome/Edge congela speechSynthesis en frases largas
    u.onstart = () => {
      _freezeTimer = setInterval(() => {
        if (!_synth.speaking) { clearInterval(_freezeTimer); return; }
        _synth.pause(); _synth.resume();
      }, 14000);
    };
    u.onend   = () => clearInterval(_freezeTimer);
    u.onerror = () => clearInterval(_freezeTimer);

    // Pequeño delay para que Chrome no descarte la utterance post-cancel
    setTimeout(() => _synth.speak(u), 90);
  }

  function cancelarVoz() {
    if (_synth) _synth.cancel();
    clearInterval(_freezeTimer);
  }

  /* ════════════════════════════════════════════════
     CONFETI GLOBAL — se llama desde marcarTareaCompletada
     y desde tienda al comprar
  ════════════════════════════════════════════════ */
  function lanzarConfeti() {
    let wrap = document.getElementById('confeti-global');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'confeti-global';
      wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
      document.body.appendChild(wrap);
    }
    wrap.innerHTML = '';
    const colores = ['#FF6B35','#4ECDC4','#FFD93D','#A78BFA','#6BCB77','#FF8FAB','#00E5FF','#FF4D4D','#FFFFFF','#FFA500'];
    for (let i = 0; i < 110; i++) {
      const p  = document.createElement('div');
      const sz = 7 + Math.random() * 11;
      const col = colores[Math.floor(Math.random() * colores.length)];
      p.style.cssText = `
        position:absolute; top:-20px;
        left:${Math.random() * 100}%;
        width:${sz}px; height:${sz * (Math.random() > 0.5 ? 1 : 2.5)}px;
        background:${col};
        border-radius:${Math.random() > 0.45 ? '50%' : '2px'};
        animation: _caerC ${1.6 + Math.random() * 2.8}s ${Math.random() * 1}s ease-in forwards;
      `;
      wrap.appendChild(p);
    }
    setTimeout(() => { if (wrap) wrap.innerHTML = ''; }, 5500);
  }

  /* ════════════════════════════════════════════════
     NAVEGACIÓN
  ════════════════════════════════════════════════ */
  function navigate(nombre) {
    cancelarVoz();
    if (pantallaActual === 'vocales' && nombre !== 'vocales') {
      if (typeof ModuloVocales !== 'undefined') ModuloVocales.limpiarVocales();
    }

    const screen = SCREENS[nombre];
    if (!screen) { console.warn('Pantalla desconocida:', nombre); return; }

    Object.values(SCREENS).forEach(s => {
      const el = document.getElementById(s.id);
      if (el) el.style.display = 'none';
    });

    const el = document.getElementById(screen.id);
    if (el) {
      el.style.display = '';
      pantallaActual = nombre;
      // Re-aplicar tema global en cada navegación
      _aplicarTemaAlBody(getTemaGlobal());
      screen.init();
    }
    ocultarBurbujaMascota();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ════════════════════════════════════════════════
     PUNTOS Y TAREAS
  ════════════════════════════════════════════════ */
  function sumarPuntos(cant) {
    const prev = parseInt(localStorage.getItem('puntos') || '0');
    localStorage.setItem('puntos', prev + cant);
  }

  function marcarTareaCompletada(id) {
    const tareas = JSON.parse(localStorage.getItem('tareas_completadas') || '[]');
    if (!tareas.includes(id)) {
      tareas.push(id);
      localStorage.setItem('tareas_completadas', JSON.stringify(tareas));
      // ¡Confeti al completar una tarea!
      lanzarConfeti();
    }
  }

  /* ════════════════════════════════════════════════
     FEEDBACK OVERLAY
  ════════════════════════════════════════════════ */
  function mostrarFeedback({ emoji, titulo, subtitulo, onContinuar, autoCerrar }) {
    const prev = document.getElementById('feedback-overlay-global');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.id = 'feedback-overlay-global';
    overlay.innerHTML = `
      <div class="feedback-card">
        <span class="feedback-emoji">${emoji}</span>
        <div class="feedback-text">${titulo}</div>
        ${subtitulo ? `<p style="color:var(--text-medium);margin-bottom:24px;">${subtitulo}</p>` : ''}
        <button class="btn btn-primary" id="btn-feedback-continuar">Continuar →</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const cerrar = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      if (onContinuar) onContinuar();
    };
    document.getElementById('btn-feedback-continuar').addEventListener('click', cerrar);
    if (autoCerrar) setTimeout(cerrar, autoCerrar);
  }

  /* ════════════════════════════════════════════════
     EMA — burbuja visual
  ════════════════════════════════════════════════ */
  function mascotaHabla(texto) {
    const burbuja = document.getElementById('mascota-bubble');
    if (!burbuja) return;
    burbuja.textContent = texto;
    burbuja.classList.add('visible');
    clearTimeout(window._mascotaTimer);
    // Duración proporcional al largo del texto
    const dur = Math.max(2800, Math.min(texto.length * 58, 7500));
    window._mascotaTimer = setTimeout(() => burbuja.classList.remove('visible'), dur);
  }

  function ocultarBurbujaMascota() {
    const b = document.getElementById('mascota-bubble');
    if (b) b.classList.remove('visible');
  }

  /* ════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════ */
  function init() {
    _inyectarKeyframes();
    _asegurarPantallas();
    _crearEma();
    _aplicarTemaAlBody(getTemaGlobal());
    const nombre = localStorage.getItem('nombre_usuario');
    navigate(nombre ? 'home' : 'bienvenida');
  }

  function _inyectarKeyframes() {
    if (document.getElementById('_app_keyframes')) return;
    const s = document.createElement('style');
    s.id = '_app_keyframes';
    s.textContent = `
      @keyframes _subirP {
        0%   { transform:translateY(0) rotate(0deg);   opacity:0; }
        8%   { opacity:1; }
        92%  { opacity:0.5; }
        100% { transform:translateY(-110vh) rotate(360deg); opacity:0; }
      }
      @keyframes _caerC {
        0%   { transform:translateY(0) rotate(0deg) scale(1); opacity:1; }
        100% { transform:translateY(110vh) rotate(800deg) scale(0.5); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }

  function _asegurarPantallas() {
    const main = document.getElementById('app');
    if (!main) return;
    Object.entries(SCREENS).forEach(([, s]) => {
      if (!document.getElementById(s.id)) {
        const div = document.createElement('div');
        div.id = s.id; div.style.display = 'none';
        main.appendChild(div);
      }
    });
  }

  /* ════════════════════════════════════════════════
     SVG DE EMA — con mejillas, nombre en camiseta
  ════════════════════════════════════════════════ */
  function _crearEma() {
    if (document.getElementById('mascota-global')) return;

    const ema = document.createElement('div');
    ema.id        = 'mascota-global';
    ema.className = 'mascota';
    ema.setAttribute('aria-label', 'Ema, tu guía');
    ema.innerHTML = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Cola -->
        <ellipse cx="75" cy="73" rx="15" ry="10" fill="#FF6B35" transform="rotate(-25 75 73)"/>
        <ellipse cx="81" cy="69" rx="7"  ry="4.5" fill="#FFF0E8" transform="rotate(-25 81 69)"/>
        <!-- Cuerpo -->
        <ellipse cx="50" cy="69" rx="27" ry="21" fill="#FF6B35"/>
        <ellipse cx="50" cy="73" rx="15" ry="12" fill="#FFF0E8"/>
        <!-- Cabeza -->
        <circle cx="50" cy="43" r="26" fill="#FF6B35"/>
        <!-- Orejas -->
        <polygon points="25,27 16,4  37,20" fill="#FF6B35"/>
        <polygon points="75,27 84,4  63,20" fill="#FF6B35"/>
        <polygon points="26,25 20,9  35,21" fill="#FFAAB0"/>
        <polygon points="74,25 80,9  65,21" fill="#FFAAB0"/>
        <!-- Cara blanca -->
        <ellipse cx="50" cy="48" rx="17" ry="15" fill="#FFF0E8"/>
        <!-- Ojos -->
        <ellipse cx="42" cy="41" rx="4.5" ry="4.5" fill="#1A1A2E"/>
        <ellipse cx="58" cy="41" rx="4.5" ry="4.5" fill="#1A1A2E"/>
        <circle  cx="43.5" cy="39.5" r="1.7" fill="white"/>
        <circle  cx="59.5" cy="39.5" r="1.7" fill="white"/>
        <!-- Nariz -->
        <ellipse cx="50" cy="51" rx="3.5" ry="2.5" fill="#E85D7A"/>
        <!-- Boca -->
        <path d="M45,55 Q50,60 55,55" stroke="#1A1A2E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Mejillas -->
        <ellipse cx="37" cy="50" rx="5" ry="3" fill="#FFB3C6" opacity="0.6"/>
        <ellipse cx="63" cy="50" rx="5" ry="3" fill="#FFB3C6" opacity="0.6"/>
        <!-- Nombre en camiseta -->
        <text x="50" y="74" text-anchor="middle"
              font-family="'Fredoka One',cursive"
              font-size="8.5" fill="white" opacity="0.9">Ema</text>
      </svg>
    `;

    ema.addEventListener('click', () => {
      const frase = FRASES_EMA[_fraseEmaIdx % FRASES_EMA.length];
      _fraseEmaIdx++;
      hablarVoz(frase);
    });

    const burbuja = document.createElement('div');
    burbuja.id        = 'mascota-bubble';
    burbuja.className = 'mascota-bubble';

    document.body.appendChild(ema);
    document.body.appendChild(burbuja);
  }

  return {
    navigate,
    sumarPuntos,
    marcarTareaCompletada,
    mostrarFeedback,
    mascotaHabla,
    hablarVoz,
    cancelarVoz,
    lanzarConfeti,
    setTemaGlobal,
    getTemaGlobal,
    init,
  };

})();

document.addEventListener('DOMContentLoaded', () => App.init());
