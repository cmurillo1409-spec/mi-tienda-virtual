# IndusPro — Tienda virtual de herramientas y suministros industriales

Examen Final · Programación Web · Ingeniería Industrial.
E-commerce funcional hecho solo con **HTML5, CSS3 y JavaScript** (sin frameworks ni backend). Los precios están en **pesos colombianos (COP)**.

## Funcionalidades

| Requisito | Implementación |
|-----------|----------------|
| RF01 Página principal | Logo, nombre, menú, banner, presentación, acceso a catálogo y carrito, pie con contacto |
| RF02 Catálogo | 12 productos con imagen, nombre, descripción, precio COP y botón "Agregar al carrito" (+ búsqueda, filtro por categoría y orden) |
| RF03 Carrito | Agregar, ver, cambiar cantidad (+/−/campo), eliminar, vaciar, total de unidades, sin líneas duplicadas |
| RF04 Cálculos | Subtotal por producto, subtotal general, envío ($15.000 COP; gratis desde $500.000) y **Total = Subtotal + Envío**. Carrito vacío = $0 COP |
| RF05 Compra simulada | Formulario (nombre, correo, teléfono, ciudad, dirección) con validación y mensaje de confirmación con nombre y total |
| RF06 Navegación / UX | Menú funcional con anclas, menú hamburguesa móvil, avisos y confirmaciones, diseño responsive |
| RF07 Persistencia | `localStorage`: el carrito sobrevive al recargar la página |

## Estructura

```
├── index.html
├── styles.css       # hoja de estilos externa (Flexbox, Grid, responsive)
├── productos.js     # catálogo (arreglo de objetos)
├── carrito.js       # lógica, cálculos, localStorage y validaciones
├── app.js           # DOM y eventos
├── *.jpg            # fotos reales de los productos (Wikimedia Commons)
└── logo.svg, banner.svg
```

## Ejecutar localmente
Abre `index.html` en el navegador (no requiere servidor).

## Publicar en GitHub Pages
1. Crea un repositorio público (por ejemplo `mi-tienda-virtual`) y sube estos archivos a la raíz.
2. En **Settings → Pages**, elige *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. La tienda quedará en `https://TU-USUARIO.github.io/mi-tienda-virtual/`.

## Créditos de las imágenes
Fotografías de [Wikimedia Commons](https://commons.wikimedia.org/) (CC0, dominio público y CC BY-SA). La autoría y la licencia de cada una están en el pie de página del sitio.
