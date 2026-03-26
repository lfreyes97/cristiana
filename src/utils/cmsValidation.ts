export const EDITORIAL_STATUSES = [
  "draft",
  "review",
  "approved",
  "scheduled",
  "published",
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export type FieldErrors = Record<string, string>;

export type CmsData = Record<string, any>;

export function getCollectionFromPath(filePath: string): string {
  const first = (filePath || "").split("/")[0];
  return first || "";
}

export function normalizeEditorialFields(input: CmsData): CmsData {
  const data = { ...(input || {}) };

  if (!data.status) {
    if (data.draft === true) data.status = "draft";
    else if (data.draft === false) data.status = "published";
  }

  if (!isValidStatus(data.status)) {
    delete data.status;
  }

  if (data.status) {
    data.draft = data.status !== "published";
  }

  if (typeof data.publishAt === "string") {
    data.publishAt = data.publishAt.trim();
    if (!data.publishAt) delete data.publishAt;
  }

  return data;
}

export function computeEffectiveStatus(
  data: CmsData,
  nowInput: Date = new Date(),
): EditorialStatus {
  const now = nowInput.getTime();
  const normalized = normalizeEditorialFields(data);
  const status = normalized.status as EditorialStatus | undefined;

  if (!status) return "draft";
  if (status !== "scheduled") return status;

  if (!normalized.publishAt) return "scheduled";

  const when = new Date(normalized.publishAt).getTime();
  if (!Number.isFinite(when)) return "scheduled";
  return when <= now ? "published" : "scheduled";
}

export function validateCollectionData(
  collection: string,
  input: CmsData,
): FieldErrors {
  const data = normalizeEditorialFields(input);
  const fieldErrors: FieldErrors = {};
  const status = data.status as EditorialStatus | undefined;

  if (status && !isValidStatus(status)) {
    fieldErrors.status = "Estado editorial inválido.";
  }

  if (status === "scheduled") {
    if (!data.publishAt) {
      fieldErrors.publishAt =
        "publishAt es obligatorio cuando el estado es scheduled.";
    } else {
      const parsed = new Date(data.publishAt).getTime();
      if (!Number.isFinite(parsed)) {
        fieldErrors.publishAt = "publishAt debe ser una fecha/hora válida.";
      }
    }
  }

  if (collection === "blog") {
    requireString(data, "title", "El título es obligatorio.", fieldErrors);
    requireString(
      data,
      "description",
      "La descripción es obligatoria.",
      fieldErrors,
    );
    requireString(data, "category", "La categoría es obligatoria.", fieldErrors);
    requireDateString(data, "pubDate", "pubDate es obligatorio.", fieldErrors);
  }

  if (collection === "citas") {
    requireString(data, "title", "El título es obligatorio.", fieldErrors);
    requireString(data, "author", "El autor es obligatorio.", fieldErrors);
    requireString(data, "category", "La categoría es obligatoria.", fieldErrors);
    requireDateString(data, "pubDate", "pubDate es obligatorio.", fieldErrors);
  }

  if (data.seo && typeof data.seo === "object") {
    const seoTitle = trimOrEmpty(data.seo.title);
    const seoDescription = trimOrEmpty(data.seo.description);
    if (seoTitle && (seoTitle.length < 50 || seoTitle.length > 60)) {
      fieldErrors["seo.title"] =
        "SEO title recomendado entre 50 y 60 caracteres.";
    }
    if (
      seoDescription &&
      (seoDescription.length < 120 || seoDescription.length > 160)
    ) {
      fieldErrors["seo.description"] =
        "SEO description recomendada entre 120 y 160 caracteres.";
    }
  }

  if (status === "published" || status === "scheduled") {
    if (!trimOrEmpty(data.title)) {
      fieldErrors.title = "No puedes publicar sin título.";
    }
    if (!trimOrEmpty(data.description) && collection === "blog") {
      fieldErrors.description = "No puedes publicar sin descripción.";
    }
    if (!trimOrEmpty(data.category)) {
      fieldErrors.category = "No puedes publicar sin categoría.";
    }
  }

  return fieldErrors;
}

export function isValidStatus(value: unknown): value is EditorialStatus {
  return (
    typeof value === "string" &&
    (EDITORIAL_STATUSES as readonly string[]).includes(value)
  );
}

function requireString(
  data: CmsData,
  field: string,
  message: string,
  fieldErrors: FieldErrors,
) {
  if (!trimOrEmpty(data[field])) fieldErrors[field] = message;
}

function requireDateString(
  data: CmsData,
  field: string,
  message: string,
  fieldErrors: FieldErrors,
) {
  const value = data[field];
  if (!value) {
    fieldErrors[field] = message;
    return;
  }
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) {
    fieldErrors[field] = `${field} debe ser una fecha válida.`;
  }
}

function trimOrEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
