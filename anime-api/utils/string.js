/**
 * Simple Levenshtein distance algorithm to find the "edit distance" between two strings.
 * Used for "Did you mean?" search suggestions.
 */
export function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the closest match for a query from a list of possibilities.
 * Returns the match if it's within a reasonable threshold.
 */
export function findClosestMatch(query, possibilities, threshold = 2) {
  if (!query || !possibilities || possibilities.length === 0) return null;

  const q = query.toLowerCase();
  let bestMatch = null;
  let minDistance = Infinity;

  for (const item of possibilities) {
    const it = item.toLowerCase();
    
    // If it's a very short word, distance threshold should be lower
    const currentThreshold = q.length <= 3 ? 1 : threshold;
    
    const distance = getLevenshteinDistance(q, it);
    
    if (distance < minDistance && distance <= currentThreshold) {
      minDistance = distance;
      bestMatch = item;
    }
  }

  return bestMatch;
}
