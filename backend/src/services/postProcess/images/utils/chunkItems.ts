export default function (totalItems: number, maxChunkSize = 100): number[] {
  const result: number[] = [];
  for (let i = 0; i < totalItems; i += maxChunkSize) {
    result.push(i);
  }
  return result;
}
