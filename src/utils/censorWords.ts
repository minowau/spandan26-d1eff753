// Common profanity words to censor (extend as needed)
const BANNED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'crap',
  'dick', 'cock', 'pussy', 'bastard', 'slut', 'whore',
  'fag', 'retard', 'nigger', 'cunt', 'piss', 'bollocks',
  'wanker', 'twat', 'arse', 'bloody', 'bugger', 'chutiya',
  'madarchod', 'behenchod', 'bhenchod', 'gaand', 'lund', 'randi',
  'harami', 'saala', 'kamina', 'kutta', 'kutti', 'chut',
];

// Create regex patterns for each word (case insensitive, word boundaries)
const createPattern = (word: string): RegExp => {
  // Handle leetspeak substitutions
  const leetMap: Record<string, string> = {
    'a': '[a@4]',
    'e': '[e3]',
    'i': '[i1!]',
    'o': '[o0]',
    's': '[s$5]',
    't': '[t7]',
    'l': '[l1]',
  };

  let pattern = word
    .split('')
    .map(char => leetMap[char.toLowerCase()] || char)
    .join('[\\s._-]*');

  return new RegExp(`\\b${pattern}\\b`, 'gi');
};

const patterns = BANNED_WORDS.map(word => ({
  word,
  pattern: createPattern(word),
}));

export function censorMessage(message: string): string {
  let censored = message;

  patterns.forEach(({ word, pattern }) => {
    censored = censored.replace(pattern, match => {
      // Replace with asterisks, keeping first letter
      return match[0] + '*'.repeat(match.length - 1);
    });
  });

  return censored;
}

export function containsProfanity(message: string): boolean {
  return patterns.some(({ pattern }) => pattern.test(message));
}
