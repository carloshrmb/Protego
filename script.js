/* ============================================================
   PROTEGO — script.js
   Comportamientos: navbar, smooth scroll, menú móvil,
   validación de formulario, animaciones de entrada,
   activación de barras del reporte.
============================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────
   1. NAVBAR: sombra al hacer scroll + clase activa en enlace
──────────────────────────────────────────────────────────── */
(function iniciarNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  /* Sombra cuando el usuario baja de la posición inicial */
  function actualizarNavbar() {
    if (window.scrollY > 10) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', actualizarNavbar, { passive: true });
  actualizarNavbar();
})();


/* ────────────────────────────────────────────────────────────
   2. MENÚ HAMBURGUESA (móvil)
──────────────────────────────────────────────────────────── */
(function iniciarHamburguesa() {
  const boton = document.getElementById('hamburguesa');
  const nav   = document.getElementById('navbar-nav');
  if (!boton || !nav) return;

  boton.addEventListener('click', function () {
    const estaAbierto = boton.getAttribute('aria-expanded') === 'true';
    boton.setAttribute('aria-expanded', String(!estaAbierto));
    nav.classList.toggle('navbar__nav--abierto', !estaAbierto);
  });

  /* Cerrar el menú al hacer clic en un enlace */
  nav.querySelectorAll('.navbar__enlace').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      boton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('navbar__nav--abierto');
    });
  });

  /* Cerrar con tecla Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('navbar__nav--abierto')) {
      boton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('navbar__nav--abierto');
      boton.focus();
    }
  });
})();


/* ────────────────────────────────────────────────────────────
   3. SMOOTH SCROLL para anclas internas
      (respaldo para navegadores que ignoran scroll-behavior: smooth)
──────────────────────────────────────────────────────────── */
(function iniciarSmoothScroll() {
  /* Altura fija de la navbar para compensar el offset */
  const NAVBAR_ALTO = 68;

  document.querySelectorAll('a[href^="#"]').forEach(function (enlace) {
    enlace.addEventListener('click', function (e) {
      const id = enlace.getAttribute('href').slice(1);
      const destino = document.getElementById(id);
      if (!destino) return;

      e.preventDefault();

      const posicion = destino.getBoundingClientRect().top + window.scrollY - NAVBAR_ALTO;

      window.scrollTo({ top: posicion, behavior: 'smooth' });

      /* Actualizar URL sin recargar */
      history.pushState(null, '', '#' + id);
    });
  });
})();


/* ────────────────────────────────────────────────────────────
   4. ANIMACIONES DE ENTRADA con IntersectionObserver
──────────────────────────────────────────────────────────── */
(function iniciarAnimaciones() {
  /* Si el navegador no soporta IntersectionObserver, mostrar todo */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animar-entrada').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  /* Agregar clase animable a los elementos de las secciones */
  const selectores = [
    '.pilar',
    '.problema__item',
    '.proceso__paso',
    '.manifesto__cita',
    '.seccion__encabezado',
  ];

  selectores.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add('animar-entrada');
      observer.observe(el);
    });
  });
})();


