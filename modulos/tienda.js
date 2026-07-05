/**
 * MÓDULO: TIENDA
 * Ema es la vendedora. Al comprar, el tema se guarda globalmente
 * y se aplica en TODAS las pantallas hasta que el niño compre otro.
 *
 * REMODELACIÓN: para comprar, el niño ya no toca un botón directo.
 * Ahora debe arrastrar monedas (1, 2, 5, 10) y un billete (20) desde
 * su "cartera" hasta una "bandeja de pago" hasta juntar el precio
 * EXACTO del juguete. Así practica conteo y reconocimiento de
 * denominaciones antes de poder comprar.
 */

const ModuloTienda = (() => {

  const JUGUETES = [
    {
      id: 'robot',
      emoji: '🤖',
      nombre: 'Robot',
      precio: 15,
      vendedora: '¡Mira este robot increíble! Los robots son máquinas que piensan y ayudan a las personas. ¡Es súper inteligente igual que tú!',
      tema: {
        bgBody:    'linear-gradient(160deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        acento:    '#00E5FF',
        particulas:'🤖',
        oscuro:    true,
        cardBg:    'rgba(0,229,255,0.08)',
      }
    },
    {
      id: 'cohete',
      emoji: '🚀',
      nombre: 'Cohete',
      precio: 15,
      vendedora: '¡Un cohete espacial! Con él podrías volar hasta las estrellas y visitar la luna. ¡Vamos, despeguemos juntos!',
      tema: {
        bgBody:    'linear-gradient(180deg, #020024 0%, #090979 60%, #00d4ff 100%)',
        acento:    '#FFD700',
        particulas:'🚀',
        oscuro:    true,
        cardBg:    'rgba(255,215,0,0.08)',
      }
    },
    {
      id: 'unicornio',
      emoji: '🦄',
      nombre: 'Unicornio',
      precio: 25,
      vendedora: '¡Un unicornio mágico arcoíris! Es el animal más especial del mundo. Dicen que su cuerno concede deseos. ¡Es mi favorito!',
      tema: {
        bgBody:    'linear-gradient(135deg, #f9d7f5 0%, #d4c5ff 50%, #c5f0ff 100%)',
        acento:    '#FF69B4',
        particulas:'🦄',
        oscuro:    false,
        cardBg:    'rgba(255,105,180,0.08)',
      }
    },
    {
      id: 'dinosaurio',
      emoji: '🦕',
      nombre: 'Dinosaurio',
      precio: 20,
      vendedora: '¡Rawr! Un dinosaurio del período jurásico. Vivieron hace millones de años y eran los animales más grandes de la Tierra.',
      tema: {
        bgBody:    'linear-gradient(160deg, #23829d 0%, #36a57c 50%, #61cb99 100%)',
        acento:    '#B7E4C7',
        particulas:'🦕',
        oscuro:    true,
        cardBg:    'rgba(183,228,199,0.1)',
      }
    },
    {
      id: 'corona',
      emoji: '👑',
      nombre: 'Corona',
      precio: 30,
      vendedora: '¡Una corona de rey o de reina! Quien la usa es la persona más importante del reino. ¿Quieres ser la realeza hoy?',
      tema: {
        bgBody:    'linear-gradient(135deg, #3D2B00 0%, #7B4F00 40%, #C8860A 100%)',
        acento:    '#FFD700',
        particulas:'👑',
        oscuro:    true,
        cardBg:    'rgba(255,215,0,0.1)',
      }
    },
    {
      id: 'arcoiris',
      emoji: '🌈',
      nombre: 'Arcoíris',
      precio: 15,
      vendedora: '¡Un arcoíris de siete colores! Aparece cuando el sol brilla después de la lluvia. Es la magia de la naturaleza.',
      tema: {
        bgBody:    'linear-gradient(180deg, #84fab0 0%, #8fd3f4 50%, #ffecd2 100%)',
        acento:    '#FF6B9D',
        particulas:'🌟',
        oscuro:    false,
        cardBg:    'rgba(255,107,157,0.07)',
      }
    },
  ];

  // Denominaciones disponibles para el juego de pago
  const DENOMINACIONES = [1, 2, 5, 10, 20];

  let seleccionado = null;
  let bandejaItems = [];     // [{id, valor}] monedas puestas en la bandeja
  let carteraSet = [];       // [{id, valor}] set fijo de piezas de la cartera
  let idMonedaCounter = 0;

  // ──────────────────────────────────────────────────
  function init() {
    const screen = document.getElementById('screen-tienda');
    if (!screen) return;
    seleccionado = null;
    bandejaItems = [];

    const puntos = parseInt(localStorage.getItem('puntos') || '0');

    screen.innerHTML = `
      <div class="tienda-header" id="tienda-header">
        <button class="nav-back" id="btn-tienda-back">← Inicio</button>
        <div class="tienda-titulo-wrap">
          <span>🏪</span>
          <span class="tienda-titulo-texto">Tienda Mágica</span>
        </div>
        <div class="tienda-monedas" id="btn-monedas">
          <span>🪙</span>
          <span id="puntos-display">${puntos}</span>
        </div>
      </div>

      <div class="tienda-content">
        <div class="tienda-layout">
          
          <!-- Ema vendedora a la IZQUIERDA -->
          <div class="tienda-ema-section">
            <div class="tienda-instruccion">
              <h2>¡Bienvenido!</h2>
              <p>Soy Ema, tu vendedora. Toca cualquier juguete para saber más sobre él 🦊</p>
            </div>
            <div class="tienda-ema-wrap">
              <div class="tienda-ema-avatar" id="tienda-ema-avatar">
              </div>
              <div class="tienda-ema-burbuja" id="tienda-ema-burbuja" style="display:none;">
              </div>
            </div>
          </div>

          <!-- Estante de juguetes a la DERECHA -->
          <div class="tienda-estante-section">
            <!-- Grid de juguetes -->
            <div class="tienda-estante">
              <div class="tienda-grid" id="juguetes-grid">
          ${JUGUETES.map(j => `
            <div class="juguete-card" data-id="${j.id}" data-precio="${j.precio}">
              <span class="juguete-check">✓</span>
              <span class="juguete-emoji">${j.emoji}</span>
              <div class="juguete-nombre">${j.nombre}</div>
              <div class="juguete-precio">🪙 ${j.precio}</div>
            </div>
          `).join('')}
        </div>

        <div class="tienda-comprar-wrap">
          <button class="btn btn-accent btn-lg" id="btn-comprar" disabled>
            🛒 Toca un juguete
          </button>
        </div>
      </div>

      <!-- Overlay de PAGO: arrastrar monedas -->
      <div class="pago-overlay" id="pago-overlay">
        <div class="pago-card" id="pago-card">
          <button class="pago-cerrar" id="btn-pago-cerrar">✕</button>

          <div class="pago-juguete-info">
            <span class="pago-juguete-emoji" id="pago-juguete-emoji">?</span>
            <div>
              <div class="pago-juguete-nombre" id="pago-juguete-nombre">?</div>
              <div class="pago-juguete-precio">Precio: 🪙<span id="pago-juguete-precio">0</span></div>
            </div>
          </div>

          <div class="pago-bandeja-label">Arrastra monedas aquí para pagar</div>
          <div class="pago-bandeja" id="pago-bandeja"></div>

          <div class="pago-total-row">
            <span>Total puesto: 🪙<span id="pago-total">0</span></span>
            <button class="btn-mini" id="btn-pago-vaciar">Vaciar</button>
          </div>

          <div class="pago-feedback" id="pago-feedback"></div>

          <div class="pago-cartera-label">Tu cartera</div>
          <div class="pago-cartera" id="pago-cartera"></div>

          <button class="btn btn-primary btn-lg" id="btn-pago-confirmar" disabled>
            Pagar y comprar
          </button>
        </div>
      </div>

      <!-- Overlay de compra (éxito) -->
      <div class="compra-overlay" id="compra-overlay">
        <div class="compra-card" id="compra-card">
          <span class="compra-emoji" id="compra-emoji">?</span>
          <div class="compra-titulo">¡Compraste el <span id="compra-nombre">?</span>!</div>
          <div class="compra-subtitulo" id="compra-subtitulo"></div>
          <button class="btn btn-primary" id="btn-compra-cerrar">¡Genial! 🎉</button>
        </div>
      </div>

      <div class="confeti-wrap" id="confeti-tienda"></div>
    `;

    // Eventos generales
    document.getElementById('btn-tienda-back').addEventListener('click', () => App.navigate('home'));
    document.getElementById('btn-comprar').addEventListener('click', abrirPago);
    document.getElementById('btn-monedas').addEventListener('click', animarMonedas);
    document.getElementById('btn-compra-cerrar').addEventListener('click', cerrarOverlay);
    document.querySelectorAll('.juguete-card').forEach(c =>
      c.addEventListener('click', () => seleccionarJuguete(c))
    );

    // Eventos del overlay de pago
    document.getElementById('btn-pago-cerrar').addEventListener('click', cerrarPago);
    document.getElementById('btn-pago-vaciar').addEventListener('click', vaciarBandeja);
    document.getElementById('btn-pago-confirmar').addEventListener('click', confirmarPago);

    const bandeja = document.getElementById('pago-bandeja');
    bandeja.addEventListener('dragover', e => e.preventDefault());
    bandeja.addEventListener('drop', onDropBandeja);

    // Ema habla al entrar
    setTimeout(() => {
      App.hablarVoz('¡Bienvenido a la tienda mágica! Toca cualquier juguete y te cuento sobre él.');
    }, 400);
  }

  // ──────────────────────────────────────────────────
  function seleccionarJuguete(card) {
    document.querySelectorAll('.juguete-card').forEach(c => c.classList.remove('seleccionado'));
    card.classList.add('seleccionado');

    seleccionado = JUGUETES.find(j => j.id === card.dataset.id);
    if (!seleccionado) return;

    // Ema describe el juguete
    _actualizarBurbuja(seleccionado.vendedora);
    App.hablarVoz(seleccionado.vendedora);

    // Botón comprar -> ahora abre la bandeja de pago, no compra directo
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    const btn    = document.getElementById('btn-comprar');
    if (seleccionado.precio <= puntos) {
      btn.disabled    = false;
      btn.textContent = `🪙 Pagar ${seleccionado.emoji} (cuesta ${seleccionado.precio})`;
    } else {
      btn.disabled    = true;
      const falta = seleccionado.precio - puntos;
      btn.textContent = `🔒 Te faltan 🪙${falta}`;
      setTimeout(() => {
        App.hablarVoz(`¡Ay! Te faltan ${falta} monedas. ¡Sigue aprendiendo para ganarlas!`, true);
      }, 3000);
    }
  }

  function _actualizarBurbuja(texto) {
    const b = document.getElementById('tienda-ema-burbuja');
    if (!b) return;
    b.classList.remove('visible-burbuja');
    void b.offsetWidth;
    b.textContent = texto;
    b.classList.add('visible-burbuja');
  }

  // ──────────────────────────────────────────────────
  // PAGO CON MONEDAS (arrastrar y soltar)
  // ──────────────────────────────────────────────────
  function abrirPago() {
    if (!seleccionado) return;
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    if (puntos < seleccionado.precio) return;

    bandejaItems = [];
    carteraSet = crearSetCartera().map(item => {
      idMonedaCounter++;
      return { id: `m${idMonedaCounter}`, valor: item.valor };
    });

    document.getElementById('pago-juguete-emoji').textContent  = seleccionado.emoji;
    document.getElementById('pago-juguete-nombre').textContent = seleccionado.nombre;
    document.getElementById('pago-juguete-precio').textContent = seleccionado.precio;

    renderCartera(puntos);
    renderBandeja();

    document.getElementById('pago-overlay').classList.add('active');

    App.hablarVoz(`Arrastra monedas hasta juntar exactamente ${seleccionado.precio} para pagar el ${seleccionado.nombre}.`);
  }

  function cerrarPago() {
    document.getElementById('pago-overlay').classList.remove('active');
    bandejaItems = [];
  }

  // Cartera FIJA: siempre las mismas piezas, sin importar el saldo.
  // Cada denominación se deshabilita individualmente si el saldo total
  // del niño no le alcanza para "tener" esa pieza (ej. con 18 puntos,
  // el billete de 20 aparece bloqueado).
  const SET_FIJO_CARTERA = [1, 1, 2, 2, 5, 5, 10, 10, 20];

  function crearSetCartera() {
    return SET_FIJO_CARTERA.map(valor => ({ valor }));
  }

  function crearElementoMoneda(valor, instanceId, origen, deshabilitada) {
    const esBillete = valor === 20;
    const el = document.createElement('div');
    el.className   = esBillete ? 'pieza-dinero billete' : 'pieza-dinero moneda';
    el.classList.add(`denominacion-${valor}`);
    el.dataset.valor = valor;
    el.dataset.instanceId = instanceId;
    el.dataset.origen = origen; // 'cartera' | 'bandeja'
    el.innerHTML = `<span class="pieza-valor">$${valor}</span>`;

    if (deshabilitada) {
      el.classList.add('deshabilitada');
      el.draggable = false;
      el.title = 'No te alcanza para esta';
    } else {
      el.draggable = true;
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', instanceId);
      });
    }

    // En la bandeja, tocar la moneda la regresa a la cartera (más fácil en touch)
    if (origen === 'bandeja') {
      el.addEventListener('click', () => {
        bandejaItems = bandejaItems.filter(m => m.id !== instanceId);
        renderBandeja();
      });
    }

    return el;
  }

  function renderCartera(puntos) {
    const cartera = document.getElementById('pago-cartera');
    cartera.innerHTML = '';
    carteraSet.forEach(item => {
      const valor = item.valor;
      const enBandeja = bandejaItems.some(b => b.id === item.id);
      if (enBandeja) return; // ya está en la bandeja, no se repite en la cartera
      const deshabilitada = valor > puntos;
      cartera.appendChild(crearElementoMoneda(valor, item.id, 'cartera', deshabilitada));
    });
  }

  function renderBandeja() {
    const bandeja = document.getElementById('pago-bandeja');
    bandeja.innerHTML = '';
    bandejaItems.forEach(item => {
      bandeja.appendChild(crearElementoMoneda(item.valor, item.id, 'bandeja', false));
    });

    const total = bandejaItems.reduce((s, m) => s + m.valor, 0);
    document.getElementById('pago-total').textContent = total;
    actualizarFeedbackPago(total);

    // La cartera también se repinta porque el saldo restante "disponible para
    // usar" no cambia (las piezas deshabilitadas dependen del saldo total,
    // no de lo que ya está en la bandeja), pero sí deben ocultarse las que
    // ya se usaron.
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    renderCartera(puntos);
  }

  function onDropBandeja(e) {
    e.preventDefault();
    const instanceId = e.dataTransfer.getData('text/plain');
    if (!instanceId) return;
    if (bandejaItems.find(m => m.id === instanceId)) return; // ya está

    const pieza = carteraSet.find(m => m.id === instanceId);
    if (!pieza) return;

    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    if (pieza.valor > puntos) return; // por seguridad, no se puede usar si no alcanza

    bandejaItems.push({ id: instanceId, valor: pieza.valor });
    renderBandeja();
  }

  function actualizarFeedbackPago(total) {
    const feedback = document.getElementById('pago-feedback');
    const btnConfirmar = document.getElementById('btn-pago-confirmar');
    if (!seleccionado) return;

    if (total === 0) {
      feedback.textContent = '';
      feedback.className = 'pago-feedback';
      btnConfirmar.disabled = true;
      return;
    }

    if (total === seleccionado.precio) {
      feedback.textContent = '¡Justo! Ya puedes pagar 🎉';
      feedback.className = 'pago-feedback feedback-ok';
      btnConfirmar.disabled = false;
    } else if (total < seleccionado.precio) {
      feedback.textContent = `Te faltan ${seleccionado.precio - total} monedas`;
      feedback.className = 'pago-feedback feedback-falta';
      btnConfirmar.disabled = true;
    } else {
      feedback.textContent = `Pusiste ${total - seleccionado.precio} de más, quita alguna moneda`;
      feedback.className = 'pago-feedback feedback-sobra';
      btnConfirmar.disabled = true;
    }
  }

  function vaciarBandeja() {
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    bandejaItems = [];
    renderCartera(puntos);
    renderBandeja();
  }

  function confirmarPago() {
    const total = bandejaItems.reduce((s, m) => s + m.valor, 0);
    if (!seleccionado || total !== seleccionado.precio) return;
    cerrarPago();
    comprar();
  }

  // ──────────────────────────────────────────────────
  // Lógica original de compra (sin cambios), ahora disparada
  // después de pagar con monedas en vez de un solo clic.
  // ──────────────────────────────────────────────────
  function comprar() {
    if (!seleccionado) return;
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    if (puntos < seleccionado.precio) return;

    // Descontar puntos
    localStorage.setItem('puntos', puntos - seleccionado.precio);
    document.getElementById('puntos-display').textContent = puntos - seleccionado.precio;

    // Guardar el tema en App para que persista en TODAS las pantallas
    App.setTemaGlobal(seleccionado.tema);

    animarMonedas();

    setTimeout(() => {
      document.getElementById('compra-emoji').textContent    = seleccionado.emoji;
      document.getElementById('compra-nombre').textContent   = seleccionado.nombre;

      const subtitulos = {
        robot:      '¡Tu robot está listo para explorar contigo! 🤖',
        cohete:     '¡3, 2, 1... Despegue! 🚀',
        unicornio:  '¡La magia es tuya ahora! ✨',
        dinosaurio: '¡Rawr! ¡Nada te detiene! 🦕',
        corona:     '¡Que viva el rey! ¡Que viva la reina! 👑',
        arcoiris:   '¡Llevas los siete colores contigo! 🌈',
      };
      document.getElementById('compra-subtitulo').textContent = subtitulos[seleccionado.id] || '¡Lo hiciste muy bien!';

      document.getElementById('compra-overlay').classList.add('active');

      // ¡Confeti en pantalla completa — sin descripción de Ema!
      App.lanzarConfeti();

      App.hablarVoz(`¡Felicidades! ¡Pagaste justo y compraste el ${seleccionado.nombre}!`);
    }, 700);
  }

  function animarMonedas() {
    const btn = document.getElementById('btn-monedas');
    if (!btn) return;
    const { left, top, width, height } = btn.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top  + height / 2;
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        const m = document.createElement('div');
        m.className  = 'moneda-voladora';
        m.textContent = '🪙';
        m.style.left = `${cx + (Math.random() - 0.5) * 80}px`;
        m.style.top  = `${cy}px`;
        m.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
        document.body.appendChild(m);
        setTimeout(() => m.remove(), 1400);
      }, i * 40);
    }
  }

  function cerrarOverlay() {
    document.getElementById('compra-overlay').classList.remove('active');
    seleccionado = null;
    document.querySelectorAll('.juguete-card').forEach(c => c.classList.remove('seleccionado'));
    const btn = document.getElementById('btn-comprar');
    btn.disabled    = true;
    btn.textContent = '🛒 Toca un juguete';

    _actualizarBurbuja('¿Quieres comprar otro? ¡Sigue aprendiendo para ganar más monedas! 🌟');
    App.hablarVoz('¿Quieres comprar otro juguete? ¡Sigue aprendiendo para ganar más monedas!');
  }

  return { init };

})();