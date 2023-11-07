export const pickRandomItem = (arr: any[]): any => {
  let randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};
