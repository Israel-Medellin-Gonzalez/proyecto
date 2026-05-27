/**
 * MÓDULO: TIENDA
 * Ema es la vendedora. Al comprar, el tema se guarda globalmente
 * y se aplica en TODAS las pantallas hasta que el niño compre otro.
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

  let seleccionado = null;

  // ──────────────────────────────────────────────────
  function init() {
    const screen = document.getElementById('screen-tienda');
    if (!screen) return;
    seleccionado = null;

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

        <!-- Ema vendedora -->
        <div class="tienda-ema-wrap">
          <div class="tienda-ema-avatar" id="tienda-ema-avatar">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
              <ellipse cx="75" cy="73" rx="15" ry="10" fill="#FF6B35" transform="rotate(-25 75 73)"/>
              <ellipse cx="81" cy="69" rx="7"  ry="4.5" fill="#FFF0E8" transform="rotate(-25 81 69)"/>
              <ellipse cx="50" cy="69" rx="27" ry="21" fill="#FF6B35"/>
              <ellipse cx="50" cy="73" rx="15" ry="12" fill="#FFF0E8"/>
              <circle cx="50" cy="43" r="26" fill="#FF6B35"/>
              <polygon points="25,27 16,4  37,20" fill="#FF6B35"/>
              <polygon points="75,27 84,4  63,20" fill="#FF6B35"/>
              <polygon points="26,25 20,9  35,21" fill="#FFAAB0"/>
              <polygon points="74,25 80,9  65,21" fill="#FFAAB0"/>
              <ellipse cx="50" cy="48" rx="17" ry="15" fill="#FFF0E8"/>
              <ellipse cx="42" cy="41" rx="4.5" ry="4.5" fill="#1A1A2E"/>
              <ellipse cx="58" cy="41" rx="4.5" ry="4.5" fill="#1A1A2E"/>
              <circle  cx="43.5" cy="39.5" r="1.7" fill="white"/>
              <circle  cx="59.5" cy="39.5" r="1.7" fill="white"/>
              <ellipse cx="50" cy="51" rx="3.5" ry="2.5" fill="#E85D7A"/>
              <path d="M45,55 Q50,60 55,55" stroke="#1A1A2E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <ellipse cx="37" cy="50" rx="5" ry="3" fill="#FFB3C6" opacity="0.6"/>
              <ellipse cx="63" cy="50" rx="5" ry="3" fill="#FFB3C6" opacity="0.6"/>
              <text x="50" y="74" text-anchor="middle" font-family="'Fredoka One',cursive" font-size="8.5" fill="white">Ema</text>
            </svg>
          </div>
          <div class="tienda-ema-burbuja visible-burbuja" id="tienda-ema-burbuja">
            ¡Hola! Soy Ema y hoy soy tu vendedora. Toca cualquier juguete para saber más sobre él. 🦊
          </div>
        </div>

        <!-- Grid de juguetes -->
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

      <!-- Overlay de compra -->
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

    // Eventos
    document.getElementById('btn-tienda-back').addEventListener('click', () => App.navigate('home'));
    document.getElementById('btn-comprar').addEventListener('click', comprar);
    document.getElementById('btn-monedas').addEventListener('click', animarMonedas);
    document.getElementById('btn-compra-cerrar').addEventListener('click', cerrarOverlay);
    document.querySelectorAll('.juguete-card').forEach(c =>
      c.addEventListener('click', () => seleccionarJuguete(c))
    );

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

    // Botón comprar
    const puntos = parseInt(localStorage.getItem('puntos') || '0');
    const btn    = document.getElementById('btn-comprar');
    if (seleccionado.precio <= puntos) {
      btn.disabled    = false;
      btn.textContent = `🛒 Comprar ${seleccionado.emoji} por 🪙${seleccionado.precio}`;
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

      App.hablarVoz(`¡Felicidades! ¡Compraste el ${seleccionado.nombre}!`);
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
