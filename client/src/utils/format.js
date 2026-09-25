export function fmt(n, maxDec) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const d = maxDec === undefined ? (Math.abs(n) >= 100 ? 2 : 4) : maxDec;
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: d,
  });
}
