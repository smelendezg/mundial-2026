export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;

export function validatePersonName(value: string, fieldLabel: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatorio.`;
  if (cleanValue.length < 2) return `${fieldLabel} debe tener al menos 2 caracteres.`;
  if (!namePattern.test(cleanValue)) {
    return `${fieldLabel} solo puede tener letras y espacios.`;
  }

  return "";
}

export function validateEmail(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return "El correo es obligatorio.";
  if (!emailPattern.test(cleanValue)) return "Escribe un correo válido.";

  return "";
}

export function getPasswordRules(password: string) {
  return [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-ZÁÉÍÓÚÑ]/.test(password) },
    { label: "Una letra minúscula", valid: /[a-záéíóúñ]/.test(password) },
    { label: "Un número", valid: /\d/.test(password) },
    { label: "Un símbolo", valid: /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9]/.test(password) },
  ];
}

export function validatePassword(password: string) {
  if (!password) return "La contraseña es obligatoria.";

  const missingRules = getPasswordRules(password).filter((rule) => !rule.valid);
  if (missingRules.length > 0) {
    return "La contraseña debe ser más segura.";
  }

  return "";
}

export function validateAvatar(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return "El avatar debe ser una imagen JPG, PNG o WEBP.";
  }

  if (file.size > maxSize) {
    return "El avatar no puede pesar más de 1 MB.";
  }

  return "";
}

export function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateRequired(value: string, fieldLabel: string, minLength = 1) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatorio.`;
  if (cleanValue.length < minLength) {
    return `${fieldLabel} debe tener al menos ${minLength} caracteres.`;
  }

  return "";
}

export function validateTextLength(
  value: string,
  fieldLabel: string,
  minLength: number,
  maxLength: number
) {
  const requiredError = validateRequired(value, fieldLabel, minLength);
  if (requiredError) return requiredError;

  if (value.trim().length > maxLength) {
    return `${fieldLabel} debe tener máximo ${maxLength} caracteres.`;
  }

  return "";
}

export function validateCode(value: string, fieldLabel: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatorio.`;
  if (!/^[A-Za-z0-9-]{4,20}$/.test(cleanValue)) {
    return `${fieldLabel} debe tener entre 4 y 20 caracteres, solo letras y números.`;
  }

  return "";
}

export function validatePositiveNumber(
  value: number,
  fieldLabel: string,
  min = 1,
  max = Number.MAX_SAFE_INTEGER
) {
  if (!Number.isFinite(value)) return `${fieldLabel} debe ser un número válido.`;
  if (value < min) return `${fieldLabel} debe ser mínimo ${min}.`;
  if (value > max) return `${fieldLabel} debe ser máximo ${max}.`;

  return "";
}

export function validateIntegerRange(
  value: number,
  fieldLabel: string,
  min: number,
  max: number
) {
  if (!Number.isFinite(value)) return `${fieldLabel} debe ser un número válido.`;
  if (!Number.isInteger(value)) return `${fieldLabel} debe ser un número entero.`;
  if (value < min) return `${fieldLabel} debe ser mínimo ${min}.`;
  if (value > max) return `${fieldLabel} debe ser máximo ${max}.`;

  return "";
}

export function validatePaymentReference(value: string, fieldLabel: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatorio.`;
  if (cleanValue.length < 4) return `${fieldLabel} debe tener al menos 4 caracteres.`;
  if (cleanValue.length > 40) return `${fieldLabel} debe tener máximo 40 caracteres.`;
  if (!/^[A-Za-z0-9\s*.-]+$/.test(cleanValue)) {
    return `${fieldLabel} solo puede tener letras, números, espacios, puntos, guiones o asteriscos.`;
  }

  return "";
}
