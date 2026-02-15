import type { FlavorProfile } from "@shared/schema";

/**
 * Calculate flavor profile name based on questionnaire responses
 * Returns Spanish profile name
 */
export function calculateFlavorProfile(profile: Partial<FlavorProfile>): string {
  const {
    acidityLevel,
    bitternessLevel,
    sweetnessLevel,
    bodyWeight,
    flavorNotes,
  } = profile;

  // High acidity + fruity notes = Bright & Fruity
  if (
    acidityLevel &&
    acidityLevel >= 4 &&
    flavorNotes &&
    flavorNotes.includes("Frutal")
  ) {
    return "Brillante y Frutal";
  }

  // High bitterness + low acidity = Dark & Bold
  if (
    bitternessLevel &&
    bitternessLevel >= 4 &&
    acidityLevel &&
    acidityLevel <= 2
  ) {
    return "Oscuro y Audaz";
  }

  // High sweetness + chocolate/caramel = Sweet & Smooth
  if (
    sweetnessLevel &&
    sweetnessLevel >= 4 &&
    flavorNotes &&
    (flavorNotes.includes("Chocolate") || flavorNotes.includes("Caramelo"))
  ) {
    return "Dulce y Suave";
  }

  // High body + nutty/earthy = Rich & Nutty
  if (
    bodyWeight &&
    bodyWeight >= 4 &&
    flavorNotes &&
    (flavorNotes.includes("Nueces") || flavorNotes.includes("Terroso"))
  ) {
    return "Rico y Nueces";
  }

  // Light body + floral = Light & Delicate
  if (
    bodyWeight &&
    bodyWeight <= 2 &&
    flavorNotes &&
    flavorNotes.includes("Floral")
  ) {
    return "Ligero y Delicado";
  }

  // Balanced (all values around 3)
  if (
    acidityLevel === 3 &&
    bitternessLevel === 3 &&
    sweetnessLevel === 3
  ) {
    return "Balanceado y Clásico";
  }

  // Default
  return "Perfil Único";
}
