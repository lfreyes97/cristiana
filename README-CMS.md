# CMS v1 - Flujo Editorial

## Estados editoriales

- `draft`: borrador.
- `review`: en revisión editorial.
- `approved`: aprobado para publicación.
- `scheduled`: programado para publicarse en `publishAt`.
- `published`: publicado.

`status` es la fuente de verdad.  
Por compatibilidad, si no hay `status`:
- `draft: true` -> `draft`
- `draft: false` -> `published`

## Frontmatter soportado

- `status?: "draft" | "review" | "approved" | "scheduled" | "published"`
- `publishAt?: string` (ISO datetime)
- `updatedDate?: string`
- `seo?: { title?: string; description?: string; canonical?: string; ogImage?: string }`

## Reglas de validación

En `POST /api/cms/content`:

- `status` debe ser válido.
- Si `status = "scheduled"`, `publishAt` es obligatorio y válido.
- `blog` requiere `title`, `description`, `category`, `pubDate`.
- `citas` requiere `title`, `author`, `category`, `pubDate`.
- Si `status` es `published` o `scheduled`, se valida preflight de publicación.

Errores de validación:

```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "publishAt": "publishAt es obligatorio cuando el estado es scheduled."
  }
}
```

## Seguridad CMS

`POST /api/cms/auth` incluye:

- Rate limit en memoria por IP: `5 intentos / 10 minutos`.
- Cookie de sesión `httpOnly`, `secure` (prod), `sameSite=lax`, `maxAge=7d`.

## Pruebas manuales sugeridas

1. Login válido devuelve `200` y permite acceso a `/api/cms/content`.
2. 6 intentos de login inválido dentro de 10 min devuelve `429`.
3. Guardar `blog` con `status=scheduled` y sin `publishAt` devuelve `422`.
4. Guardar con `status` inválido devuelve `422`.
5. Crear archivo legado con `draft: true` y verificar `effectiveStatus=draft` en listado.
6. Verificar filtro de estados y badges en la tabla de colección.
7. Cambiar estado a `scheduled` y confirmar que aparece `publishAt` en metadatos.
