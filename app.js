/**
 * app.js
 * Lógica principal de Matemáticas Financieras:
 *   - Navegación entre módulos
 *   - Interés Simple (traducido de InteresSimple.java)
 *   - Interés Compuesto (traducido de InteresCompuesto.java)
 *   - Anualidades Vencidas / Anticipadas / Renta (traducido de Leonardo.java)
 *   - Tabla de Amortización Sistema Francés (traducido de Leonardo.java)
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const formatoMoneda = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
  const dinero = (valor) => formatoMoneda.format(valor);

  function mostrarError(elError, mensaje) {
    if (!elError) return;
    elError.textContent = mensaje;
    elError.hidden = false;
  }

  function limpiarError(elError) {
    if (!elError) return;
    elError.hidden = true;
    elError.textContent = '';
  }

  /* ===================================================================
     0. NAVEGACIÓN DEL SIDEBAR (compatibilidad total)
     =================================================================== */
  const navLinks = document.querySelectorAll('.sidebar__link');
  function sincronizarMenu() {
    const hash = window.location.hash || '#interes-simple';
    navLinks.forEach((link) => {
      const activo = link.getAttribute('href') === hash;
      link.classList.toggle('active', activo);
      if (activo) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  window.addEventListener('hashchange', sincronizarMenu);
  sincronizarMenu();

  /* ===================================================================
     1. INTERÉS SIMPLE (InteresSimple.java)
     =================================================================== */
  const formSimple = $('simple-interest-form');
  if (formSimple) {
    const errSimple = $('simple-error');
    const tbodySimple = $('tabla-simple-body');
    const vaciaSimple = $('tabla-simple-vacia')?.cloneNode(true);

    formSimple.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarError(errSimple);

      const capital = $('simple-capital').valueAsNumber;
      const tasa = $('simple-tasa').valueAsNumber;
      const anios = $('simple-tiempo').valueAsNumber;

      if (!Number.isFinite(capital) || capital <= 0) {
        return mostrarError(errSimple, 'El capital inicial debe ser mayor a 0.');
      }
      if (!Number.isFinite(tasa) || tasa < 0) {
        return mostrarError(errSimple, 'La tasa de interés no puede ser negativa.');
      }
      if (!Number.isInteger(anios) || anios < 1 || anios > 100) {
        return mostrarError(errSimple, 'El tiempo debe ser un número entero de años (mínimo 1).');
      }

      const interesTotal = capital * (tasa / 100) * anios;
      const montoTotal = capital + interesTotal;

      $('simple-resultado-monto').textContent = dinero(montoTotal);
      $('simple-resultado-interes').textContent = dinero(interesTotal);

      const interesAnual = capital * (tasa / 100);
      let acumulado = 0;
      const frag = document.createDocumentFragment();

      for (let a = 1; a <= anios; a++) {
        acumulado += interesAnual;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <th scope="row">${a}</th>
          <td class="num">${dinero(interesAnual)}</td>
          <td class="num">${dinero(acumulado)}</td>
          <td class="num">${dinero(capital + acumulado)}</td>
        `;
        frag.appendChild(tr);
      }
      tbodySimple.replaceChildren(frag);
    });

    formSimple.addEventListener('reset', () => {
      limpiarError(errSimple);
      $('simple-resultado-monto').textContent = dinero(0);
      $('simple-resultado-interes').textContent = dinero(0);
      if (vaciaSimple) tbodySimple.replaceChildren(vaciaSimple.cloneNode(true));
    });
  }

  /* ===================================================================
     2. INTERÉS COMPUESTO (InteresCompuesto.java)
     =================================================================== */
  const formCompuesto = $('compound-interest-form');
  if (formCompuesto) {
    const errCompuesto = $('compuesto-error');
    const tbodyCompuesto = $('tabla-compuesto-body');
    const vaciaCompuesto = $('tabla-compuesto-vacia')?.cloneNode(true);

    const calcularMontoCompuesto = (capital, tasaAnual, anios, n) => {
      const i = (tasaAnual / 100) / n;
      return capital * Math.pow(1 + i, n * anios);
    };

    formCompuesto.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarError(errCompuesto);

      const capital = $('compuesto-capital').valueAsNumber;
      const tasa = $('compuesto-tasa').valueAsNumber;
      const anios = $('compuesto-tiempo').valueAsNumber;
      const n = parseInt($('compuesto-frecuencia').value, 10);

      if (!Number.isFinite(capital) || capital <= 0) {
        return mostrarError(errCompuesto, 'El capital inicial debe ser mayor a 0.');
      }
      if (!Number.isFinite(tasa) || tasa < 0) {
        return mostrarError(errCompuesto, 'La tasa nominal no puede ser negativa.');
      }
      if (!Number.isInteger(anios) || anios < 1 || anios > 100) {
        return mostrarError(errCompuesto, 'El tiempo debe ser un número entero de años (mínimo 1).');
      }

      const montoTotal = calcularMontoCompuesto(capital, tasa, anios, n);
      const interesTotal = montoTotal - capital;

      $('compuesto-resultado-monto').textContent = dinero(montoTotal);
      $('compuesto-resultado-interes').textContent = dinero(interesTotal);

      let montoAnterior = capital;
      const frag = document.createDocumentFragment();

      for (let a = 1; a <= anios; a++) {
        const montoActual = calcularMontoCompuesto(capital, tasa, a, n);
        const interesAnio = montoActual - montoAnterior;
        const interesAcum = montoActual - capital;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <th scope="row">${a}</th>
          <td class="num">${dinero(interesAnio)}</td>
          <td class="num">${dinero(interesAcum)}</td>
          <td class="num">${dinero(montoActual)}</td>
        `;
        frag.appendChild(tr);
        montoAnterior = montoActual;
      }
      tbodyCompuesto.replaceChildren(frag);
    });

    formCompuesto.addEventListener('reset', () => {
      limpiarError(errCompuesto);
      $('compuesto-resultado-monto').textContent = dinero(0);
      $('compuesto-resultado-interes').textContent = dinero(0);
      if (vaciaCompuesto) tbodyCompuesto.replaceChildren(vaciaCompuesto.cloneNode(true));
    });
  }

  /* ===================================================================
     3. ANUALIDADES (Leonardo.java)
     =================================================================== */
  const formAnualidad = $('annuities-form');
  if (formAnualidad) {
    const errAnualidad = $('anualidad-error');
    const selectCalculo = $('anualidad-calculo');
    const selectTipo = $('anualidad-tipo');
    const labelMonto = $('anualidad-monto-label');
    const formulaEl = $('anualidad-formula');

    function actualizarEtiquetasAnualidad() {
      const calc = selectCalculo.value;
      const tipo = selectTipo.value;
      const factor = tipo === 'anticipada' ? ' × (1 + i)' : '';

      if (calc === 'vf') {
        labelMonto.textContent = 'Renta periódica (R)';
        formulaEl.innerHTML = `VF = R × [((1 + i)<sup>n</sup> − 1) ÷ i]${factor}`;
      } else if (calc === 'vp') {
        labelMonto.textContent = 'Renta periódica (R)';
        formulaEl.innerHTML = `VP = R × [(1 − (1 + i)<sup>−n</sup>) ÷ i]${factor}`;
      } else if (calc === 'renta-vp') {
        labelMonto.textContent = 'Valor Presente / Préstamo (VP)';
        formulaEl.innerHTML = `R = VP × [i ÷ (1 − (1 + i)<sup>−n</sup>)]${tipo === 'anticipada' ? ' ÷ (1 + i)' : ''}`;
      } else {
        labelMonto.textContent = 'Valor Futuro / Meta (VF)';
        formulaEl.innerHTML = `R = VF × [i ÷ ((1 + i)<sup>n</sup> − 1)]${tipo === 'anticipada' ? ' ÷ (1 + i)' : ''}`;
      }
    }

    selectCalculo.addEventListener('change', actualizarEtiquetasAnualidad);
    selectTipo.addEventListener('change', actualizarEtiquetasAnualidad);

    formAnualidad.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarError(errAnualidad);

      const calc = selectCalculo.value;
      const tipo = selectTipo.value;
      const monto = $('anualidad-monto').valueAsNumber;
      const tasaAnual = $('anualidad-tasa').valueAsNumber;
      const n = $('anualidad-periodos').valueAsNumber;

      if (!Number.isFinite(monto) || monto <= 0) {
        return mostrarError(errAnualidad, 'Ingresa un monto o renta mayor a 0.');
      }
      if (!Number.isFinite(tasaAnual) || tasaAnual < 0) {
        return mostrarError(errAnualidad, 'La tasa de interés no puede ser negativa.');
      }
      if (!Number.isInteger(n) || n < 1 || n > 600) {
        return mostrarError(errAnualidad, 'El número de periodos debe ser un entero entre 1 y 600.');
      }

      const i = (tasaAnual / 100) / 12;
      const factorAnticipada = tipo === 'anticipada' ? (1 + i) : 1;
      let resultadoPrincipal = 0;
      let sumaNominal = 0;

      if (calc === 'vf') {
        resultadoPrincipal = i === 0 ? monto * n : (monto * (Math.pow(1 + i, n) - 1) / i) * factorAnticipada;
        sumaNominal = monto * n;
        $('anualidad-res-titulo').textContent = 'Valor Futuro (VF)';
        $('anualidad-res-hint').textContent = 'Capital total acumulado al finalizar los periodos';
      } else if (calc === 'vp') {
        resultadoPrincipal = i === 0 ? monto * n : (monto * (1 - Math.pow(1 + i, -n)) / i) * factorAnticipada;
        sumaNominal = monto * n;
        $('anualidad-res-titulo').textContent = 'Valor Presente (VP)';
        $('anualidad-res-hint').textContent = 'Valor actual equivalente de todos los pagos';
      } else if (calc === 'renta-vp') {
        resultadoPrincipal = i === 0 ? monto / n : (monto * (i / (1 - Math.pow(1 + i, -n)))) / factorAnticipada;
        sumaNominal = resultadoPrincipal * n;
        $('anualidad-res-titulo').textContent = 'Renta periódica requerida (R)';
        $('anualidad-res-hint').textContent = 'Pago mensual necesario para cubrir el valor presente';
      } else {
        resultadoPrincipal = i === 0 ? monto / n : (monto * (i / (Math.pow(1 + i, n) - 1))) / factorAnticipada;
        sumaNominal = resultadoPrincipal * n;
        $('anualidad-res-titulo').textContent = 'Renta periódica requerida (R)';
        $('anualidad-res-hint').textContent = 'Ahorro mensual necesario para alcanzar la meta';
      }

      $('anualidad-resultado-principal').textContent = dinero(resultadoPrincipal);
      $('anualidad-resultado-secundario').textContent = dinero(sumaNominal);
    });

    formAnualidad.addEventListener('reset', () => {
      limpiarError(errAnualidad);
      $('anualidad-resultado-principal').textContent = dinero(0);
      $('anualidad-resultado-secundario').textContent = dinero(0);
      setTimeout(actualizarEtiquetasAnualidad, 0);
    });
  }

  /* ===================================================================
     4. AMORTIZACIÓN SISTEMA FRANCÉS (Leonardo.java)
     =================================================================== */
  const formAmort = $('amortization-form');
  if (formAmort) {
    const errAmort = $('amortizacion-error');
    const tbodyAmort = $('tabla-amortizacion-body');
    const vaciaAmort = $('tabla-amortizacion-vacia')?.cloneNode(true);

    formAmort.addEventListener('submit', (e) => {
      e.preventDefault();
      limpiarError(errAmort);

      const montoPrestamo = $('amort-monto').valueAsNumber;
      const tasaAnual = $('amort-tasa').valueAsNumber;
      const n = $('amort-plazo').valueAsNumber;

      if (!Number.isFinite(montoPrestamo) || montoPrestamo <= 0) {
        return mostrarError(errAmort, 'El monto del préstamo debe ser mayor a 0.');
      }
      if (!Number.isFinite(tasaAnual) || tasaAnual < 0) {
        return mostrarError(errAmort, 'La tasa de interés no puede ser negativa.');
      }
      if (!Number.isInteger(n) || n < 1 || n > 600) {
        return mostrarError(errAmort, 'El plazo debe ser un número entero de meses (entre 1 y 600).');
      }

      const i = (tasaAnual / 100) / 12;
      const cuota = i === 0
        ? montoPrestamo / n
        : montoPrestamo * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

      let saldoInsoluto = montoPrestamo;
      let totalPagado = 0;
      let totalIntereses = 0;
      let totalAmortizado = 0;

      const frag = document.createDocumentFragment();

      for (let periodo = 1; periodo <= n; periodo++) {
        const interes = saldoInsoluto * i;
        const amortizacion = cuota - interes;
        saldoInsoluto -= amortizacion;

        if (periodo === n && Math.abs(saldoInsoluto) < 1e-2) {
          saldoInsoluto = 0;
        }

        totalPagado += cuota;
        totalIntereses += interes;
        totalAmortizado += amortizacion;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <th scope="row">${periodo}</th>
          <td class="num">${dinero(cuota)}</td>
          <td class="num">${dinero(interes)}</td>
          <td class="num">${dinero(amortizacion)}</td>
          <td class="num">${dinero(Math.max(0, saldoInsoluto))}</td>
        `;
        frag.appendChild(tr);
      }

      $('amort-resultado-cuota').textContent = dinero(cuota);
      $('amort-resultado-intereses').textContent = dinero(totalIntereses);

      tbodyAmort.replaceChildren(frag);
      $('total-pagos').textContent = dinero(totalPagado);
      $('total-intereses').textContent = dinero(totalIntereses);
      $('total-amortizado').textContent = dinero(totalAmortizado);
    });

    formAmort.addEventListener('reset', () => {
      limpiarError(errAmort);
      $('amort-resultado-cuota').textContent = dinero(0);
      $('amort-resultado-intereses').textContent = dinero(0);
      $('total-pagos').textContent = dinero(0);
      $('total-intereses').textContent = dinero(0);
      $('total-amortizado').textContent = dinero(0);
      if (vaciaAmort) tbodyAmort.replaceChildren(vaciaAmort.cloneNode(true));
    });
  }
})();
