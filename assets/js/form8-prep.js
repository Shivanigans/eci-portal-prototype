class Page extends DCLogic {
  state = { urlLoggedIn: false, acknowledged: false };

  componentDidMount() {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('loggedIn') === '1' || q.get('signedIn') === '1') this.setState({ urlLoggedIn: true });
    } catch (e) {}
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
    const loggedIn = (this.props.loggedIn ?? false) || this.state.urlLoggedIn;
    const home = loggedIn ? 'index.html?loggedIn=1' : 'index.html';
    const keep = loggedIn ? '?loggedIn=1' : '';
    return {
      ...this.headerVals({ loggedIn: loggedIn, homeHref: home }),
      // Breadcrumb: Home goes to the homepage, and Correction of entries to its service cards,
      // where this form was chosen.
      servicesHref: home + '#services',
      trackHref: 'track.html' + keep,

      // Start application is disabled until the Aadhaar e-Sign acknowledgement is ticked, and
      // again if it is unticked. The page carries nothing into the form: the form asks what
      // the person needs to do as its first question. Signed out, log in comes first.
      acknowledged: this.state.acknowledged,
      toggleAck: (e) => this.setState({ acknowledged: e.target.checked }),
      startDisabled: !this.state.acknowledged,
      onStart: () => {
        const form = 'form8-application.html';
        location.href = loggedIn ? form + '?loggedIn=1' : 'login.html?next=' + encodeURIComponent(form);
      }
    };
  }
}

DC.mount(Page, document.getElementById('app'), {"loggedIn": false, "userName": "Ananya Rao"});
