class Page extends DCLogic {
  // PROTOTYPE: the sample reference is filled in, so a signed-out lookup needs only Find application.
  state = { urlLoggedIn: false, lookedUp: false, refInput: 'MP/BHO/2026/482913', refError: '' };

  // PLACEHOLDER DATA — one application as the portal would return it for the signed-in
  // person, or for a reference number looked up while signed out. Dates, the voter ID
  // number and the rejection reason are made up for the prototype.
  application = {
    reference: 'MP/BHO/2026/482913',
    status: 'verification',
    submittedOn: '7 September 2026',
    verificationStartedOn: '9 September 2026',
    verifiedOn: '14 September 2026',
    decidedOn: '16 September 2026',
    decidedDate: new Date(2026, 8, 16),
    addedOn: '18 September 2026',
    epicNumber: 'MPZ4829137',
    rejectionReason: 'The address on the electricity bill you uploaded as proof of address does not match the address you entered in section H, Present address details, of the form.',
    // Which form the application is: 6 unless the link says otherwise (see componentDidMount).
    form: '6',
    purpose: null,
    details: []
  };

  // Form 8 wording, used only when the application is a Form 8. Form 6 keeps its own.
  form8 = {
    purposes: { correct: 'Correct wrong details', move: 'Move to a new address', replace: 'Replace your voter ID card', disability: 'Mark as a person with disability' },
    details: { name: 'Name', gender: 'Gender', dob: 'Date of birth or age', relationType: 'Relation type', relativeName: 'Relative’s name', address: 'Address', mobile: 'Mobile number', photo: 'Photograph' },
    // PLACEHOLDER: a made-up rejection reason, as for Form 6.
    rejectionReason: 'The document you uploaded does not match the details you entered.'
  };

  // UNVERIFIED: the 15-day appeal window comes from an independent source, not from ECI
  // documentation. Confirm it against the Registration of Electors Rules before use.
  appealWindowDays = 15;

