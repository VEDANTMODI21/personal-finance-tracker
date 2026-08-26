/**
 * IMPORTANT — read this before assuming this "secures" anything:
 *
 * Any JavaScript, HTML and CSS sent to a browser is, by the nature of the
 * web platform, downloaded and executable on the visitor's own machine.
 * There is no technique — obfuscation, minification, or blocking keyboard
 * shortcuts — that makes client-side code truly un-inspectable. A
 * determined visitor can always read network responses directly, use a
 * proxy, or use browser features these tricks don't cover.
 *
 * What actually keeps this app secure is that no secret or trust decision
 * ever lives in this bundle:
 *   - JWT secrets, the database URL, and password hashes only exist on the
 *     backend (see backend/.env / Render's environment variables).
 *   - Every read/write is re-authorized server-side from the JWT — the
 *     frontend cannot trick the API into returning another user's data by
 *     editing requests in DevTools (see the `userId` comment in README.md).
 *   - The access token lives only in memory (frontend/src/services/api.js),
 *     never in localStorage, so it isn't sitting on disk for casual reading
 *     and disappears on tab close.
 *
 * This module only adds a mild deterrent against casual right-click /
 * "View Source" snooping — it will not stop anyone who actually wants to
 * open DevTools (F12 can still be reached from the browser menu, and this
 * has zero effect on someone using curl/Postman against the API directly).
 * It's cosmetic, and it only runs in the production build so it never gets
 * in the way of local development.
 */
export function installDevtoolsDeterrent() {
  if (!import.meta.env.PROD) return;

  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    const key = e.key?.toUpperCase();
    const blocked =
      key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
      (e.ctrlKey && key === 'U');
    if (blocked) e.preventDefault();
  });
}
