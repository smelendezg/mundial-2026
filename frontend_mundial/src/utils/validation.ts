export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;
const dataImagePattern = /^data:image\/(png|jpeg|jpg|webp);base64,/i;

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validatePersonName(value: string, fieldLabel: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatorio.`;
  if (cleanValue.length < 2) return `${fieldLabel} debe tener al menos 2 caracteres.`;
  if (cleanValue.length > 60) return `${fieldLabel} debe tener máximo 60 caracteres.`;
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
  if (password.includes(" ")) return "La contraseña no debe tener espacios.";

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

export function validateUsernameOrEmail(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return "Escribe tu usuario o correo.";
  if (cleanValue.length < 2) return "Escribe al menos 2 caracteres.";
  if (cleanValue.length > 80) return "El usuario o correo debe tener máximo 80 caracteres.";

  return "";
}

export function validateImageSource(
  value: string,
  fieldLabel: string,
  required = true
) {
  const cleanValue = value.trim();

  if (!cleanValue) return required ? `${fieldLabel} es obligatoria.` : "";
  if (dataImagePattern.test(cleanValue)) return "";
  if (isValidHttpUrl(cleanValue)) return "";

  return `${fieldLabel} debe ser un enlace http(s) o una imagen cargada.`;
}

export function validateFutureDateTime(
  value: string,
  fieldLabel: string,
  minMinutesAhead = 0
) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatoria.`;

  const parsed = new Date(cleanValue);
  if (Number.isNaN(parsed.getTime())) return `${fieldLabel} no tiene un formato válido.`;

  const minDate = Date.now() + minMinutesAhead * 60_000;
  if (parsed.getTime() < minDate) {
    return `${fieldLabel} debe ser posterior a la hora actual.`;
  }

  return "";
}

export function validateDateTime(value: string, fieldLabel: string) {
  const cleanValue = value.trim();

  if (!cleanValue) return `${fieldLabel} es obligatoria.`;

  const parsed = new Date(cleanValue);
  if (Number.isNaN(parsed.getTime())) return `${fieldLabel} no tiene un formato válido.`;

  return "";
}

export function validateOptionalEmojiFlag(value: string, fieldLabel: string) {
  const cleanValue = value.trim();
  if (!cleanValue) return "";
  if (cleanValue.length > 6) return `${fieldLabel} debe ser corta.`;
  return "";
}

export function validateDelimitedPreferences(
  value: string,
  fieldLabel: string,
  maxItems: number,
  maxItemLength = 40
) {
  const values = splitCommaValues(value);

  if (values.length > maxItems) {
    return `${fieldLabel} permite máximo ${maxItems} valores.`;
  }

  const invalid = values.find((item) => item.length > maxItemLength);
  if (invalid) {
    return `Cada valor de ${fieldLabel.toLowerCase()} debe tener máximo ${maxItemLength} caracteres.`;
  }

  const duplicates = new Set<string>();
  for (const item of values) {
    const key = item.toLowerCase();
    if (duplicates.has(key)) {
      return `No repitas valores en ${fieldLabel.toLowerCase()}.`;
    }
    duplicates.add(key);
  }

  return "";
}

export function validateMoneyAmount(
  value: number,
  fieldLabel: string,
  min: number,
  max: number
) {
  if (!Number.isFinite(value)) return `${fieldLabel} debe ser un valor válido.`;
  if (value < min) return `${fieldLabel} debe ser mínimo ${min.toLocaleString("es-CO")}.`;
  if (value > max) return `${fieldLabel} debe ser máximo ${max.toLocaleString("es-CO")}.`;
  return "";
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiryDate(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isLuhnValid(number: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateCardHolder(value: string) {
  return validatePersonName(value, "El nombre del titular");
}

export function validateCardNumber(value: string) {
  const digits = onlyDigits(value);

  if (!digits) return "El número de tarjeta es obligatorio.";
  if (digits.length !== 16) return "La tarjeta debe tener 16 dígitos.";
  if (!isLuhnValid(digits)) return "El número de tarjeta no es válido.";

  return "";
}

export function validateExpiryDate(value: string) {
  if (!value.trim()) return "La fecha de vencimiento es obligatoria.";

  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return "Usa el formato MM/AA.";

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12) return "El mes de vencimiento no es válido.";

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || year > currentYear + 15) {
    return "El año de vencimiento no es válido.";
  }

  if (year === currentYear && month < currentMonth) {
    return "La tarjeta ya está vencida.";
  }

  return "";
}

export function validateSecurityCode(value: string) {
  const digits = onlyDigits(value);

  if (!digits) return "El código de seguridad es obligatorio.";
  if (digits.length < 3 || digits.length > 4) {
    return "El código de seguridad debe tener 3 o 4 dígitos.";
  }

  return "";
}
