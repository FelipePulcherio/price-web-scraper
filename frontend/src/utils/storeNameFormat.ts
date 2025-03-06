export function StoreNameFormat(name: string): string {
  const words = name.split(' ');

  // Handle country initials (if exist)
  if (words[words.length - 1].split('').length === 2) {
    words.pop();
  }

  return words
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
