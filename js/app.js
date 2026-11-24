/* ===========================================================
   app.js — Interfaz de usuario: renderizado del DOM y eventos
   Depende de productos.js y carrito.js
   =========================================================== */

/* ---------- Referencias al DOM ---------- */
const $ = function (sel) { return document.querySelector(sel); };

const elCatalogo = $("#catalogoGrid");
const elResultados = $("#resultados");
const elBuscador = $("#buscador");
const elCategoria = $("#categoria");
const elOrden = $("#orden");
const elCarritoCuerpo = $("#carritoCuerpo");
const elCarritoVacio = $("#carritoVacio");
const elCarritoContenido = $("#carritoContenido");
const elContador = $("#contadorCarrito");
const elBtnFinalizar = $("#btnFinalizar");
const elBtnVaciar = $("#btnVaciar");
const elFormulario = $("#formCompra");
const elAviso = $("#avisoCompra");
const elModal = $("#modalCompra");

/* ---------- Utilidades de interfaz ---------- */

/** Muestra una notificación temporal (tipo: ok | aviso | error). */
function mostrarToast(mensaje, tipo) {
  const toast = document.createElement("div");
  toast.className = "toast toast--" + (tipo || "ok");
  toast.textContent = mensaje;
  $("#toasts").appendChild(toast);
  setTimeout(function () { toast.classList.add("toast--salida"); }, 2600);
  setTimeout(function () { toast.remove(); }, 3000);
}

/* ---------- Catálogo (RF02) ---------- */

function llenarCategorias() {
  const categorias = ["Todas"];
  PRODUCTOS.forEach(function (p) {
    if (categorias.indexOf(p.categoria) === -1) categorias.push(p.categoria);
  });
  elCategoria.innerHTML = "";
  categorias.forEach(function (cat) {
    const op = document.createElement("option");
    op.value = cat;
    op.textContent = cat;
    elCategoria.appendChild(op);
  });
}

/** Devuelve los productos filtrados y ordenados según los controles. */
function obtenerProductosFiltrados() {
  const texto = elBuscador.value.trim().toLowerCase();
  const categoria = elCategoria.value;
  let lista = PRODUCTOS.filter(function (p) {
    const coincideTexto = p.nombre.toLowerCase().includes(texto) ||
                          p.descripcion.toLowerCase().includes(texto);
    const coincideCat = categoria === "Todas" || p.categoria === categoria;
    return coincideTexto && coincideCat;
  });

  switch (elOrden.value) {
    case "menor":  lista.sort(function (a, b) { return a.precio - b.precio; }); break;
    case "mayor":  lista.sort(function (a, b) { return b.precio - a.precio; }); break;
    case "nombre": lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); }); break;
  }
  return lista;
}

function renderizarCatalogo() {
  const lista = obtenerProductosFiltrados();
  elCatalogo.innerHTML = "";

  elResultados.textContent = lista.length === 0
    ? "No se encontraron productos con ese criterio."
    : "Mostrando " + lista.length + " de " + PRODUCTOS.length + " productos";

  lista.forEach(function (p) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";
    tarjeta.innerHTML =
      '<div class="producto__img"><img src="' + p.imagen + '" alt="' + p.nombre + '" loading="lazy" width="400" height="300"></div>' +
      '<div class="producto__cuerpo">' +
        '<span class="producto__cat">' + p.categoria + '</span>' +
        '<h3 class="producto__nombre">' + p.nombre + '</h3>' +
        '<p class="producto__desc">' + p.descripcion + '</p>' +
        '<p class="producto__precio">' + formatearCOP(p.precio) + '</p>' +
        '<button type="button" class="btn btn--primario btn--bloque" data-accion="agregar" data-id="' + p.id + '">Agregar al carrito</button>' +
      '</div>';
    elCatalogo.appendChild(tarjeta);
  });
}

/* ---------- Carrito (RF03, RF04) ---------- */

