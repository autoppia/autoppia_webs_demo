export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFormatted = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startFormatted} - ${endFormatted}`;
}

export function formatRating(rating: number): string {
  return rating.toLocaleString();
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getCountryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-green-400";
    case "upcoming":
      return "text-amber-400";
    case "completed":
      return "text-zinc-400";
    default:
      return "text-zinc-400";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "upcoming":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "completed":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

export function getGameTypeBadgeClass(gameType: string): string {
  switch (gameType) {
    case "Classical":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "Rapid":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Blitz":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}
