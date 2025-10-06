export default function (n: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const len = letters.length;
  const arr = new Array(n);

  for (let i = 0; i < 5; i++) {
    arr[i] = letters[(Math.random() * len) | 0]; // bitwise OR is faster than Math.floor
  }

  return arr.join('');
}