function renderizarCarrito() {
  const hayProductos = carrito.length > 0;
  elCarritoVacio.hidden = hayProductos;
  elCarritoContenido.hidden = !hayProductos;
  elCarritoCuerpo.innerHTML = "";

  carrito.forEach(function (item) {
    const p = buscarProducto(item.id);
    const fila = document.createElement("tr");
    fila.innerHTML =
      '<td data-label="Producto">' +
        '<div class="item"><img src="' + p.imagen + '" alt="" width="64" height="48">' +
        '<span class="item__nombre">' + p.nombre + '</span></div></td>' +
      '<td data-label="Precio unitario">' + formatearCOP(p.precio) + '</td>' +
      '<td data-label="Cantidad">' +
        '<div class="cantidad">' +
          '<button type="button" class="cantidad__btn" data-accion="restar" data-id="' + p.id + '" aria-label="Disminuir cantidad de ' + p.nombre + '">−</button>' +
          '<input type="number" min="1" max="' + CANTIDAD_MAXIMA + '" value="' + item.cantidad + '" data-accion="cantidad" data-id="' + p.id + '" aria-label="Cantidad de ' + p.nombre + '">' +
          '<button type="button" class="cantidad__btn" data-accion="sumar" data-id="' + p.id + '" aria-label="Aumentar cantidad de ' + p.nombre + '">+</button>' +
        '</div></td>' +
      '<td data-label="Subtotal"><strong>' + formatearCOP(subtotalLinea(item)) + '</strong></td>' +
      '<td class="celda-accion"><button type="button" class="btn btn--peligro btn--pequeno" data-accion="eliminar" data-id="' + p.id + '">Eliminar</button></td>';
    elCarritoCuerpo.appendChild(fila);
  });

  actualizarResumen();
}

/** Actualiza únicamente los totales (sin reconstruir la tabla). */
function actualizarResumen() {
  const unidades = totalUnidades();
  const envio = calcularEnvio();

  $("#totalUnidades").textContent = unidades;
  $("#subtotalGeneral").textContent = formatearCOP(subtotalGeneral());
  $("#costoEnvio").textContent = (carrito.length > 0 && envio === 0) ? "Gratis" : formatearCOP(envio);
  $("#totalPagar").textContent = formatearCOP(calcularTotal());
  elContador.textContent = unidades;

  // Mensaje informativo sobre el envío
  const falta = ENVIO_GRATIS_DESDE - subtotalGeneral();
  $("#notaEnvio").textContent = carrito.length === 0
    ? "Envío fijo de " + formatearCOP(COSTO_ENVIO) + ". ¡Gratis desde " + formatearCOP(ENVIO_GRATIS_DESDE) + "!"
    : (falta > 0
        ? "Te faltan " + formatearCOP(falta) + " para obtener envío gratis."
        : "¡Felicitaciones! Tu envío es gratis.");

  // Con el carrito vacío no se puede finalizar ni vaciar
  elBtnFinalizar.disabled = carrito.length === 0;
  elBtnVaciar.disabled = carrito.length === 0;
  if (carrito.length === 0) {
    mostrarAviso("Agrega al menos un producto al carrito para finalizar la compra.", false);
  } else if (!elAviso.hidden && elAviso.dataset.tipo === "vacio") {
    ocultarAviso();
  }
}

function mostrarAviso(texto, error) {
  elAviso.textContent = texto;
  elAviso.hidden = false;
  elAviso.dataset.tipo = error ? "error" : "vacio";
  elAviso.className = "aviso" + (error ? " aviso--error" : "");
}
function ocultarAviso() { elAviso.hidden = true; elAviso.textContent = ""; }

/* ---------- Eventos del catálogo y del carrito (delegación) ---------- */

elCatalogo.addEventListener("click", function (e) {
  const btn = e.target.closest('[data-accion="agregar"]');
  if (!btn) return;
  const resultado = agregarAlCarrito(Number(btn.dataset.id));
  if (resultado.ok) {
    renderizarCarrito();
    mostrarToast("«" + resultado.producto.nombre + "» agregado al carrito.", "ok");
    elContador.classList.remove("insignia--pulso");
    void elContador.offsetWidth;            // reinicia la animación
    elContador.classList.add("insignia--pulso");
  } else {
    mostrarToast(resultado.mensaje, "aviso");
  }
});

elCarritoCuerpo.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-accion]");
  if (!btn || btn.tagName !== "BUTTON") return;
  const id = Number(btn.dataset.id);
  const linea = buscarLinea(id);
  if (!linea) return;

  switch (btn.dataset.accion) {
    case "sumar":
      if (linea.cantidad >= CANTIDAD_MAXIMA) { mostrarToast("Cantidad máxima alcanzada.", "aviso"); return; }
      establecerCantidad(id, linea.cantidad + 1);
      break;
    case "restar":
      if (linea.cantidad <= 1) { mostrarToast("La cantidad mínima es 1. Usa «Eliminar» para quitar el producto.", "aviso"); return; }
      establecerCantidad(id, linea.cantidad - 1);
      break;
    case "eliminar": {
      const nombre = buscarProducto(id).nombre;
      eliminarDelCarrito(id);
      mostrarToast("«" + nombre + "» eliminado del carrito.", "aviso");
      break;
    }
  }
  renderizarCarrito();
});

// Cambio manual de la cantidad escrita en el campo numérico
elCarritoCuerpo.addEventListener("change", function (e) {
  if (e.target.dataset.accion !== "cantidad") return;
  establecerCantidad(Number(e.target.dataset.id), e.target.value);
  renderizarCarrito();
});

