export default async function ({
  initialTime,
  finalTime,
}: {
  initialTime: number;
  finalTime: number;
}) {
  let randomDelay: number = 0;

  // Avoid negative or zero numbers
  if (finalTime <= 0 || initialTime <= 0) {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (finalTime < initialTime) {
    randomDelay =
      Math.floor(Math.random() * (initialTime - finalTime + 1)) + finalTime;
  }

  randomDelay =
    Math.floor(Math.random() * (finalTime - initialTime + 1)) + initialTime;

  console.log(`Waiting ${randomDelay}ms before fetching...`);

  return new Promise((resolve) => setTimeout(resolve, randomDelay));
}
