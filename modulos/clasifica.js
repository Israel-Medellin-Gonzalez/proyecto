/**
 * MÓDULO: CLASIFICA
 * Drag & drop (Pointer Events) + clic como alternativa accesible
 * Corregido: el objeto solo sale del grid cuando hay arrastre REAL confirmado,
 * nunca en un simple clic — esto evita que desaparezca y evita el trabado.
 */

const ModuloClasifica = (() => {

  const TOTAL_RONDAS = 4;
  const UMBRAL_ARRASTRE = 6; // px mínimos de movimiento para considerarlo arrastre real

  const SETS = [
    {
      categorias: [
        { id: 'animales', nombre: 'Animales', icon: '🐾' },
        { id: 'frutas',   nombre: 'Frutas',   icon: '🍉' },
      ],
      objetos: [
        { emoji: '🐕', cat: 'animales' },
        { emoji: '🍎', cat: 'frutas' },
        { emoji: '🐱', cat: 'animales' },
        { emoji: '🍌', cat: 'frutas' },
        { emoji: '🐸', cat: 'animales' },
        { emoji: '🍇', cat: 'frutas' },
      ],
    },
    {
      categorias: [
        { id: 'cielo',  nombre: 'Vuelan',  icon: '☁️' },
        { id: 'agua',   nombre: 'Nadan',   icon: '🌊' },
      ],
      objetos: [
        { emoji: '🦋', cat: 'cielo' },
        { emoji: '🐠', cat: 'agua' },
        { emoji: '🦜', cat: 'cielo' },
        { emoji: '🐳', cat: 'agua' },
        { emoji: '🐝', cat: 'cielo' },
        { emoji: '🐙', cat: 'agua' },
      ],
    },
    {
      categorias: [
        { id: 'transporte', nombre: 'Transporte', icon: '🚦' },
        { id: 'comida',     nombre: 'Comida',      icon: '🍽️' },
      ],
      objetos: [
        { emoji: '🚗', cat: 'transporte' },
        { emoji: '🍕', cat: 'comida' },
        { emoji: '🚌', cat: 'transporte' },
        { emoji: '🍔', cat: 'comida' },
        { emoji: '✈️', cat: 'transporte' },
        { emoji: '🥕', cat: 'comida' },
      ],
    },
    {
      categorias: [
        { id: 'caliente', nombre: 'Calor', icon: '🔥' },
        { id: 'frio',     nombre: 'Frío',  icon: '❄️' },
      ],
      objetos: [
        { emoji: '☀️', cat: 'caliente' },
        { emoji: '🧊', cat: 'frio' },
        { emoji: '🔥', cat: 'caliente' },
        { emoji: '⛄', cat: 'frio' },
        { emoji: '🌶️', cat: 'caliente' },
        { emoji: '🍦', cat: 'frio' },
      ],
    },
  ];

  let roundActual   = 0;
  let setActual     = null;
  let objetos       = [];
  let objetoElegido = null;
  let clasificados  = 0;
  let _drag         = null; // estado del arrastre activo (o null si no hay ninguno)

  /* ════════════════════════════════════════════════
     INIT / RONDAS
  ════════════════════════════════════════════════ */
  function init() {
    const screen = document.getElementById('screen-clasifica');
    if (!screen) return;

    roundActual = 0;
    _drag = null;

    screen.innerHTML = `
      <div class="clasifica-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="clasifica-content">

        <div class="clasifica-instruccion">
          <h2>Clasifica los objetos</h2>
          <p>Arrastra cada objeto a su grupo, o tócalo y luego toca el grupo 👆</p>
        </div>

        <div class="clasifica-objetos" id="clasifica-objetos"></div>
        <div class="clasifica-categorias" id="clasifica-categorias"></div>

      </div>

      <div class="clasifica-footer">
        <div class="clasifica-progreso-label">
          <span>Progreso</span>
          <span id="clasifica-round-label">0 / ${TOTAL_RONDAS}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill" id="clasifica-progreso" style="width:0%"></div>
        </div>
      </div>
    `;

    iniciarRonda();
    App.hablarVoz('Arrastra un objeto a su grupo, o tócalo y luego toca el grupo');
  }

  function iniciarRonda() {
    if (roundActual >= TOTAL_RONDAS) {
      finalizarModulo();
      return;
    }

    objetoElegido = null;
    clasificados  = 0;
    _drag = null;

    setActual = SETS[roundActual % SETS.length];

    objetos = setActual.objetos
      .map(o => ({ ...o, clasificado: false }))
      .sort(() => Math.random() - 0.5);

    renderObjetos();
    renderCategorias();

    App.hablarVoz(`Busca ${setActual.categorias[0].nombre} y ${setActual.categorias[1].nombre}`);
  }

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  function renderObjetos() {
    const wrap = document.getElementById('clasifica-objetos');
    if (!wrap) return;
    wrap.innerHTML = '';

    objetos.forEach((obj, i) => {
      const item = document.createElement('div');
      item.className = 'clasifica-item';
      item.dataset.index = i;
      item.textContent = obj.emoji;

      if (obj.clasificado) {
        item.classList.add('clasificado');
      } else {
        item.addEventListener('click', () => {
          // Si lo que acaba de pasar fue un arrastre real, el click que el
          // navegador dispara justo después no debe re-seleccionar nada.
          if (_drag && _drag.fueArrastreReal) return;
          elegirObjeto(i);
        });
        item.addEventListener('pointerdown', (e) => iniciarDrag(e, item, i));
      }

      wrap.appendChild(item);
    });
  }

  function renderCategorias() {
    const wrap = document.getElementById('clasifica-categorias');
    if (!wrap) return;
    wrap.innerHTML = '';

    setActual.categorias.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'clasifica-categoria';
      card.dataset.cat = cat.id;
      card.innerHTML = `
        <span>${cat.icon}</span>
        <div>${cat.nombre}</div>
        <div id="zona-${cat.id}"></div>
      `;
      card.addEventListener('click', () => elegirCategoria(cat.id, card));
      wrap.appendChild(card);
    });
  }

  /* ════════════════════════════════════════════════
     FLUJO POR CLIC (accesible, sin arrastre)
  ════════════════════════════════════════════════ */
  function elegirObjeto(index) {
    if (objetos[index].clasificado) return;

    document.querySelectorAll('.clasifica-item').forEach(el => el.classList.remove('seleccionado'));

    objetoElegido = index;

    const el = document.querySelector(`.clasifica-item[data-index="${index}"]`);
    if (el) el.classList.add('seleccionado');

    App.hablarVoz(`Pon en el grupo que pertenece`);
  }

  function elegirCategoria(catId, cardEl) {
    if (objetoElegido === null) {
      App.hablarVoz('Primero toca un objeto, o arrástralo directamente');
      return;
    }
    intentarClasificar(objetoElegido, catId, cardEl);
  }

  /* ════════════════════════════════════════════════
     DRAG & DROP — Pointer Events
     Clave: el objeto NO sale del grid hasta que el
     movimiento supera UMBRAL_ARRASTRE. Un clic simple
     o doble clic nunca toca su posición en el DOM.
  ════════════════════════════════════════════════ */
  function iniciarDrag(e, item, index) {
    if (objetos[index].clasificado) return;
    if (_drag) return; // ya hay un arrastre en curso, ignorar este pointerdown

    item.setPointerCapture(e.pointerId);

    const rect = item.getBoundingClientRect();

    _drag = {
      pointerId: e.pointerId,
      item,
      index,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      fueArrastreReal: false, // se vuelve true solo si supera el umbral
      sacadoDelGrid: false,   // true solo cuando ya se movió a document.body
    };

    item.addEventListener('pointermove', onDragMove);
    item.addEventListener('pointerup', onDragEnd);
    item.addEventListener('pointercancel', onDragEnd);
  }

  function onDragMove(e) {
    if (!_drag || e.pointerId !== _drag.pointerId) return;

    const dx = e.clientX - _drag.startX;
    const dy = e.clientY - _drag.startY;

    if (!_drag.fueArrastreReal && (Math.abs(dx) > UMBRAL_ARRASTRE || Math.abs(dy) > UMBRAL_ARRASTRE)) {
      _drag.fueArrastreReal = true;
      sacarDelGrid(_drag.item);
    }

    if (_drag.fueArrastreReal) {
      posicionarDrag(e.clientX, e.clientY);
      resaltarCategoriaBajoPuntero(e.clientX, e.clientY);
    }
  }

  function onDragEnd(e) {
    if (!_drag || e.pointerId !== _drag.pointerId) return;

    const { item, index, fueArrastreReal, pointerId } = _drag;

    item.removeEventListener('pointermove', onDragMove);
    item.removeEventListener('pointerup', onDragEnd);
    item.removeEventListener('pointercancel', onDragEnd);

    try { item.releasePointerCapture(pointerId); } catch (err) { /* ya liberado, sin problema */ }

    if (!fueArrastreReal) {
      // Fue un simple clic: el objeto nunca salió del grid, no hay nada que limpiar.
      // El listener de 'click' del propio item se encarga de seleccionarlo.
      _drag = null;
      return;
    }

    // Sí hubo arrastre real: buscar si se soltó sobre una categoría
    item.style.pointerEvents = 'none';
    const debajo = document.elementFromPoint(e.clientX, e.clientY);
    const catEl  = debajo ? debajo.closest('.clasifica-categoria') : null;

    document.querySelectorAll('.clasifica-categoria').forEach(c => c.classList.remove('drag-sobre'));
    limpiarEstiloFlotante(item);

    _drag = null;

    // Esperar un frame para no pelear con el navegador mientras cierra el
    // ciclo de pointer capture — esto es lo que evita el "trabado".
    requestAnimationFrame(() => {
      if (item.parentNode === document.body) item.remove();

      if (catEl) {
        intentarClasificar(index, catEl.dataset.cat, catEl);
      } else {
        // Se soltó fuera de cualquier categoría: regresa al grid tal cual estaba
        renderObjetos();
      }
    });
  }

  function sacarDelGrid(item) {
    const rect = item.getBoundingClientRect();
    item.classList.add('arrastrando');
    item.style.position = 'fixed';
    item.style.left   = `${rect.left}px`;
    item.style.top    = `${rect.top}px`;
    item.style.width  = `${rect.width}px`;
    item.style.height = `${rect.height}px`;
    item.style.zIndex = '9999';
    document.body.appendChild(item);
    if (_drag) _drag.sacadoDelGrid = true;
  }

  function posicionarDrag(clientX, clientY) {
    if (!_drag) return;
    const { item, offsetX, offsetY } = _drag;
    item.style.left = `${clientX - offsetX}px`;
    item.style.top  = `${clientY - offsetY}px`;
  }

  function limpiarEstiloFlotante(item) {
    item.classList.remove('arrastrando');
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
    item.style.width = '';
    item.style.height = '';
    item.style.zIndex = '';
    item.style.pointerEvents = '';
  }

  function resaltarCategoriaBajoPuntero(clientX, clientY) {
    if (!_drag) return;
    const prevPE = _drag.item.style.pointerEvents;
    _drag.item.style.pointerEvents = 'none';
    const bajoPuntero = document.elementFromPoint(clientX, clientY);
    _drag.item.style.pointerEvents = prevPE;

    const cat = bajoPuntero ? bajoPuntero.closest('.clasifica-categoria') : null;
    document.querySelectorAll('.clasifica-categoria').forEach(c => {
      c.classList.toggle('drag-sobre', c === cat);
    });
  }

  /* ════════════════════════════════════════════════
     LÓGICA COMPARTIDA — clic o drag llegan aquí
  ════════════════════════════════════════════════ */
  function intentarClasificar(index, catId, cardEl) {
    const obj = objetos[index];
    if (!obj || obj.clasificado) return;

    if (obj.cat === catId) {
      obj.clasificado = true;
      clasificados++;

      const zona = document.getElementById(`zona-${catId}`);
      if (zona) {
        const mini = document.createElement('span');
        mini.textContent = obj.emoji;
        zona.appendChild(mini);
      }

      if (cardEl) {
        cardEl.classList.add('acierto');
        setTimeout(() => cardEl.classList.remove('acierto'), 400);
      }

      App.sumarPuntos(1);
      App.hablarVoz('Correcto lo haces bien');

      objetoElegido = null;
      renderObjetos();
      actualizarProgresoRonda();

      if (clasificados >= objetos.length) {
        setTimeout(() => completarRonda(), 200);
      }

    } else {
      if (cardEl) {
        cardEl.classList.add('fallo');
        setTimeout(() => cardEl.classList.remove('fallo'), 400);
      }
      App.hablarVoz('Intenta otra vez');
      renderObjetos();
    }
  }

  function actualizarProgresoRonda() {
    const pctRonda  = clasificados / objetos.length;
    const pctTotal  = ((roundActual + pctRonda) / TOTAL_RONDAS) * 100;
    const bar = document.getElementById('clasifica-progreso');
    if (bar) bar.style.width = `${pctTotal}%`;
  }

  function completarRonda() {
    roundActual++;

    const label = document.getElementById('clasifica-round-label');
    if (label) label.textContent = `${roundActual} / ${TOTAL_RONDAS}`;

    actualizarProgresoRonda();
    App.sumarPuntos(1);

    setTimeout(() => {
      if (roundActual < TOTAL_RONDAS) {
        iniciarRonda();
      } else {
        finalizarModulo();
      }
    }, 1);
  }

  function finalizarModulo() {
    App.marcarTareaCompletada('clasifica');
    App.sumarPuntos(1);

    App.hablarVoz('Muy bien, terminaste');
    setTimeout(() => App.navigate('home'), 1200);
  }

  return { init };

})();