elBtnVaciar.addEventListener("click", function () {
  if (carrito.length === 0) return;
  if (confirm("¿Seguro que deseas vaciar todo el carrito?")) {
    vaciarCarrito();
    renderizarCarrito();
    mostrarToast("El carrito fue vaciado.", "aviso");
  }
});

/* ---------- Filtros del catálogo ---------- */
[elBuscador, elCategoria, elOrden].forEach(function (el) {
  el.addEventListener("input", renderizarCatalogo);
});

/* ---------- Finalizar compra (RF05) ---------- */

function limpiarErrores() {
  elFormulario.querySelectorAll(".error").forEach(function (s) { s.textContent = ""; });
  elFormulario.querySelectorAll("input, select").forEach(function (c) { c.classList.remove("invalido"); });
}

function mostrarErrores(errores) {
  limpiarErrores();
  Object.keys(errores).forEach(function (campo) {
    const input = $("#" + (campo === "correo" ? "correo" : campo));
    const msg = $("#err-" + campo);
    if (msg) msg.textContent = errores[campo];
    if (input) { input.classList.add("invalido"); input.setAttribute("aria-invalid", "true"); }
  });
}

elFormulario.addEventListener("submit", function (e) {
  e.preventDefault();

  // 1. Debe haber al menos un producto
  if (carrito.length === 0) {
    mostrarAviso("Tu carrito está vacío. Agrega productos antes de finalizar la compra.", true);
    mostrarToast("No puedes finalizar una compra con el carrito vacío.", "error");
    return;
  }

  // 2. Validar campos obligatorios
  const datos = {
    nombre: $("#nombre").value,
    correo: $("#correo").value,
    telefono: $("#telefono").value,
    ciudad: $("#ciudad").value,
    direccion: $("#direccion").value
  };
  const errores = validarDatosComprador(datos);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    mostrarAviso("Revisa los campos marcados: hay información faltante o incorrecta.", true);
    const primero = elFormulario.querySelector(".invalido");
    if (primero) primero.focus();
    return;
  }
  limpiarErrores();
  ocultarAviso();

  // 3. Procesar la compra simulada
  const total = calcularTotal();
  const unidades = totalUnidades();
  const pedido = "IP-" + Date.now().toString().slice(-8);
  const nombre = datos.nombre.trim();

  $("#modalMensaje").textContent = "Gracias, " + nombre + ". Tu compra por " + formatearCOP(total) + " fue procesada correctamente.";
  const detalle = $("#modalDetalle");
  detalle.innerHTML = "";
  [
    ["N.º de pedido", pedido],
    ["Unidades", String(unidades)],
    ["Envío a", $("#direccion").value.trim() + ", " + datos.ciudad],
    ["Confirmación a", datos.correo.trim()]
  ].forEach(function (par) {
    const li = document.createElement("li");
    const b = document.createElement("strong");
    b.textContent = par[0] + ": ";
    li.appendChild(b);
    li.appendChild(document.createTextNode(par[1]));   // textContent: evita inyección de HTML
    detalle.appendChild(li);
  });

  vaciarCarrito();
  renderizarCarrito();
  elFormulario.reset();
  elFormulario.querySelectorAll("[aria-invalid]").forEach(function (c) { c.removeAttribute("aria-invalid"); });

  if (typeof elModal.showModal === "function") elModal.showModal();
  else alert($("#modalMensaje").textContent);
});

// Limpia el error de un campo en cuanto el usuario lo corrige
elFormulario.addEventListener("input", function (e) {
  const campo = e.target;
  if (!campo.id) return;
  const msg = $("#err-" + campo.id);
  if (msg && msg.textContent) { msg.textContent = ""; campo.classList.remove("invalido"); campo.removeAttribute("aria-invalid"); }
});

$("#modalCerrar").addEventListener("click", function () {
  elModal.close();
  location.hash = "#catalogo";
});

/* ---------- Menú móvil (RF06) ---------- */
const menuBtn = $("#menuBtn");
const menu = $("#menuPrincipal");

menuBtn.addEventListener("click", function () {
  const abierto = menu.classList.toggle("menu--abierto");
  menuBtn.setAttribute("aria-expanded", String(abierto));
  menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});
menu.addEventListener("click", function (e) {
  if (e.target.tagName === "A") {
    menu.classList.remove("menu--abierto");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Inicio ---------- */
document.addEventListener("DOMContentLoaded", function () {
  cargarCarrito();          // RF07: recupera el carrito guardado
  llenarCategorias();
  renderizarCatalogo();
  renderizarCarrito();
});
