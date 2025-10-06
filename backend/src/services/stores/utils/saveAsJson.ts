import { promises as fs } from 'fs';

export default async function ({
  fileName,
  toBeSaved,
}: {
  fileName: string;
  toBeSaved: any;
}) {
  await fs.writeFile(fileName, JSON.stringify(toBeSaved, null, 2), 'utf-8');
  console.log(`✔ Saved ${toBeSaved.length} items to ${fileName}`);
}
