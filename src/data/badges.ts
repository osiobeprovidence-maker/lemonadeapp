import type { Badge } from './types';

export const BADGES: Record<string, Badge> = {
  b1: { id: "b1", name: "Early Adopter", icon: "🚀", description: "Joined during the beta phase." },
  b2: { id: "b2", name: "Binge Reader", icon: "📚", description: "Read 100 chapters." },
  b3: { id: "b3", name: "Supporter", icon: "💎", description: "Tipped 5 creators." },
  b4: { id: "b4", name: "Originals Fan", icon: "🍋", description: "Read 5 Lemonade Originals." },
};
