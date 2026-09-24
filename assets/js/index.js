class Page extends DCLogic {
  state = { scale: 1, wide: false, lang: 'en', guidesOpen: false, officeState: 'Delhi', panelOpen: false, loggedIn: false, loginOpen: true, sirState: 'Madhya Pradesh', sirDismissed: false };

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

  componentDidMount() {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('lang', 'en');
    try {
      const p = new URLSearchParams(location.search);
      if (p.get('loggedIn') === '1' || p.get('signedIn') === '1') this.setState({ loggedIn: true, loginOpen: false });
      if (sessionStorage.getItem('eci-sir-strip') === 'dismissed') this.setState({ sirDismissed: true });
    } catch (e) {}
  }

  personas = DC.ref();

  scrollPersonas(dir) {
    const el = this.personas.current;
    if (el) el.scrollBy({ left: dir * 552, behavior: 'smooth' });
  }

  // Everything the shared <header> binds to. The header markup is identical on every
  // page, so this method is too; each page only says whether someone is signed in,
  // where the emblem links, and (on the homepage) what Log in does.
  headerVals({ loggedIn, homeHref, onLoginClick }) {
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
        onLoginClick: (e) => { e.preventDefault(); this.setState({ loginOpen: true }); }
      }),
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
      loginOpen: this.state.loginOpen && !this.state.loggedIn,
      closeLogin: () => this.setState({ loginOpen: false }),
      submitLogin: (e) => { e.preventDefault(); this.setState({ loggedIn: true, loginOpen: false }); },
      showAppBanner: this.props.showAppBanner ?? true,
      personasRef: this.personas,
      scrollPersonasLeft: () => this.scrollPersonas(-1),
      scrollPersonasRight: () => this.scrollPersonas(1),
      panelOpen: this.state.panelOpen || (this.props.openFormSheet ?? false),
      closePanel: () => this.setState({ panelOpen: false }),
      chk1: !!this.state.chk1, toggle1: () => this.setState(s => ({ chk1: !s.chk1 })),
      chk2: !!this.state.chk2, toggle2: () => this.setState(s => ({ chk2: !s.chk2 })),
      chk3: !!this.state.chk3, toggle3: () => this.setState(s => ({ chk3: !s.chk3 })),
      chk4: !!this.state.chk4, toggle4: () => this.setState(s => ({ chk4: !s.chk4 })),
      onRegisterClick: (e) => {
        e.preventDefault();
        if (!this.state.loggedIn) { this.setState({ loginOpen: true }); return; }
        location.href = 'form6-prep.html?loggedIn=1';
      },
      officeStates: Object.keys(this.offices),
      officeState: this.state.officeState,
      officeName: this.offices[this.state.officeState].name,
      officeAddress: this.offices[this.state.officeState].address,
      onOfficeChange: (e) => this.setState({ officeState: e.target.value }),
      onSearchSubmit: (e) => e.preventDefault()
    };
  }
}

DC.mount(Page, document.getElementById('app'), {"showAccessibilityBar": true, "showAppBanner": true, "openFormSheet": false});