  componentDidMount() {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('loggedIn') === '1' || q.get('signedIn') === '1') this.setState({ urlLoggedIn: true });
      // Arriving from the confirmation page, the reference is the one just submitted.
      if (q.get('ref')) {
        this.application.reference = q.get('ref');
        this.application.submittedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        this.setState({ refInput: q.get('ref') });
      }
      // PROTOTYPE: the Form 8 confirmation passes form=8 with its purpose and, for corrections,
      // the details, so its reference opens the Form 8 view. A real portal would look these up
      // from the reference number. Without form=8 the page is the Form 6 view, as before.
      if (q.get('form') === '8') {
        const a = this.application;
        a.form = '8';
        a.purpose = this.form8.purposes[q.get('purpose')] ? q.get('purpose') : 'correct';
        a.details = (q.get('details') || '').split(',').filter(k => this.form8.details[k]);
        a.rejectionReason = this.form8.rejectionReason;
        document.title = 'Track your application: Form\u00A08';
      }
    } catch (e) {}
  }

  // The status to show. window.trackReview is set only by the review switcher
  // (track-review.js); without it the page shows the application's own status.
  status() {
    return (window.trackReview && window.trackReview.status) || this.application.status;
  }

  // Each state answers "where does it stand, and what do I do now". BLO and ERO are
  // spelled out the first time they appear on the page, whichever part that is.
  view(loggedIn) {
    const a = this.application;
    const status = this.status();
    const q = loggedIn ? '?loggedIn=1' : '';
    const primary = 'ux4g-btn ux4g-btn-primary ux4g-btn-md action';
    const secondary = 'ux4g-btn ux4g-btn-outline-secondary ux4g-btn-md action';
    const act = (label, href, cls, download) => ({ label: label, href: href, cls: cls, download: !!download });
    const copy = act('Download a copy', '#download-copy', secondary, true);
    const blo = (cls) => act('Book a call with your BLO', 'service.html?s=book-blo' + (loggedIn ? '&loggedIn=1' : ''), cls);
    // A Form 8 changes an entry already on the roll, so its approval and last stage say so.
    const f8 = a.form === '8';

    const states = {
      submitted: {
        pill: 'Submitted', tone: 'progress', bloSpelled: true,
        headline: 'Your application has been received.',
        support: 'A booth level officer (BLO) will verify your details next. Most applications are decided within 30 days of submission.',
        actions: [copy, blo(secondary)]
      },
      verification: {
        pill: 'Under verification', tone: 'progress', bloSpelled: true,
        headline: 'A booth level officer (BLO) is verifying your details and may visit the address you gave.',
        support: 'Keep your mobile phone reachable and your original documents to hand.',
        actions: [blo(primary), copy]
      },
      approved: {
        pill: 'Approved', tone: 'success', bloSpelled: false,
        headline: f8 ? 'Your application has been approved.' : 'Your name is on the electoral roll.',
        support: f8 ? 'Your entry was updated on ' + a.addedOn + '.' : 'It was added on ' + a.addedOn + '. Your voter ID (EPIC) number is ' + a.epicNumber + '.',
        actions: [act('Download your e-EPIC', 'service.html?s=epic' + (loggedIn ? '&loggedIn=1' : ''), primary, true), act('Find your polling station', 'service.html?s=polling' + (loggedIn ? '&loggedIn=1' : ''), secondary)]
      },
      rejected: {
        pill: 'Rejected', tone: 'error', bloSpelled: false,
        headline: 'Your application was rejected on ' + a.decidedOn + '.',
        support: a.rejectionReason,
        actions: [f8 ? act('Apply again with Form\u00A08', 'form8-prep.html' + q, primary) : act('Apply again with Form\u00A06', 'form6-prep.html' + q, primary), act('Appeal this decision', 'service.html?s=appeal' + (loggedIn ? '&loggedIn=1' : ''), secondary), act('Book a call with the booth level officer (BLO)', 'service.html?s=book-blo' + (loggedIn ? '&loggedIn=1' : ''), secondary)]
      }
    };
    const s = states[status] || states.verification;
    const bloText = s.bloSpelled || status === 'rejected' ? 'The BLO' : 'A booth level officer (BLO)';

    // done / current / failed / todo for each of the four stages, in every state.
    const plan = {
      submitted: ['done', 'todo', 'todo', 'todo'],
      verification: ['done', 'current', 'todo', 'todo'],
      approved: ['done', 'done', 'done', 'done'],
      rejected: ['done', 'done', 'failed', 'todo']
    }[status] || ['done', 'current', 'todo', 'todo'];
    const dates = {
      submitted: ['Submitted on ' + a.submittedOn],
      verification: ['Submitted on ' + a.submittedOn, 'In progress since ' + a.verificationStartedOn],
      approved: ['Submitted on ' + a.submittedOn, 'Completed on ' + a.verifiedOn, 'Approved on ' + a.decidedOn, (f8 ? 'Updated on ' : 'Added on ') + a.addedOn],
      rejected: ['Submitted on ' + a.submittedOn, 'Completed on ' + a.verifiedOn, 'Rejected on ' + a.decidedOn]
    }[status] || [];
    const stages = [
      { title: 'Application submitted', text: 'Your Form ' + a.form + ' was received online.' },
      { title: 'Field verification', text: bloText + ' checks your details and may visit your address.', proposed: true },
      { title: 'Decision', text: 'The electoral registration officer (ERO) approves or rejects the application.' },
      f8 ? { title: 'Entry updated', text: 'Your entry on the electoral roll is updated.' }
        : { title: 'Added to the electoral roll', text: 'Your name is added to the roll and your voter ID is issued.' }
    ].map((st, i) => {
      const p = plan[i];
      return {
        title: st.title,
        text: st.text,
        proposed: !!st.proposed,
        // UX4G only shows the indicator's icon on completed steps; tl-failed shows it too.
        icon: p === 'failed' ? 'close' : 'check',
        cls: 'ux4g-journey-step' + {
          done: ' ux4g-journey-step-completed',
          current: ' ux4g-journey-step-active',
          failed: ' tl-failed',
          todo: ''
        }[p],
        stateText: { done: 'completed', current: 'in progress', failed: 'rejected', todo: 'not yet reached' }[p],
        date: dates[i] || 'Not yet reached'
      };
    });

    // UX4G Tag: tonal purple while in progress, solid green when approved, solid red when rejected.
    return {
      tagLabel: s.pill,
      tagClass: { progress: 'ux4g-tag-tonal-primary', success: 'ux4g-tag-filled-success', error: 'ux4g-tag-filled-error' }[s.tone],
      tagIcon: { progress: 'schedule', success: 'check_circle', error: 'cancel' }[s.tone],
      answerClass: 'answer answer-' + s.tone,
      headline: s.headline,
      support: s.support,
      actions: s.actions,
      rejected: status === 'rejected',
      stages: stages
    };
  }

  appeal() {
    const deadline = new Date(this.application.decidedDate.getTime());
    deadline.setDate(deadline.getDate() + this.appealWindowDays);
    const date = deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const left = Math.round((deadline - today) / 86400000);
    if (left < 0) return { days: 'The appeal window has closed', date: 'Appeals had to be made by ' + date + '.' };
    return { days: left === 0 ? 'Last day to appeal' : left + (left === 1 ? ' day' : ' days') + ' left to appeal', date: 'Appeal by ' + date + '.' };
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
    const refPattern = /^[A-Z]{2}\/[A-Z]{3}\/\d{4}\/\d{6}$/i;
    return {
      ...this.headerVals({ loggedIn: loggedIn, homeHref: loggedIn ? 'index.html?loggedIn=1' : 'index.html' }),
      trackHref: loggedIn ? 'track.html?loggedIn=1' : 'track.html',

      // Signed in, the portal already knows who this is, so it lists their applications
      // without asking for anything. Signed out, a reference number finds the same result.
      showResult: loggedIn || this.state.lookedUp,
      app: this.application,
      // The form type comes from the application, never from the page.
      appTitle: this.application.form === '8'
        ? 'Form\u00A08: ' + this.form8.purposes[this.application.purpose]
        : 'New voter registration (Form\u00A06)',
      formCrumb: 'Form ' + this.application.form,
      correcting: this.application.form === '8' && this.application.details.length > 0,
      detailsLine: 'Details being corrected: ' + this.application.details.map(k => this.form8.details[k]).join(', '),
      view: this.view(loggedIn),
      appeal: this.appeal(),

      refInput: this.state.refInput,
      refError: this.state.refError,
      refInvalid: !!this.state.refError,
      refValid: !this.state.refError,
      refFieldClass: 'ux4g-input-container ux4g-input-md ' + (this.state.refError ? 'ux4g-input-error' : 'ux4g-input-default'),
      // Raised only when Find application is pressed; cleared as soon as it is put right.
      onRefInput: (e) => {
        const value = e.target.value;
        const fixed = this.state.refError && refPattern.test(value.trim());
        this.setState(fixed ? { refInput: value, refError: '' } : { refInput: value });
      },
      lookUp: (e) => {
        e.preventDefault();
        const value = this.state.refInput.trim();
        if (!value) { this.setState({ refError: 'Enter your application reference number.', lookedUp: false }); document.getElementById('ref').focus(); return; }
        if (!refPattern.test(value)) { this.setState({ refError: 'Enter the reference number as it appears on your confirmation, for example MP/BHO/2026/482913.', lookedUp: false }); document.getElementById('ref').focus(); return; }
        this.application.reference = value.toUpperCase();
        this.setState({ refError: '', lookedUp: true });
      }
    };
  }
}

DC.mount(Page, document.getElementById('app'), {"loggedIn": false, "userName": "Ananya Rao"});
