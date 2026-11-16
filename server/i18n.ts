import type { Request } from "express";
import type { ZodError } from "zod";

/**
 * Server-side messages in the two UI languages. The client sends the
 * language picked in the toggle as the Accept-Language header; anything
 * that isn't English falls back to Spanish, the app's original language.
 */
export type Lang = "es" | "en";

const es = {
  internalError: "Error interno del servidor",
  invalidData: "Algunos datos no son válidos",
  invalidField: "Revisa el campo «{field}»",
  invalidUsername:
    "El nombre de usuario necesita entre 3 y 30 caracteres: letras, números y guiones bajos",
  invalidEmail: "Ese correo electrónico no parece válido",
  invalidDisplayName: "El nombre para mostrar es obligatorio (máximo 100 caracteres)",
  invalidPassword: "La contraseña necesita entre 8 y 72 caracteres",
  payloadTooLarge: "La imagen o los datos son demasiado grandes",
  forbiddenOrigin: "Solicitud bloqueada: origen no permitido",
  apiNotFound: "Esta ruta de la API no existe",
  tooManyAttempts: "Demasiados intentos. Vuelve a intentarlo en unos minutos.",

  authRequired: "Inicia sesión para continuar",
  usernameTaken: "Ese nombre de usuario ya está en uso",
  emailTaken: "Ese correo electrónico ya está en uso",
  credentialsRequired: "Usuario y contraseña son obligatorios",
  invalidCredentials: "Usuario o contraseña incorrectos",
  loginFailed: "No se pudo iniciar sesión",
  logoutFailed: "No se pudo cerrar sesión",

  invalidCoffeeId: "ID de café inválido",
  invalidUserId: "ID de usuario inválido",
  coffeeNotFound: "Café no encontrado",
  forbidden: "No tienes acceso a este café",
  loadCoffeesFailed: "No se pudieron cargar los cafés",
  loadCoffeeFailed: "No se pudo cargar el café",
  createCoffeeFailed: "No se pudo crear el café",
  updateCoffeeFailed: "No se pudo actualizar el café",
  deleteCoffeeFailed: "No se pudo eliminar el café",
  duplicateCoffeeFailed: "No se pudo copiar el café",

  invalidLimit: "El límite debe estar entre 1 y 100",
  invalidOffset: "El offset debe ser un número entero de 0 o más",
  loadFeedFailed: "No se pudo cargar el feed",
  findMatchesFailed: "No se pudieron buscar coincidencias",
  loadUserCoffeesFailed: "No se pudieron cargar los cafés del usuario",

  profileNotFound: "Perfil de sabor no encontrado",
  profileExists: "Este café ya tiene un perfil de sabor",
  loadProfileFailed: "No se pudo cargar el perfil de sabor",
  createProfileFailed: "No se pudo crear el perfil de sabor",
  updateProfileFailed: "No se pudo actualizar el perfil de sabor",

  loadStatsFailed: "No se pudieron cargar las estadísticas",
} as const;

export type MessageKey = keyof typeof es;

const en: Record<MessageKey, string> = {
  internalError: "Internal server error",
  invalidData: "Some of the data isn't valid",
  invalidField: "Check the “{field}” field",
  invalidUsername: "Usernames need 3 to 30 characters: letters, numbers and underscores",
  invalidEmail: "That email address doesn't look valid",
  invalidDisplayName: "Display name is required (100 characters max)",
  invalidPassword: "Passwords need 8 to 72 characters",
  payloadTooLarge: "The image or data is too large",
  forbiddenOrigin: "Request blocked: origin not allowed",
  apiNotFound: "This API route doesn't exist",
  tooManyAttempts: "Too many attempts. Try again in a few minutes.",

  authRequired: "Sign in to continue",
  usernameTaken: "That username is already taken",
  emailTaken: "That email address is already in use",
  credentialsRequired: "Username and password are required",
  invalidCredentials: "Wrong username or password",
  loginFailed: "Signing in failed",
  logoutFailed: "Signing out failed",

  invalidCoffeeId: "Invalid coffee ID",
  invalidUserId: "Invalid user ID",
  coffeeNotFound: "Coffee not found",
  forbidden: "You don't have access to this coffee",
  loadCoffeesFailed: "Loading coffees failed",
  loadCoffeeFailed: "Loading the coffee failed",
  createCoffeeFailed: "Creating the coffee failed",
  updateCoffeeFailed: "Updating the coffee failed",
  deleteCoffeeFailed: "Deleting the coffee failed",
  duplicateCoffeeFailed: "Copying the coffee failed",

  invalidLimit: "Limit must be between 1 and 100",
  invalidOffset: "Offset must be a whole number of 0 or more",
  loadFeedFailed: "Loading the feed failed",
  findMatchesFailed: "Finding matches failed",
  loadUserCoffeesFailed: "Loading this user's coffees failed",

  profileNotFound: "Flavor profile not found",
  profileExists: "This coffee already has a flavor profile",
  loadProfileFailed: "Loading the flavor profile failed",
  createProfileFailed: "Creating the flavor profile failed",
  updateProfileFailed: "Updating the flavor profile failed",

  loadStatsFailed: "Loading statistics failed",
};

const messages: Record<Lang, Record<MessageKey, string>> = { es, en };

// Field names as they appear on the forms, for validation errors
const fieldLabels: Record<Lang, Record<string, string>> = {
  es: {
    name: "Nombre del café",
    roaster: "Tostador",
    origin: "Origen",
    roastLevel: "Nivel de tueste",
    processingMethod: "Método de proceso",
    beansMix: "Mezcla de granos",
    website: "Sitio web",
    price: "Precio",
    color: "Color",
    image: "Imagen",
    description: "Notas",
    rating: "Valoración",
    isPrivate: "Privado",
    flavorNotes: "Notas de sabor",
  },
  en: {
    name: "Coffee name",
    roaster: "Roaster",
    origin: "Origin",
    roastLevel: "Roast level",
    processingMethod: "Processing method",
    beansMix: "Bean mix",
    website: "Website",
    price: "Price",
    color: "Color",
    image: "Image",
    description: "Notes",
    rating: "Rating",
    isPrivate: "Private",
    flavorNotes: "Flavor notes",
  },
};

const fieldSpecificMessages: Record<string, MessageKey> = {
  username: "invalidUsername",
  email: "invalidEmail",
  displayName: "invalidDisplayName",
  password: "invalidPassword",
};

export function langOf(req: Request): Lang {
  const header = (req.get("accept-language") ?? "").trim().toLowerCase();
  return header.startsWith("en") ? "en" : "es";
}

export function t(req: Request, key: MessageKey, vars?: Record<string, string | number>): string {
  let text = messages[langOf(req)][key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Turn the first Zod issue into a message the user can act on. */
export function validationMessage(req: Request, error: ZodError): string {
  const field = String(error.issues[0]?.path[0] ?? "");
  const specific = fieldSpecificMessages[field];
  if (specific) return t(req, specific);
  const label = fieldLabels[langOf(req)][field];
  return label ? t(req, "invalidField", { field: label }) : t(req, "invalidData");
}
