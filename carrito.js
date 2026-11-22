/* ===========================================================
   carrito.js — Lógica del carrito de compras
   - Estado del carrito (arreglo de objetos {id, cantidad})
   - Persistencia con localStorage (RF07)
   - Cálculos de subtotales, envío y total (RF04)
   =========================================================== */

const CLAVE_CARRITO = "indusproCarrito";
const COSTO_ENVIO = 15000;            // Costo de envío fijo (COP)
const ENVIO_GRATIS_DESDE = 500000;    // Envío gratis si el subtotal lo alcanza
const CANTIDAD_MAXIMA = 99;

let carrito = [];                     // [{ id: 1, cantidad: 2 }, ...]

/* ---------- Utilidades ---------- */

/** Formatea un número como pesos colombianos. Ej: 45900 -> "$45.900 COP" */
function formatearCOP(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO") + " COP";
}

/** Busca un producto del catálogo por su id. */
function buscarProducto(id) {
  return PRODUCTOS.find(function (p) { return p.id === id; });
}

/** Busca una línea del carrito por id de producto. */
function buscarLinea(id) {
  return carrito.find(function (item) { return item.id === id; });
}

/* ---------- Persistencia (localStorage) ---------- */

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (e) {
    console.warn("No se pudo guardar el carrito en localStorage:", e);
  }
}

function cargarCarrito() {
  carrito = [];
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (Array.isArray(datos)) {
      // Se valida cada línea: el producto debe existir y la cantidad ser válida
      datos.forEach(function (item) {
        const cantidad = Math.floor(Number(item && item.cantidad));
        if (item && buscarProducto(item.id) && cantidad >= 1 && !buscarLinea(item.id)) {
          carrito.push({ id: item.id, cantidad: Math.min(cantidad, CANTIDAD_MAXIMA) });
        }
      });
    }
  } catch (e) {
    carrito = [];
  }
}

/* ---------- Operaciones del carrito (RF03) ---------- */

/** Agrega un producto. Si ya existe, incrementa su cantidad (sin duplicar línea). */
function agregarAlCarrito(id) {
  const producto = buscarProducto(id);
  if (!producto) return { ok: false, mensaje: "El producto no existe." };

  const linea = buscarLinea(id);
  if (linea) {
    if (linea.cantidad >= CANTIDAD_MAXIMA) {
      return { ok: false, mensaje: "Alcanzaste la cantidad máxima (" + CANTIDAD_MAXIMA + ") para este producto." };
    }
    linea.cantidad++;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }
  guardarCarrito();
  return { ok: true, producto: producto };
}

/** Establece una cantidad concreta (1 a CANTIDAD_MAXIMA). */
function establecerCantidad(id, cantidad) {
  const linea = buscarLinea(id);
  if (!linea) return;
  let n = Math.floor(Number(cantidad));
  if (isNaN(n) || n < 1) n = 1;
  if (n > CANTIDAD_MAXIMA) n = CANTIDAD_MAXIMA;
  linea.cantidad = n;
  guardarCarrito();
}

/** Elimina individualmente un producto del carrito. */
function eliminarDelCarrito(id) {
  carrito = carrito.filter(function (item) { return item.id !== id; });
  guardarCarrito();
}

/** Vacía por completo el carrito. */
function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
}

/* ---------- Cálculos (RF03, RF04) ---------- */

/** Cantidad total de unidades en el carrito. */
function totalUnidades() {
  let total = 0;
  for (let i = 0; i < carrito.length; i++) {
    total += carrito[i].cantidad;
  }
  return total;
}

/** Subtotal de una línea = precio × cantidad. */
function subtotalLinea(item) {
  return buscarProducto(item.id).precio * item.cantidad;
}

/** Subtotal general = suma de los subtotales de cada línea. */
function subtotalGeneral() {
  let suma = 0;
  carrito.forEach(function (item) { suma += subtotalLinea(item); });
  return suma;
}

/** Costo de envío: $0 con carrito vacío, gratis sobre el umbral, o tarifa fija. */
function calcularEnvio() {
  const subtotal = subtotalGeneral();
  if (subtotal === 0) return 0;
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
}

/** Total a pagar = Subtotal de productos + Costo de envío. */
function calcularTotal() {
  return subtotalGeneral() + calcularEnvio();
}

/* ---------- Validaciones del formulario (RF05) ---------- */

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,80}$/;

/**
 * Valida los datos del comprador.
 * Devuelve un objeto con los mensajes de error por campo (vacío si todo es válido).
 */
function validarDatosComprador(datos) {
  const errores = {};
  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim();
  const telefono = datos.telefono.replace(/[\s\-()]/g, "");
  const direccion = datos.direccion.trim();

  if (nombre === "") errores.nombre = "Ingresa tu nombre completo.";
  else if (!REGEX_NOMBRE.test(nombre)) errores.nombre = "El nombre solo puede contener letras (mínimo 3).";

  if (correo === "") errores.correo = "Ingresa tu correo electrónico.";
  else if (!REGEX_CORREO.test(correo)) errores.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";

  if (telefono === "") errores.telefono = "Ingresa tu número de teléfono.";
  else if (!/^\d{7,10}$/.test(telefono)) errores.telefono = "El teléfono debe tener entre 7 y 10 dígitos numéricos.";

  if (datos.ciudad === "") errores.ciudad = "Selecciona la ciudad de entrega.";

  if (direccion === "") errores.direccion = "Ingresa la dirección de entrega.";
  else if (direccion.length < 8) errores.direccion = "La dirección es muy corta; incluye calle, número y barrio.";

  return errores;
}
