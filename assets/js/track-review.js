// REVIEW ONLY — remove this file, and its <script> tag in track.html, before the prototype
// ships. It lets reviewers see the four application states by adding ?status= to the URL
// (submitted, verification, approved, rejected) and shows a small switcher in the corner.
// track.js reads window.trackReview only if it exists, so the page works without this file.
(function () {
  var states = [
    ['submitted', 'Submitted'],
    ['verification', 'Under verification'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected']
  ];
  var params = new URLSearchParams(location.search);
  var current = params.get('status');
  var known = states.some(function (s) { return s[0] === current; });
  if (!known) current = 'verification';
  window.trackReview = { status: current };

  document.addEventListener('DOMContentLoaded', function () {
    var panel = document.createElement('nav');
    panel.setAttribute('aria-label', 'Review: application state');
    panel.style.cssText = 'position: fixed; right: 16px; bottom: 16px; z-index: 100; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; max-width: calc(100vw - 32px); padding: 8px 10px; border-radius: 10px; background: #171717; color: #FAFAFA; font: 12px/16px "Noto Sans", system-ui, sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,0.25);';
    var label = document.createElement('span');
    label.textContent = 'Review state:';
    label.style.cssText = 'margin-right: 2px; color: #A3A3A3;';
    panel.appendChild(label);

    states.forEach(function (s) {
      var q = new URLSearchParams(location.search);
      q.set('status', s[0]);
      var a = document.createElement('a');
      a.href = '?' + q.toString();
      a.textContent = s[1];
      var on = s[0] === current;
      if (on) a.setAttribute('aria-current', 'true');
      a.style.cssText = 'display: inline-flex; align-items: center; min-height: 28px; padding: 0 10px; border-radius: 999px; text-decoration: none; color: ' + (on ? '#171717' : '#FAFAFA') + '; background: ' + (on ? '#FAFAFA' : 'transparent') + '; border: 1px solid #525252;';
      panel.appendChild(a);
    });

    // Switch between the signed-in list and the signed-out reference lookup.
    var q = new URLSearchParams(location.search);
    var signedIn = q.get('loggedIn') === '1';
    if (signedIn) q.delete('loggedIn'); else q.set('loggedIn', '1');
    var who = document.createElement('a');
    who.href = '?' + q.toString();
    who.textContent = signedIn ? 'View signed out' : 'View signed in';
    who.style.cssText = 'display: inline-flex; align-items: center; min-height: 28px; padding: 0 10px; margin-left: 4px; border-radius: 999px; color: #C4B5FD; text-decoration: underline;';
    panel.appendChild(who);

    document.body.appendChild(panel);
  });
})();
