export default function ({
  query,
  separator,
}: {
  query: string;
  separator: string;
}): string {
  const formattedQuery = query.replace(' ', separator);

  return formattedQuery;
}
