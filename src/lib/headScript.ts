/**
 * Script inline in <head> (prima del paint):
 * - html.motion se l'utente non chiede reduced-motion (abilita gli stati iniziali dei reveal);
 * - html[data-pl=on] se il preloader non è ancora stato visto in questa sessione;
 * - lingua: sulla home italiana, alla prima visita, porta alla lingua del browser (en/fr/es/pt/pl).
 *   Di norma lo fa già Apache (.htaccess, Accept-Language): questo è il ripiego lato browser.
 *   Mai se l'utente ha scelto una lingua (cookie sr_lang) e mai per i bot.
 */
export const headScript = `(function(){var d=document.documentElement;var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)d.classList.add('motion');try{if(!rm&&!sessionStorage.getItem('sr_pl')&&d.hasAttribute('data-has-pl'))d.setAttribute('data-pl','on')}catch(e){}try{if(location.pathname==='/'&&d.lang==='it'&&!/(^|;\\s*)sr_lang=/.test(document.cookie)&&!/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)){var l=((navigator.languages&&navigator.languages[0])||navigator.language||'').slice(0,2).toLowerCase();if(['en','fr','es','pt','pl'].indexOf(l)>=0)location.replace('/'+l+'/')}}catch(e){}})();`;
