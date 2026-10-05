class Page extends DCLogic {
  state = { scale: 1, wide: false, lang: 'en', guidesOpen: false, officeState: 'Delhi', panelOpen: false, loggedIn: false, sirState: 'Madhya Pradesh', sirDismissed: false };

  // PLACEHOLDER DATA — check against the ECI site before use. Phase dates, the list of
  // states currently mid-phase, and the documents accepted under Special Intensive Revision
  // are all unconfirmed. The nationwide exercise was announced on 27 October 2025.
  sirPhases = {
    'Madhya Pradesh': { open: true, closes: '30 September 2026' },
    'Delhi': { open: true, closes: '7 October 2026' },
    'Maharashtra': { open: false, closes: '' },
    'Karnataka': { open: false, closes: '' },
    'Tamil Nadu': { open: false, closes: '' },
    'Uttar Pradesh': { open: true, closes: '15 October 2026' },
    'West Bengal': { open: false, closes: '' }
  };

  offices = {
    'Delhi': { name: 'Chief Electoral Officer, Delhi', address: 'Old St. Stephen\u2019s College Building, Kashmere Gate, Delhi-110006' },
    'Maharashtra': { name: 'Chief Electoral Officer, Maharashtra', address: 'Mantralaya, Madam Cama Road, Hutatma Rajguru Chowk, Mumbai-400032' },
    'Karnataka': { name: 'Chief Electoral Officer, Karnataka', address: 'Kalpavriksha Bhavan, No. 40, Nrupathunga Road, Bengaluru-560001' },
    'Tamil Nadu': { name: 'Chief Electoral Officer, Tamil Nadu', address: 'Secretariat, Fort St. George, Chennai-600009' },
    'Uttar Pradesh': { name: 'Chief Electoral Officer, Uttar Pradesh', address: 'Vidhan Bhawan, Sarvodaya Nagar, Lucknow-226001' },
    'West Bengal': { name: 'Chief Electoral Officer, West Bengal', address: '21, N.S. Road, 4th Floor, Kolkata-700001' }
  };

  // The log in dialog: the shared log in form (assets/js/login-form.js). Signing in there
  // signs the person in on this page.
  openLogin() {
    LoginForm.openDialog({ onSuccess: () => this.setState({ loggedIn: true }) });
  }

  componentDidMount() {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('lang', 'en');
    try {
      const p = new URLSearchParams(location.search);
      if (p.get('loggedIn') === '1' || p.get('signedIn') === '1') this.setState({ loggedIn: true });
      if (sessionStorage.getItem('eci-sir-strip') === 'dismissed') this.setState({ sirDismissed: true });
    } catch (e) {}
    // The search bar's rotating guide and suggestions. Links keep the signed-in state.
    HomeSearch.mount(document.querySelector('.home-search'), { loggedIn: () => this.state.loggedIn });
    // Signed out, the log in dialog opens on arrival, as before.
    if (!this.state.loggedIn) this.openLogin();
  }

  // Everything the shared <header> binds to. The header markup is identical on every
  // page, so this method is too; each page only says whether someone is signed in,
  // where the emblem links, and (on the homepage) what Log in does.
  headerVals({ loggedIn, homeHref, onLoginClick, onLogOut }) {
    const s = this.state;
    const lang = s.lang || 'en';
    const name = this.props.userName ?? 'Ananya Rao';
    const opt = (on) => 'display: block; width: 100%; text-align: left; padding: 8px 10px; border: none; border-radius: 6px; background: transparent; font-family: inherit; font-size: 13px; line-height: 18px; cursor: pointer; font-weight: ' + (on ? '600' : '500') + '; color: ' + (on ? '#4A2BC2' : '#171717') + ';';
    return {
      homeHref: homeHref,
      isLoggedIn: loggedIn,
      isLoggedOut: !loggedIn,
      onLoginClick: onLoginClick,
      userName: name,
      userInitials: name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
      textZoom: s.scale || 1,
      rootTracking: s.wide ? '0.06em' : 'normal',
      trackingWide: !!s.wide,
      toggleTracking: () => this.setState(st => ({ wide: !st.wide })),
      increaseText: () => this.setState(st => ({ scale: Math.min(1.4, +((st.scale || 1) + 0.1).toFixed(2)) })),
      decreaseText: () => this.setState(st => ({ scale: Math.max(0.85, +((st.scale || 1) - 0.1).toFixed(2)) })),
      resetText: () => this.setState({ scale: 1 }),
      isEnglish: lang === 'en',
      isHindi: lang === 'hi',
      langLabel: lang === 'en' ? 'English' : 'हिन्दी',
      langOpen: !!s.langOpen,
      toggleLangMenu: () => this.setState(st => ({ langOpen: !st.langOpen })),
      enOptStyle: opt(lang === 'en'),
      hiOptStyle: opt(lang === 'hi'),
      setEnglish: () => this.setState({ lang: 'en', langOpen: false }),
      setHindi: () => this.setState({ lang: 'hi', langOpen: false }),
      guidesOpen: !!s.guidesOpen,
      openGuides: () => this.setState({ guidesOpen: true }),
      closeGuides: () => this.setState({ guidesOpen: false }),
      // Keyboard: close the Guides menu once focus has left the link and its menu.
      closeGuidesOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-guides]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ guidesOpen: false });
      },
      // Help menu: opens on click; Escape or focus leaving it closes it.
      helpOpen: !!s.helpOpen,
      toggleHelp: () => this.setState(st => ({ helpOpen: !st.helpOpen })),
      closeHelpOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-help]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ helpOpen: false });
      },
      helpKeydown: (e) => {
        if (e.key !== 'Escape' || !s.helpOpen) return;
        this.setState({ helpOpen: false });
        e.currentTarget.querySelector('button').focus();
      },
      helpBloHref: 'service.html?s=book-blo' + (loggedIn ? '&loggedIn=1' : ''),
      // Log in brings the person back to this page, signed in.
      loginHref: 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'),
      // Account menu, shown once signed in: profile, my applications, log out.
      accountOpen: !!s.accountOpen,
      toggleAccount: () => this.setState(st => ({ accountOpen: !st.accountOpen })),
      closeAccountOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-account]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ accountOpen: false });
      },
      // Signs out straight away by reloading this page without the signed-in flag. Only a
      // page with unsaved work (the application form) passes onLogOut to ask first.
      logOut: () => {
        this.setState({ accountOpen: false });
        if (onLogOut) { onLogOut(); return; }
        const q = new URLSearchParams(location.search);
        q.delete('loggedIn'); q.delete('signedIn');
        location.href = location.pathname + (q.toString() ? '?' + q : '');
      }
    };
  }

  renderVals() {
    const phase = this.sirPhases[this.state.sirState] || { open: false, closes: '' };
    return {
      // The homepage has its own sign-in dialog, so Log in opens that rather than navigating.
      ...this.headerVals({
        loggedIn: this.state.loggedIn,
        homeHref: this.state.loggedIn ? 'index.html?loggedIn=1' : 'index.html',
        onLoginClick: (e) => { e.preventDefault(); this.openLogin(); }
      }),
      // Services not built in this prototype open service.html, which shows a "Coming soon"
      // empty state instead of a link that goes nowhere.
      svc: ['polling', 'epic', 'book-blo', 'profile', 'appeal', 'appeal-adjudication', 'deletion', 'nri', 'results', 'download-forms', 'find-centre']
        .reduce((all, id) => {
          all[id.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = 'service.html?s=' + id + (this.state.loggedIn ? '&loggedIn=1' : '');
          return all;
        }, {}),
      sirState: this.state.sirState,
      sirCloseDate: phase.closes,
      sirOpenHere: phase.open,
      sirStripVisible: this.state.loggedIn && phase.open && !this.state.sirDismissed,
      sirPhaseLine: phase.open
        ? 'A phase is open in ' + this.state.sirState + '. Enumeration forms must be returned by ' + phase.closes + '.'
        : 'No phase is open in ' + this.state.sirState + ' at the moment. The dates for the next phase are yet to be confirmed.',
      onSirState: (e) => this.setState({ sirState: e.target.value }),
      dismissSir: () => {
        try { sessionStorage.setItem('eci-sir-strip', 'dismissed'); } catch (err) {}
        this.setState({ sirDismissed: true });
      },
      showAppBanner: this.props.showAppBanner ?? true,
      panelOpen: this.state.panelOpen || (this.props.openFormSheet ?? false),
      closePanel: () => this.setState({ panelOpen: false }),
      chk1: !!this.state.chk1, toggle1: () => this.setState(s => ({ chk1: !s.chk1 })),
      chk2: !!this.state.chk2, toggle2: () => this.setState(s => ({ chk2: !s.chk2 })),
      chk3: !!this.state.chk3, toggle3: () => this.setState(s => ({ chk3: !s.chk3 })),
      chk4: !!this.state.chk4, toggle4: () => this.setState(s => ({ chk4: !s.chk4 })),
      onRegisterClick: (e) => {
        e.preventDefault();
        if (!this.state.loggedIn) { this.openLogin(); return; }
        location.href = 'form6-prep.html?loggedIn=1';
      },
      // The Form 8 prep page asks nothing, so it opens signed in or not, keeping the state.
      onForm8Click: (e) => {
        e.preventDefault();
        location.href = 'form8-prep.html' + (this.state.loggedIn ? '?loggedIn=1' : '');
      },
      officeStates: Object.keys(this.offices),
      officeState: this.state.officeState,
      officeName: this.offices[this.state.officeState].name,
      officeAddress: this.offices[this.state.officeState].address,
      onOfficeChange: (e) => this.setState({ officeState: e.target.value }),
      onSearchSubmit: (e) => { e.preventDefault(); HomeSearch.submit(); }
    };
  }
}

DC.mount(Page, document.getElementById('app'), {"showAccessibilityBar": true, "showAppBanner": true, "openFormSheet": false});
