/**
 * MÓDULO: CLASIFICA
 */

const ModuloClasifica = (() => {

  const TOTAL_RONDAS = 4;

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

  function init() {
    const screen = document.getElementById('screen-clasifica');
    if (!screen) return;

    roundActual = 0;

    screen.innerHTML = `
      <div class="clasifica-header">
        <button class="nav-back" onclick="App.navigate('home')">← Inicio</button>
      </div>

      <div class="clasifica-content">

        <div class="clasifica-instruccion">
          <h2>Clasifica los objetos</h2>
          <p>Toca un objeto y después su grupo 👆</p>
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
    App.hablarVoz('Toca un objeto y luego su grupo');
  }

  function iniciarRonda() {
    if (roundActual >= TOTAL_RONDAS) {
      finalizarModulo();
      return;
    }

    objetoElegido = null;
    clasificados  = 0;

    setActual = SETS[roundActual % SETS.length];

    objetos = setActual.objetos
      .map(o => ({ ...o, clasificado: false }))
      .sort(() => Math.random() - 0.5);

    renderObjetos();
    renderCategorias();

    App.hablarVoz(`Busca ${setActual.categorias[0].nombre} y ${setActual.categorias[1].nombre}`);
  }

  function renderObjetos() {
    const wrap = document.getElementById('clasifica-objetos');
    wrap.innerHTML = '';

    objetos.forEach((obj, i) => {
      const item = document.createElement('div');
      item.className = 'clasifica-item';
      item.dataset.index = i;
      item.textContent = obj.emoji;

      if (obj.clasificado) {
        item.classList.add('clasificado');
      } else {
        item.addEventListener('click', () => elegirObjeto(i));
      }

      wrap.appendChild(item);
    });
  }

  function renderCategorias() {
    const wrap = document.getElementById('clasifica-categorias');
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
      App.hablarVoz('Primero toca un objeto');
      return;
    }

    const obj = objetos[objetoElegido];

    if (obj.cat === catId) {
      obj.clasificado = true;
      clasificados++;

      const zona = document.getElementById(`zona-${catId}`);
      if (zona) {
        const mini = document.createElement('span');
        mini.textContent = obj.emoji;
        zona.appendChild(mini);
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
      App.hablarVoz('Intenta otra vez');
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