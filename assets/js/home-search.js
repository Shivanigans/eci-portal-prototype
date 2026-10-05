/* The homepage search bar: a guide in the empty bar, and suggestions while it is in use.
 *
 *   HomeSearch.mount(form, { loggedIn })   loggedIn() says whether links carry the signed-in state
 *   HomeSearch.submit()                     the form's submit: goes to the highlighted suggestion,
 *                                           or the first match
 *
 * Guide: "I want to …" with an ending that changes every 2 seconds, drawn over the input (a
 * placeholder cannot fade). It stops once the bar is clicked into or typed in, and starts again
 * only when the bar is empty and loses focus. With reduced motion it stays on the first ending.
 *
 * Suggestions: clicking into the empty bar opens one short list under it, "My situation";
 * typing replaces it with matching services from the whole set. The list floats over the page
 * and never scrolls, a light tint covers the rest, and Escape, a click on the tint or choosing
 * an item closes it. It is a combobox: focus stays in the bar and the arrow keys move through
 * the items. Nothing is highlighted until hover or an arrow key.
 */
const HomeSearch = (() => {
  const ENDINGS = ['register to vote', 'check my application status', 'update my address', 'fix my name', 'download my voter ID', 'find my polling station'];
  const ROTATE_EVERY = 2000;
  const FADE_FOR = 200;
  const MAX_RESULTS = 5;

  // Where each item goes, and its UX4G (Material Symbols) icon. Services not built in this
  // prototype open service.html's "Coming soon".
  const SITUATION = [
    { label: 'I’ve moved to a new city', icon: 'home_work', href: 'form8-prep.html', words: 'moved move shift shifted new address city transfer relocate house' },
    { label: 'I recently got married', icon: 'favorite_border', href: 'form8-prep.html', words: 'married marriage wedding name change surname spouse' },
    { label: 'I live abroad', icon: 'public', href: 'service.html?s=nri', words: 'abroad overseas nri outside india foreign form 6a' },
    { label: 'I’m a person with a disability', icon: 'accessible', href: 'form8-prep.html', words: 'disability disabled pwd accessible accessibility wheelchair blind' }
  ];
  // Found by typing only.
  const MORE = [
    { label: 'Register as a new voter', icon: 'how_to_reg', href: 'form6-prep.html', words: 'register new voter form 6 enrol enroll first time 18 add name vote' },
    { label: 'Track my application', icon: 'pending_actions', href: 'track.html', words: 'track status application reference check progress submitted' },
    { label: 'Update my details', icon: 'edit', href: 'form8-prep.html', words: 'update correct correction fix change details name address photo form 8 mistake' },
    { label: 'Download my voter ID', icon: 'badge', href: 'service.html?s=epic', words: 'download voter id epic card e-epic print copy' },
    { label: 'Find my polling station', icon: 'location_on', href: 'service.html?s=polling', words: 'polling station booth where vote location' },
    { label: 'Book a call with your BLO', icon: 'call', href: 'service.html?s=book-blo', words: 'blo booth level officer call visit help' },
    { label: 'Find your nearest centre', icon: 'apartment', href: 'service.html?s=find-centre', words: 'centre center office offline nearest in person' },
    { label: 'Download forms to apply offline', icon: 'description', href: 'service.html?s=download-forms', words: 'forms pdf offline download paper' }
  ];
  // Typed matches put the common tasks first.
  const ALL = MORE.slice(0, 4).concat(SITUATION, MORE.slice(4));
  // Words that say nothing about the service, so "I want to fix my name" still matches.
  const FILLER = new Set(['i', 'want', 'to', 'my', 'a', 'an', 'the', 'me', 'how', 'do', 'can', 'for', 'of', 'in', 'is']);

  let form, input, field, ending, panel, list, scrim, loggedIn = () => false;
  let options = [], current = -1, timer = null, turn = 0;

  const still = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isOpen = () => !panel.hidden;
  const hrefOf = (item) => item.href + (loggedIn() ? (item.href.includes('?') ? '&' : '?') + 'loggedIn=1' : '');

  // ---- The guide -------------------------------------------------------------------------
  function rotate() {
    turn = (turn + 1) % ENDINGS.length;
    ending.classList.add('is-fading');
    setTimeout(() => { ending.textContent = ENDINGS[turn]; ending.classList.remove('is-fading'); }, FADE_FOR);
  }
  function startGuide() {
    stopGuide();
    if (still()) { turn = 0; ending.textContent = ENDINGS[0]; return; }
    timer = setInterval(rotate, ROTATE_EVERY);
  }
  function stopGuide() { clearInterval(timer); timer = null; }
  function showGuide() { field.classList.toggle('has-value', input.value !== ''); }

  // ---- The suggestions -------------------------------------------------------------------
  function matches(q) {
    const terms = q.toLowerCase().split(/[^a-z0-9]+/).filter(t => t && !FILLER.has(t));
    if (!terms.length) return [];
    return ALL
      .filter(item => { const text = (item.label + ' ' + item.words).toLowerCase(); return terms.every(t => text.includes(t)); })
      .sort((a, b) => Number(b.label.toLowerCase().startsWith(terms[0])) - Number(a.label.toLowerCase().startsWith(terms[0])))
      .slice(0, MAX_RESULTS);
  }

  function optionHtml(item, i) {
    return '<li class="ux4g-list-item" role="option" id="eci-search-opt-' + i + '" aria-selected="false" data-index="' + i + '">' +
      '<div class="ux4g-list-item-row"><span class="ux4g-list-item-start">' +
        '<span class="ux4g-icon-outlined home-search-icon" aria-hidden="true">' + item.icon + '</span>' + item.label +
      '</span></div></li>';
  }
  const escape = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render() {
    const q = input.value.trim();
    current = -1;
    input.removeAttribute('aria-activedescendant');
    if (!q) {
      options = SITUATION;
      list.innerHTML =
        '<li role="presentation" class="home-search-group">' +
          '<div class="ux4g-label-s-default ux4g-text-neutral-tertiary home-search-group-label" id="eci-search-group">My situation</div>' +
          '<ul role="group" aria-labelledby="eci-search-group" class="home-search-group-list">' +
            SITUATION.map(optionHtml).join('') +
          '</ul></li>';
      return;
    }
    options = matches(q);
    list.innerHTML = options.length
      ? options.map(optionHtml).join('')
      : '<li role="presentation" class="ux4g-body-s-default ux4g-text-neutral-secondary home-search-empty">No services match “' + escape(q) + '”.</li>';
  }

  function open() {
    render();
    panel.hidden = false;
    scrim.hidden = false;
    form.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (!isOpen()) return;
    panel.hidden = true;
    scrim.hidden = true;
    form.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    current = -1;
  }

  function highlight(i) {
    const rows = list.querySelectorAll('[role="option"]');
    if (!rows.length) return;
    current = (i + rows.length) % rows.length;
    rows.forEach((row, n) => {
      row.setAttribute('aria-selected', String(n === current));
      row.querySelector('.ux4g-list-item-row').classList.toggle('is-current', n === current);
    });
    input.setAttribute('aria-activedescendant', rows[current].id);
    rows[current].scrollIntoView({ block: 'nearest' });
  }

  function go(item) {
    close();
    location.href = hrefOf(item);
  }

  function submit() {
    if (isOpen() && current >= 0) { go(options[current]); return; }
    const found = matches(input.value);
    if (found.length) { go(found[0]); return; }
    input.focus();
    open();
  }

  function mount(el, o) {
    form = el;
    loggedIn = (o && o.loggedIn) || loggedIn;
    input = form.querySelector('#eci-search');
    field = form.querySelector('.home-search-field');
    ending = form.querySelector('.home-search-ending');
    panel = form.querySelector('.home-search-panel');
    list = form.querySelector('.home-search-list');
    scrim = document.createElement('div');
    scrim.className = 'home-search-scrim';
    scrim.hidden = true;
    document.body.appendChild(scrim);

    showGuide();
    startGuide();

    input.addEventListener('focus', () => { stopGuide(); open(); });
    input.addEventListener('click', () => { if (!isOpen()) open(); });
    input.addEventListener('input', () => { stopGuide(); showGuide(); open(); });
    input.addEventListener('blur', () => {
      close();
      if (input.value === '') startGuide();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen()) open();
        highlight(current < 0 && e.key === 'ArrowUp' ? -1 : current + (e.key === 'ArrowDown' ? 1 : -1));
      } else if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        close();
      }
    });
    // A press on an item keeps focus in the bar, so the list is still there for the click.
    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => {
      const row = e.target.closest('[role="option"]');
      if (row) go(options[Number(row.dataset.index)]);
    });
    scrim.addEventListener('click', () => { close(); input.blur(); });
  }

  return { mount, submit };
})();
