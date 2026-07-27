export interface SupportResource {
  id: string;
  title: string;
  description: string;
  category: "school_meals" | "community_food" | "school_support" | "other";
}

export const supportResources: SupportResource[] = [
  {
    id: "meal-program",
    title: "School meal program info",
    description:
      "Learn about free or reduced meal programs available through the school.",
    category: "school_meals",
  },
  {
    id: "backpack-program",
    title: "Weekend backpack food program",
    description:
      "Ask about take-home meals for weekends and school breaks.",
    category: "school_meals",
  },
  {
    id: "food-pantry",
    title: "Local food pantry locator",
    description:
      "Find nearby food pantries and community meal programs.",
    category: "community_food",
  },
  {
    id: "resource-hotline",
    title: "Community resource hotline (non-emergency)",
    description:
      "Connect with local support services for food and basic needs.",
    category: "community_food",
  },
  {
    id: "counselor-support",
    title: "Teacher / counselor support",
    description:
      "Request a private check-in with a teacher, counselor, or social worker.",
    category: "school_support",
  },
];
