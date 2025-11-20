export default function (name: string): number | null {
  const match = name?.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
