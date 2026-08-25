# Configuración de Google Calendar

Cómo el sistema detecta las reservas para enviar el correo de "reunión agendada".

## La forma recomendada: compartir el calendario (sin administrador)

La cuenta de servicio tiene su propia dirección de correo. Un calendario de Google se puede compartir con cualquier dirección, incluida la suya. Así entra con su propia identidad a los calendarios que le hayan compartido, **sin necesidad de ningún permiso de administrador**.

Cada persona lo hace en su Google Calendar, en menos de un minuto:

1. Abre [Google Calendar](https://calendar.google.com)
2. En la barra lateral, sobre su calendario principal, pulsa los **tres puntos** → **Configuración y uso compartido**
3. Baja hasta **Compartir con determinadas personas o grupos** → **Añadir personas**
4. Pega esta dirección:

```
valeum-calendar@valeum-bb990.iam.gserviceaccount.com
```

5. En permisos elige **"Ver todos los detalles del evento"** (hace falta ese nivel: con "ver solo libre/ocupado" no se puede leer quién reservó)
6. **Enviar**

Google puede avisar de que la dirección no parece una cuenta de Google. Es normal en las cuentas de servicio: continúa igualmente.

Lo tienen que hacer **Jesús y Harry**, cada uno con su calendario.

## La alternativa: delegación de dominio (requiere superadministrador)

Da acceso a todo el dominio sin que nadie comparta nada, pero exige que un **superadministrador** del Workspace la autorice. Solo merece la pena si el número de calendarios va a crecer.

Para activarla, pon `GOOGLE_USE_IMPERSONATION=true` en las variables de entorno y autoriza en la consola de administración:

**Seguridad → Control de acceso y datos → Controles de API → Gestionar delegación de todo el dominio → Añadir nueva**

| Campo | Valor |
|---|---|
| ID de cliente | `111921652134743769433` |
| Ámbitos de OAuth | `https://www.googleapis.com/auth/calendar.readonly` |

Sin esa variable, el sistema usa el modo compartido y esta sección no hace falta.

## Lo que ya está hecho

Creado con `gcloud` en el proyecto **`valeum-bb990`**:

| Elemento | Valor |
|---|---|
| Google Calendar API | Habilitada |
| Cuenta de servicio | `valeum-calendar@valeum-bb990.iam.gserviceaccount.com` |
| Client ID | `111921652134743769433` |
| Clave privada | Generada y configurada en Vercel |

La cuenta de servicio no tiene ningún rol de IAM a propósito: su acceso viene de los calendarios que le comparten, no del proyecto de Cloud.

### Sobre el Workspace

Comprobado: `valeum.co` es **dominio secundario** del Workspace de `quicktipss.com` (organización *Capital Quick*), y los buzones `jesusmontero@valeum.co` y `harry@valeum.co` existen en él.

## Comprobar que quedó bien

```bash
npm run check:google
```

| Mensaje | Significado |
|---|---|
| ✓ Token obtenido + ✓ Calendario leído | Todo listo |
| ✓ Token obtenido + ✗ 404 | Falta que esa persona comparta su calendario |
| ✗ `unauthorized_client` | Estás en modo delegación y no está autorizada |
| ✗ `invalid_grant` | El correo no existe en el dominio |
| ✗ `403 accessNotConfigured` | La Calendar API no está habilitada |

## Rotar la clave

```bash
gcloud iam service-accounts keys list --iam-account=valeum-calendar@valeum-bb990.iam.gserviceaccount.com --project=valeum-bb990 --managed-by=user
```

```bash
gcloud iam service-accounts keys delete <KEY_ID> --iam-account=valeum-calendar@valeum-bb990.iam.gserviceaccount.com --project=valeum-bb990
```

Al crear la nueva, no vuelques el JSON a la consola: escribe el archivo y extrae los campos desde ahí. Los calendarios compartidos siguen funcionando: el permiso está atado a la dirección de la cuenta, no a la clave.
