/**
 * Inline head script (server-safe constant): runs before first paint.
 * - Adds `js` so progressive reveals know JavaScript is available.
 * - Adds `preload` on the first visit to the home page when motion is allowed,
 *   which shows the CSS-driven preloader (brief §5 Stage 0). Later visits skip it.
 *   `/?intro` forces it again (for reviewing it and for demos).
 */
export const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var first=!localStorage.getItem('pn-visited')||/[?&]intro\\b/.test(location.search);var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(location.pathname==='/'&&first&&!calm){d.classList.add('preload')}localStorage.setItem('pn-visited','1')}catch(e){}})();`;
