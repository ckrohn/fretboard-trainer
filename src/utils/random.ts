export const getRandomItem = <T>(items: readonly T[]): T => {
  if (items.length === 0) {
    throw new Error("Cannot choose a random item from an empty array.");
  }

  return items[Math.floor(Math.random() * items.length)];
};
