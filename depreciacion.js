/**
 * depreciacion.js
 * Módulo de Depreciaciones – Matemáticas Financieras
 *
 * Métodos incluidos:
 *   1. Línea recta
 *        D = (C − S) / n                      (igual cada año)
 *   2. Suma de dígitos de los años
 *        D(k) = (C − S) × (n − k + 1) / [n(n + 1) / 2]
 *   3. Saldo decreciente (porcentaje fijo)
 *        tasa = 1 − (S / C)^(1/n)
 *        Valor en libros(k) = C × (1 − tasa)^k
 *
 *   C = costo, S = valor de salvamento, n = vida útil en años, k = año.
 *
 * Todo se calcula en centavos (enteros) para que la tabla siempre sume
 * exactamente la base depreciable (Costo − Salvamento), sin errores de
 * redondeo de decimales.
 *
 * Uso: cargar al final de index.html con
 *   <script src="depreciacion.js" defer></script>
 */
(function () {
  'use strict';

  /* ===================================================================
     1. LÓGICA DE CÁLCULO (funciones puras, no tocan el DOM)
     =================================================================== */

  const METODOS = ['linea-recta', 'suma-digitos', 'saldo-decreciente'];
  const MAX_VIDA_UTIL = 100;
  const MAX_COSTO = 1e12;

  const aCentavos = (pesos) => Math.round(pesos * 100);

  /**
   * Valor en libros teórico (en centavos, sin redondear) al terminar el año k.
   */
  function valorEnLibrosTeorico(metodo, costoC, salvC, vida, k) {
    const baseC = costoC - salvC;

    switch (metodo) {
      case 'linea-recta':
        return costoC - (baseC * k) / vida;

      case 'suma-digitos': {
        const sumaDigitos = (vida * (vida + 1)) / 2;
        // Suma de los pesos de los años 1..k: (n) + (n-1) + ... + (n-k+1)
        const acumulado = (k * (2 * vida - k + 1)) / 2;
        return costoC - (baseC * acumulado) / sumaDigitos;
      }

      case 'saldo-decreciente':
        // Equivale a C × (1 − tasa)^k con tasa = 1 − (S/C)^(1/n)
        return costoC * Math.pow(salvC / costoC, k / vida);

      default:
        throw new Error('Método de depreciación no válido: ' + metodo);
    }
  }

  /**
   * Valida los datos. Devuelve null si todo está bien, o un objeto
   * { campo, mensaje } con el primer error encontrado.
   * `campo` es: 'costo' | 'salvamento' | 'vida' | 'metodo'.
   */
  function validarDatos(datos) {
    const { costo, salvamento, vida, metodo } = datos;

    if (!Number.isFinite(costo)) {
      return { campo: 'costo', mensaje: 'Ingresa el costo del activo.' };
    }
    if (costo <= 0) {
      return { campo: 'costo', mensaje: 'El costo del activo debe ser mayor que 0.' };
    }
    if (costo > MAX_COSTO) {
      return { campo: 'costo', mensaje: 'El costo del activo es demasiado grande.' };
    }

    if (!Number.isFinite(salvamento)) {
      return { campo: 'salvamento', mensaje: 'Ingresa el valor de salvamento (puede ser 0).' };
    }
    if (salvamento < 0) {
      return { campo: 'salvamento', mensaje: 'El valor de salvamento no puede ser negativo.' };
    }
    if (aCentavos(salvamento) >= aCentavos(costo)) {
      return {
        campo: 'salvamento',
        mensaje: 'El valor de salvamento debe ser menor que el costo del activo.'
      };
    }

    if (!Number.isFinite(vida)) {
      return { campo: 'vida', mensaje: 'Ingresa la vida útil en años.' };
    }
    if (!Number.isInteger(vida) || vida < 1) {
      return { campo: 'vida', mensaje: 'La vida útil debe ser un número entero de años (mínimo 1).' };
    }
    if (vida > MAX_VIDA_UTIL) {
      return { campo: 'vida', mensaje: 'La vida útil no puede ser mayor a ' + MAX_VIDA_UTIL + ' años.' };
    }

    if (METODOS.indexOf(metodo) === -1) {
      return { campo: 'metodo', mensaje: 'Selecciona un método de depreciación.' };
    }
    if (metodo === 'saldo-decreciente' && aCentavos(salvamento) === 0) {
      return {
        campo: 'salvamento',
        mensaje: 'El método de saldo decreciente necesita un valor de salvamento mayor que 0.'
      };
    }

    return null;
  }

  /**
   * Calcula la tabla de depreciación completa.
   * Debe llamarse con datos ya validados (ver validarDatos).
   *
   * @param {{costo:number, salvamento:number, vida:number, metodo:string}} datos
   * @returns {{
   *   baseDepreciable:number,
   *   depreciacionPrimerAnio:number,
   *   totalDepreciacion:number,
   *   filas:Array<{anio:number, depreciacion:number, acumulada:number, valorEnLibros:number}>
   * }}
   */
  function calcularDepreciacion(datos) {
    const { costo, salvamento, vida, metodo } = datos;

    const costoC = aCentavos(costo);
    const salvC = aCentavos(salvamento);

    // Valor en libros al final de cada año, en centavos enteros.
    // El año 0 es el costo y el último año siempre termina exactamente en el salvamento.
    const libros = [costoC];
    for (let k = 1; k <= vida; k++) {
      libros.push(
        k === vida
          ? salvC
          : Math.round(valorEnLibrosTeorico(metodo, costoC, salvC, vida, k))
      );
    }

    const filas = [];
    for (let k = 1; k <= vida; k++) {
      filas.push({
        anio: k,
        depreciacion: (libros[k - 1] - libros[k]) / 100,
        acumulada: (costoC - libros[k]) / 100,
        valorEnLibros: libros[k] / 100
      });
    }

    return {
      baseDepreciable: (costoC - salvC) / 100,
      depreciacionPrimerAnio: filas[0].depreciacion,
      totalDepreciacion: (costoC - salvC) / 100,
      filas: filas
    };
  }

  // Permite probar la lógica en Node sin navegador.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calcularDepreciacion, validarDatos };
  }

  /* ===================================================================
     2. INTERFAZ (conexión con el HTML)
     =================================================================== */

  if (typeof document === 'undefined') return;

  const $ = (id) => document.getElementById(id);

  const form = $('depreciation-form');
  if (!form) return; // La página no tiene el módulo: no hacer nada.

  const campos = {
    costo: $('depreciacion-costo'),
    salvamento: $('depreciacion-salvamento'),
    vida: $('depreciacion-vida'),
    metodo: $('depreciacion-metodo')
  };

  const ui = {
    anual: $('resultado-depreciacion-anual'),
    base: $('resultado-depreciacion-base'),
    cuerpoTabla: $('tabla-depreciacion-body'),
    total: $('total-depreciacion'),
    formula: $('depreciation-formula'),
    error: $('depreciacion-error')
  };

  const FORMULAS = {
    'linea-recta': 'Depreciación anual = (Costo − Salvamento) ÷ Vida útil',
    'suma-digitos': 'Depreciación del año k = (Costo − Salvamento) × (n − k + 1) ÷ [n(n + 1) ÷ 2]',
    'saldo-decreciente': 'Tasa fija = 1 − (Salvamento ÷ Costo)^(1/n); Depreciación = Valor en libros × Tasa'
  };

  const formatoMoneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
  const dinero = (valor) => formatoMoneda.format(valor);

  // Copia de la fila "Aún no hay datos" para poder restaurarla al limpiar.
  const filaVaciaOriginal = $('tabla-depreciacion-vacia');
  const plantillaFilaVacia = filaVaciaOriginal ? filaVaciaOriginal.cloneNode(true) : null;

  function leerDatos() {
    return {
      costo: campos.costo.valueAsNumber,
      salvamento: campos.salvamento.valueAsNumber,
      vida: campos.vida.valueAsNumber,
      metodo: campos.metodo.value
    };
  }

  function limpiarError() {
    if (ui.error) {
      ui.error.hidden = true;
      ui.error.textContent = '';
    }
    Object.keys(campos).forEach((nombre) => campos[nombre].removeAttribute('aria-invalid'));
  }

  function mostrarError(error) {
    const campo = campos[error.campo];
    if (ui.error) {
      ui.error.textContent = error.mensaje;
      ui.error.hidden = false;
    }
    if (campo) {
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
    }
  }

  function crearFila(fila) {
    const tr = document.createElement('tr');

    const anio = document.createElement('th');
    anio.scope = 'row';
    anio.textContent = String(fila.anio);
    tr.appendChild(anio);

    [fila.depreciacion, fila.acumulada, fila.valorEnLibros].forEach((valor) => {
      const td = document.createElement('td');
      td.className = 'num';
      td.textContent = dinero(valor);
      tr.appendChild(td);
    });

    return tr;
  }

  function mostrarResultados(resultado) {
    ui.anual.textContent = dinero(resultado.depreciacionPrimerAnio);
    ui.base.textContent = dinero(resultado.baseDepreciable);
    ui.total.textContent = dinero(resultado.totalDepreciacion);

    const fragmento = document.createDocumentFragment();
    resultado.filas.forEach((fila) => fragmento.appendChild(crearFila(fila)));
    ui.cuerpoTabla.replaceChildren(fragmento);
  }

  function restablecerResultados() {
    ui.anual.textContent = dinero(0);
    ui.base.textContent = dinero(0);
    ui.total.textContent = dinero(0);
    if (plantillaFilaVacia) {
      ui.cuerpoTabla.replaceChildren(plantillaFilaVacia.cloneNode(true));
    } else {
      ui.cuerpoTabla.replaceChildren();
    }
  }

  function actualizarFormula() {
    if (ui.formula && FORMULAS[campos.metodo.value]) {
      ui.formula.textContent = FORMULAS[campos.metodo.value];
    }
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Evita que la página se recargue.
    limpiarError();

    const datos = leerDatos();
    const error = validarDatos(datos);
    if (error) {
      restablecerResultados();
      mostrarError(error);
      return;
    }

    mostrarResultados(calcularDepreciacion(datos));
  });

  form.addEventListener('reset', () => {
    limpiarError();
    restablecerResultados();
    // El navegador restaura el <select> después del evento "reset".
    setTimeout(actualizarFormula, 0);
  });

  campos.metodo.addEventListener('change', actualizarFormula);
  actualizarFormula();
})();
