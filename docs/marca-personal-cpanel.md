# Conectar jesusmontero.co (cPanel) al backend de Valeum

La web de marca personal está en un cPanel (LiteSpeed, Dongee) y su formulario
—nombre, WhatsApp y email— **no envía los datos a ninguna parte**: solo abre
WhatsApp. Estos leads se pierden.

No hace falta montar nada nuevo en el hosting. cPanel se queda como está: el
HTML llama al backend que ya existe en Vercel.

## Cómo funciona

```
jesusmontero.co (cPanel)
   │  POST https://www.valeum.co/api/contact
   ▼
Vercel  →  valeum_web.leads (source = 'jesusmontero')
        →  correo a jesusmontero@valeum.co
        →  el visitante sigue yendo a WhatsApp, igual que antes
```

El endpoint acepta peticiones solo desde `jesusmontero.co` y `valeum.co`
(lista blanca de CORS en `api/_lib/cors.ts`). Los leads caen en la misma tabla
que los de Valeum y se distinguen por `source`.

## Qué hay que pegar en la web

En el `index.html` del cPanel, **justo antes de `</body>`**:

```html
<script>
(function () {
  var ENDPOINT = "https://www.valeum.co/api/contact";
  var cargadoEn = Date.now();

  // Guarda el lead y sigue con lo que la web ya hacía (abrir WhatsApp).
  window.valeumGuardarLead = function (nombre, whatsapp, email) {
    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre,
          whatsapp: whatsapp,
          email: email,
          source: "jesusmontero",
          page: location.href,
          elapsedMs: Date.now() - cargadoEn,
          website: ""
        }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  };
})();
</script>
```

Después, en el punto donde el formulario abre WhatsApp, añadir **una línea
antes** de la redirección:

```js
window.valeumGuardarLead(v.nombre, v.whatsapp, v.email);
```

`keepalive: true` hace que la petición sobreviva aunque el navegador salte a
WhatsApp inmediatamente. Y todo va dentro de `try/catch`: si el backend
estuviera caído, el visitante iría a WhatsApp igual, sin ver ningún error.

## Cómo comprobar que funciona

Desde cualquier terminal:

```bash
curl -X POST https://www.valeum.co/api/contact -H "Content-Type: application/json" -d '{"name":"Prueba","email":"prueba@test.com","whatsapp":"+573001112233","source":"jesusmontero","page":"https://jesusmontero.co/"}'
```

Debe responder `{"ok":true}`, llegar un correo a Jesús y aparecer la fila:

```sql
select name, email, whatsapp, source, created_at
from valeum_web.leads where source = 'jesusmontero'
order by created_at desc;
```

## Analítica

La web ya tiene su propio GA4 (`G-4LEEKK6BV9`), distinto del de Valeum
(`G-VWXEND98Q9`). Se puede dejar así —cada marca con su propiedad— o unificar.

Si se quiere medir el envío como conversión, añadir dentro de
`valeumGuardarLead`:

```js
if (window.gtag) window.gtag("event", "generate_lead", { source: "jesusmontero" });
```
