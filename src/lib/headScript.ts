/**
 * Script inline in <head> (prima del paint):
 * - html.motion se l'utente non chiede reduced-motion (abilita gli stati iniziali dei reveal);
 * - html[data-pl=on] se il preloader non è ancora stato visto in questa sessione.
 */
export const headScript = `(function(){var d=document.documentElement;var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)d.classList.add('motion');try{if(!rm&&!sessionStorage.getItem('sr_pl')&&d.hasAttribute('data-has-pl'))d.setAttribute('data-pl','on')}catch(e){}})();`;
