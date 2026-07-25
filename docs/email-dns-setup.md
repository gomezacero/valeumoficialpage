# Autenticación de correo para valeum.co

Estado actual comprobado por DNS: **no hay SPF, ni DKIM, ni DMARC**. El dominio usa Google Workspace (`MX = smtp.google.com`) y su DNS está en **Namecheap** (`dns1/dns2.registrar-servers.com`).

Nada de esto bloquea el sistema de leads —los correos van de `@valeum.co` a `@valeum.co`, entrega interna de Google— pero sin estos registros cualquier correo a un destinatario externo tiene alta probabilidad de caer en spam.

## Dónde se configuran

Namecheap → **Domain List** → `valeum.co` → **Manage** → pestaña **Advanced DNS** → *Add New Record*.

En Namecheap el host raíz se escribe `@` y el TTL puede quedar en *Automatic*.

## 1. SPF — declara quién puede enviar en tu nombre

| Campo | Valor |
|---|---|
| Type | `TXT Record` |
| Host | `@` |
| Value | `v=spf1 include:_spf.google.com ~all` |

Solo puede existir **un** registro SPF por dominio. Si algún día se añade otro emisor (una herramienta de mailing, un CRM), no se crea un segundo registro: se añade su `include:` dentro de este mismo.

El `~all` final es *softfail*: lo que no venga de Google se marca como sospechoso pero no se rechaza. Es lo prudente al empezar; endurecerlo a `-all` conviene solo cuando estés seguro de que no envías desde ningún otro sitio.

## 2. DKIM — firma criptográfica de cada correo

Este registro **no se puede escribir de antemano**: la clave la genera Google y es única por dominio.

1. Entra a **[admin.google.com/ac/apps/gmail/authenticateemail](https://admin.google.com/ac/apps/gmail/authenticateemail)**
2. Selecciona el dominio `valeum.co`
3. **Generar nuevo registro** → elige **2048 bits** y prefijo del selector `google`
4. Google te muestra un valor larguísimo que empieza por `v=DKIM1; k=rsa; p=...`
5. En Namecheap crea:

| Campo | Valor |
|---|---|
| Type | `TXT Record` |
| Host | `google._domainkey` |
| Value | *(el valor que te dio Google, completo)* |

6. Vuelve a la consola de Google y pulsa **Iniciar autenticación**

Si el valor es muy largo, Namecheap lo acepta igual: partirlo en trozos lo hace el propio DNS.

## 3. DMARC — qué hacer con quien falle las comprobaciones

Este va **después** de que SPF y DKIM estén funcionando. Ponerlo antes puede afectar la entrega de correo legítimo.

| Campo | Valor |
|---|---|
| Type | `TXT Record` |
| Host | `_dmarc` |
| Value | `v=DMARC1; p=none; rua=mailto:dmarc@valeum.co` |

`p=none` significa "no hagas nada todavía, solo mándame reportes". Es el modo de observación: durante unas semanas llegan informes de quién envía en nombre del dominio, y cuando confirmes que todo lo legítimo pasa, se sube a `p=quarantine` y más adelante a `p=reject`.

Cambia `dmarc@valeum.co` por el buzón donde quieras recibir esos informes.

## Verificar que quedó bien

La propagación tarda de minutos a unas horas. Para comprobarlo:

```bash
nslookup -type=TXT valeum.co 8.8.8.8
```

```bash
nslookup -type=TXT google._domainkey.valeum.co 8.8.8.8
```

```bash
nslookup -type=TXT _dmarc.valeum.co 8.8.8.8
```

## Contraseña de aplicación para el SMTP

Aparte de lo anterior, el envío necesita una cuenta de Workspace y una contraseña de aplicación:

1. La cuenta debe tener **verificación en dos pasos activa** (sin eso, la opción no aparece)
2. **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)** → crear una para "Valeum web"
3. Google da 16 caracteres → esa es `SMTP_PASS`

Límite de envío en Workspace: ~2.000 correos al día, de sobra para este caso.

## quicktipss.com

Mismo diagnóstico: Workspace activo, sin SPF ni DKIM ni DMARC. Su DNS está en otro proveedor (`nameserver0X.mi.com.co`), así que los registros hay que crearlos allí. Los valores son idénticos, cambiando el dominio.