/* ────────────────────────────────────────────────────────────
   5. ACTIVAR BARRAS DE PROGRESO DEL REPORTE
      cuando el mockup entra en el viewport
──────────────────────────────────────────────────────────── */
(function iniciarBarrasReporte() {
  const mockup = document.querySelector('.reporte__mockup');
  if (!mockup) return;

  /* Guardar anchos y colapsar */
  const barras = mockup.querySelectorAll('.reporte__barra');
  const anchosOriginales = [];

  barras.forEach(function (barra) {
    anchosOriginales.push(barra.style.width);
    barra.style.width = '0%';
  });

  let animado = false;

  function activarBarras() {
    if (animado) return;
    animado = true;

    barras.forEach(function (barra, idx) {
      /* Pequeño retraso escalonado para efecto visual */
      setTimeout(function () {
        barra.style.width = anchosOriginales[idx];
      }, idx * 90);
    });
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      function (entradas) {
        if (entradas[0].isIntersecting) {
          activarBarras();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(mockup);
  } else {
    /* Fallback: animar de inmediato */
    activarBarras();
  }
})();


/* ────────────────────────────────────────────────────────────
   6. VALIDACIÓN Y ENVÍO DEL FORMULARIO
──────────────────────────────────────────────────────────── */
(function iniciarFormulario() {
  const form = document.getElementById('formulario-contacto');
  if (!form) return;

  /* Mapa de campos: id → mensaje de error personalizado */
  const campos = [
    { id: 'nombre',  errorId: 'error-nombre',  mensaje: 'Por favor ingrese su nombre completo.' },
    { id: 'cargo',   errorId: 'error-cargo',   mensaje: 'Por favor indique su cargo.' },
    { id: 'empresa', errorId: 'error-empresa', mensaje: 'Por favor ingrese el nombre de su empresa.' },
    { id: 'correo',  errorId: 'error-correo',  mensaje: 'Por favor ingrese un correo electrónico válido.' },
    { id: 'sector',  errorId: 'error-sector',  mensaje: 'Por favor seleccione el sector de su empresa.' },
  ];

  const avisoError = document.getElementById('aviso-error');
  const avisoExito = document.getElementById('aviso-exito');

  /* Limpiar errores de un campo específico al escribir */
  campos.forEach(function (campo) {
    const input = document.getElementById(campo.id);
    const errorEl = document.getElementById(campo.errorId);
    if (!input || !errorEl) return;

    input.addEventListener('input', function () {
      input.classList.remove('formulario__input--error');
      errorEl.textContent = '';
    });
  });

  /* Validar un campo individual; devuelve true si es válido */
  function validarCampo(campo) {
    const input   = document.getElementById(campo.id);
    const errorEl = document.getElementById(campo.errorId);
    if (!input || !errorEl) return true;

    let valido = true;
    const valor = input.value.trim();

    if (!valor) {
      valido = false;
    } else if (campo.id === 'correo') {
      /* Validación básica de formato de correo */
      const reCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      valido = reCorreo.test(valor);
    }

    if (!valido) {
      input.classList.add('formulario__input--error');
      errorEl.textContent = campo.mensaje;
    } else {
      input.classList.remove('formulario__input--error');
      errorEl.textContent = '';
    }

    return valido;
  }

  /* Envío del formulario */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Ocultar avisos previos */
    if (avisoError) avisoError.hidden = true;
    if (avisoExito) avisoExito.hidden = true;

    /* Validar todos los campos */
    let todoValido = true;
    campos.forEach(function (campo) {
      if (!validarCampo(campo)) {
        todoValido = false;
      }
    });

    if (!todoValido) {
      /* Mostrar aviso de error general y enfocar el primer campo inválido */
      if (avisoError) avisoError.hidden = false;

      const primerError = form.querySelector('.formulario__input--error');
      if (primerError) primerError.focus();
      return;
    }

    /* ── Aquí iría la llamada a la API / backend ──────────
       Por ahora simulamos una respuesta exitosa tras 600ms
       para demostrar el flujo de UX.
    ─────────────────────────────────────────────────────── */
    const boton = form.querySelector('.formulario__boton');
    const textoOriginal = boton.textContent;
    boton.textContent = 'Enviando…';
    boton.disabled = true;

    setTimeout(function () {
      /* Resetear formulario */
      form.reset();

      /* Eliminar clases de error residuales */
      form.querySelectorAll('.formulario__input--error').forEach(function (el) {
        el.classList.remove('formulario__input--error');
      });
      campos.forEach(function (campo) {
        const errorEl = document.getElementById(campo.errorId);
        if (errorEl) errorEl.textContent = '';
      });

      /* Mostrar mensaje de éxito */
      if (avisoExito) avisoExito.hidden = false;

      /* Restaurar botón */
      boton.textContent = textoOriginal;
      boton.disabled = false;

      /* Hacer scroll al mensaje de éxito */
      if (avisoExito) {
        avisoExito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 700);
  });
})();
