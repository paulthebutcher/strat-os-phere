export function badgeToneClass(tone?: "info" | "success" | "warning") {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
}

