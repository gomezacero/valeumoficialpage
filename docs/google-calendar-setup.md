# Configuración de Google Calendar

Estado de la integración que detecta las reservas y envía el correo de "reunión agendada".

## GCP y Workspace son cosas separadas

No hay que "vincular el dominio a GCP": son dos productos distintos y el puente entre ellos es un único dato, el **Client ID** de la cuenta de servicio.

- El **proyecto de Cloud** (`valeum-bb990`) es propiedad de una cuenta `@gmail.com` personal. Es perfectamente válido y ya funciona: ahí vive la cuenta de servicio y su clave.
- El **Workspace** de `valeum.co` es donde están los buzones y calendarios de Jesús y Harry, y donde se autoriza al Client ID a leerlos.

No hace falta mover el proyecto, ni crear una organización de GCP, ni verificar el dominio en Cloud. Que `gcloud organizations list` devuelva vacío es solo consecuencia de que el proyecto se creó desde una cuenta personal, y no afecta en nada a esta integración.

**El envío de correo tampoco pasa por GCP.** El SMTP usa una cuenta de Workspace de `valeum.co` con una contraseña de aplicación; el proyecto de Cloud no interviene.

### Comprobado por DNS

| Dominio | MX | Conclusión |
|---|---|---|
| `valeum.co` | `smtp.google.com` | Google Workspace activo — la delegación de dominio es posible |
| `quicktipss.com` | `smtp.google.com` | Google Workspace activo |

`valeum.co` apunta además a Vercel (`www` → `vercel-dns`), así que es el dominio del sitio en producción.

## Ya está hecho

Creado con `gcloud` en el proyecto **`valeum-bb990`** (nombre: *valeum*):

| Elemento | Valor |
|---|---|
| Google Calendar API | Habilitada (`calendar-json.googleapis.com`) |
| Cuenta de servicio | `valeum-calendar@valeum-bb990.iam.gserviceaccount.com` |
| **Client ID (ID único)** | **`111921652134743769433`** |
| Clave privada | Generada y guardada en el `.env` local |

La cuenta de servicio **no tiene ningún rol de IAM** a propósito: sus permisos no vienen del proyecto de Cloud sino de la delegación de dominio, así que asignarle roles solo ampliaría la superficie sin aportar nada.

## Falta: autorizar la delegación de dominio

Este paso **no tiene API pública**: se hace a mano en la consola de administración y **requiere un superadministrador** del Google Workspace.

En [admin.google.com](https://admin.google.com):

1. **Seguridad → Control de acceso y de datos → Controles de API**
2. Abajo: **Gestionar delegación de todo el dominio** → **Añadir nueva**
3. **ID de cliente:**

```
111921652134743769433
```

4. **Ámbitos de OAuth** (exactamente esta cadena, sin espacios):

```
https://www.googleapis.com/auth/calendar.readonly
```

5. **Autorizar**

Es solo lectura: el sistema nunca crea ni modifica eventos, únicamente detecta las reservas que ya existen.

La propagación suele tardar minutos, aunque Google se reserva hasta 24 horas.

## Falta: los correos de Workspace

En el `.env` local y en las variables de Vercel:

```
JESUS_CALENDAR_ID="jesus@eldominio.com"
HARRY_CALENDAR_ID="harry@eldominio.com"
```

Son simplemente sus correos de Workspace: la cuenta de servicio los suplanta para leer su calendario principal.

## Comprobar que quedó bien

```bash
npm run check:google
```

Verifica las variables, la delegación y la lectura de ambos calendarios, y traduce los errores típicos a su causa concreta:

| Error | Causa |
|---|---|
| `unauthorized_client` | El Client ID no está autorizado, o el ámbito no coincide carácter por carácter. También aparece si aún no se ha propagado. |
| `invalid_grant` | El correo suplantado no existe en el dominio, o la clave está mal copiada. |
| `403 accessNotConfigured` | La Calendar API no está habilitada (ya lo está en `valeum-bb990`). |

## Requisito: tiene que ser Workspace

La delegación de dominio **solo existe en Google Workspace con dominio propio**. Confirmado por DNS que `valeum.co` lo tiene, así que este camino es viable. Si los calendarios estuvieran en cuentas `@gmail.com` personales, habría que cambiar el enfoque a OAuth con consentimiento individual de cada uno.

## Pendiente aparte: SPF y DKIM

Ni `valeum.co` ni `quicktipss.com` tienen registros TXT: **no hay SPF ni DKIM configurados**.

Para lo que hace este sistema hoy no es bloqueante, porque los correos van de una cuenta `@valeum.co` a `jesus@valeum.co` y `harry@valeum.co` — mismo dominio, entrega interna de Google, sin filtros severos de por medio.

Conviene configurarlos igualmente: es gratis, son dos registros DNS, y en cuanto se envíe cualquier correo a un destinatario externo (un lead, por ejemplo) la diferencia entre bandeja de entrada y spam la marcan justamente SPF y DKIM.

## Rotar la clave

Si la clave se filtra o hay que renovarla:

```bash
gcloud iam service-accounts keys list --iam-account=valeum-calendar@valeum-bb990.iam.gserviceaccount.com --project=valeum-bb990 --managed-by=user
```

```bash
gcloud iam service-accounts keys delete <KEY_ID> --iam-account=valeum-calendar@valeum-bb990.iam.gserviceaccount.com --project=valeum-bb990
```

Al crear la nueva, no vuelques el JSON a la consola: escribe el archivo y extrae los campos desde ahí. La delegación de dominio **no** hay que rehacerla — está atada al Client ID de la cuenta, no a la clave.
