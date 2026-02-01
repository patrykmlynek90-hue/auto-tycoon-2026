import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CarPart } from '../data/parts';
import { CarClassDefinition } from '../data/carClasses';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// [REMOVED] isPartSOTA helper - obsolescence system removed

export function calculateSynergy(
  carClass: CarClassDefinition,
  parts: CarPart[],
  currentYear: number,
  allParts: CarPart[]
): { score: number; feedback: string[] } {
  let score = 100; // Startowa ocena
  const feedback: string[] = [];

  parts.forEach(part => {
    // 1. Sprawdzanie Tagów
    const hasPreferred = part.tags.some(t => carClass.preferredTags.includes(t));
    const hasForbidden = part.tags.some(t => carClass.forbiddenTags.includes(t));

    if (hasPreferred) score += 10;
    if (hasForbidden) {
      score -= 25;
      // Znajdź który tag zawinił dla feedbacku
      const culprit = part.tags.find(t => carClass.forbiddenTags.includes(t));
      feedback.push(`- ${part.label}: Nie pasuje do klasy (Cecha: ${culprit})`);
    }

    // [REMOVED] Tech Age obsolescence system
    // Parts are now valid indefinitely - no age-based penalties
  });

  // 3. Weryfikacja Wymaganego Nadwozia (Hard Lock)
  if (carClass.requiredBodyTypes) {
    const body = parts.find(p => p.type === 'body');
    if (body && !carClass.requiredBodyTypes.includes(body.value)) {
      score = 0;
      feedback.push(`!!! Wymagane nadwozie: ${carClass.requiredBodyTypes.join(' lub ')}`);
    }
  }

  return {
    score: Math.max(0, Math.min(150, score)),
    feedback
  };
}
