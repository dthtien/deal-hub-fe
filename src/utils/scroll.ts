/**
 * Returns true when the user is close enough to the bottom to trigger the next page load.
 * Accounts for footer height so loading fires before the footer becomes visible.
 */
export function nearBottom(buffer = 300): boolean {
  const footerHeight = document.querySelector('footer')?.offsetHeight ?? 0;
  const threshold = buffer + footerHeight;
  const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  return dist < threshold;
}
