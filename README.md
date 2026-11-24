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
tienda-virtual/
├── index.html
├── css/
│   └── styles.css       # hoja de estilos externa (Flexbox, Grid, responsive)
├── js/
│   ├── productos.js     # catálogo (arreglo de objetos)
│   ├── carrito.js       # lógica, cálculos, localStorage y validaciones
│   └── app.js           # DOM y eventos
└── img/
    └── *.jpg            # fotos de productos, logo y banner
```

## Ejecutar localmente
Abre `index.html` en el navegador (no requiere servidor).

## Publicar en GitHub Pages
1. Crea un repositorio público (por ejemplo `mi-tienda-virtual`) y sube estos archivos a la raíz.
2. En **Settings → Pages**, elige *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. La tienda quedará en `https://TU-USUARIO.github.io/mi-tienda-virtual/`.

## Créditos de las imágenes
Fotografías de [Wikimedia Commons](https://commons.wikimedia.org/):

| Producto | Autor | Licencia |
|----------|-------|----------|
| Taladro | Fructibus | CC0 |
| Martillo | Santeri Viinamäki | CC BY-SA 4.0 |
| Llave ajustable | Batholith | Dominio público |
| Casco | Batholith | Dominio público |
| Guantes | Imagen aportada por el autor del proyecto | n/a |
| Gafas | Wasiul Bahar | CC BY-SA 4.0 |
| Flexómetro | Evan-Amos | Dominio público |
| Multímetro | Anselm Schüler | CC BY-SA 4.0 |
| Nivel | Evan-Amos | Dominio público |
| Destornilladores | oomlout | CC BY-SA 2.0 |
| Caja de herramientas | Rieul Techer | CC BY-SA 4.0 |
| Chaleco reflectivo | Magnus Mertens | CC BY-SA 2.0 DE |
