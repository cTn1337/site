export function isReviewer(role: string) {
  return role === "REVIEWER" || role === "ADMIN";
}

export function isAdmin(role: string) {
  return role === "ADMIN";
}
