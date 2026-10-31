export function formatAmount(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "0";
  try {
    return val.toLocaleString("en-IN");
  } catch {
    const parts = val.toString().split(".");
    const lastThree = parts[0].substring(parts[0].length - 3);
    const otherNumbers = parts[0].substring(0, parts[0].length - 3);
    const formatted =
      otherNumbers !== ""
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
        : lastThree;
    return parts.length > 1 ? `${formatted}.${parts[1]}` : formatted;
  }
}

export function formatDate(timestamp: number | Date): string {
  const d = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
