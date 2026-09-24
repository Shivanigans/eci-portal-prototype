class Page extends DCLogic {
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
    return {
      ...this.headerVals({ loggedIn: false, homeHref: 'index.html' }),
      onSubmit: (e) => {
        e.preventDefault();

        const mode = document.querySelector('[role="tab"][aria-selected="true"]').dataset.mode;

        if (mode === 'resident') {
          const mobile = document.getElementById('mobileNumber');
          const residentEpic = document.getElementById('residentEpic');
          const mobileError = document.getElementById('mobileError');
          const residentEpicError = document.getElementById('residentEpicError');

          const mobileValue = mobile.value.trim();
          const epicValue = residentEpic.value.trim();
          let hasError = false;

          mobileError.style.display = 'none';
          residentEpicError.style.display = 'none';
          mobile.removeAttribute('aria-invalid');
          residentEpic.removeAttribute('aria-invalid');

          if (mobileValue && !/^[6-9]\d{9}$/.test(mobileValue)) {
            mobileError.textContent = 'Enter a valid 10-digit mobile number.';
            mobileError.style.display = 'block';
            mobile.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (epicValue && !/^[A-Z]{3}[0-9]{7}$/i.test(epicValue)) {
            residentEpicError.textContent = 'Enter a valid EPIC number, for example ABC1234567.';
            residentEpicError.style.display = 'block';
            residentEpic.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (!mobileValue && !epicValue) {
            mobileError.textContent = 'Enter your registered mobile number or EPIC number.';
            mobileError.style.display = 'block';
            mobile.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (hasError) {
            mobile.focus();
            return;
          }
        } else {
          const email = document.getElementById('overseasEmail');
          const overseasEpic = document.getElementById('overseasEpic');
          const emailError = document.getElementById('overseasEmailError');
          const overseasEpicError = document.getElementById('overseasEpicError');

          const emailValue = email.value.trim();
          const epicValue = overseasEpic.value.trim();
          let hasError = false;

          emailError.style.display = 'none';
          overseasEpicError.style.display = 'none';
          email.removeAttribute('aria-invalid');
          overseasEpic.removeAttribute('aria-invalid');

          if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            emailError.textContent = 'Enter a valid email address.';
            emailError.style.display = 'block';
            email.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (epicValue && !/^[A-Z]{3}[0-9]{7}$/i.test(epicValue)) {
            overseasEpicError.textContent = 'Enter a valid EPIC number, for example ABC1234567.';
            overseasEpicError.style.display = 'block';
            overseasEpic.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (!emailValue && !epicValue) {
            emailError.textContent = 'Enter your email address or EPIC number.';
            emailError.style.display = 'block';
            email.setAttribute('aria-invalid', 'true');
            hasError = true;
          }

          if (hasError) {
            email.focus();
            return;
          }
        }

        location.href = 'index.html?loggedIn=1';
      }
    };
  }
}

const tabs = document.querySelectorAll('[role="tab"]');
const residentGroup = document.getElementById('residentGroup');
const overseasGroup = document.getElementById('overseasGroup');
const mobileNumber = document.getElementById('mobileNumber');
const residentEpic = document.getElementById('residentEpic');
const mobileNumberWrap = document.getElementById('mobileNumberWrap');
const overseasEmail = document.getElementById('overseasEmail');
const overseasEpic = document.getElementById('overseasEpic');

function setMode(mode) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.setAttribute('aria-selected', String(selected));
    tab.style.background = selected ? '#4A2BC2' : 'transparent';
    tab.style.color = selected ? '#FAFAFA' : '#404040';
    tab.style.boxShadow = selected ? '0 2px 6px rgba(74, 43, 194, 0.18)' : 'none';
  });

  if (mode === 'resident') {
    residentGroup.style.display = 'flex';
    overseasGroup.style.display = 'none';
  } else {
    residentGroup.style.display = 'none';
    overseasGroup.style.display = 'flex';
  }
}

mobileNumber.addEventListener('input', () => {
  if (mobileNumber.value.trim() !== '') {
    residentEpic.disabled = true;
    residentEpic.style.background = '#F5F5F5';
    residentEpic.style.borderColor = '#D9D9D9';
    residentEpic.style.color = '#A3A3A3';
  } else if (residentEpic.value.trim() === '') {
    residentEpic.disabled = false;
    residentEpic.style.background = '#FFFFFF';
    residentEpic.style.borderColor = '#737373';
    residentEpic.style.color = '#171717';
  }

  // The field being typed in always stays in its active colours.
  mobileNumberWrap.style.borderColor = '#737373';
  mobileNumberWrap.style.background = '#FFFFFF';
  mobileNumber.style.color = '#171717';
});

residentEpic.addEventListener('input', () => {
  if (residentEpic.value.trim() !== '') {
    mobileNumber.disabled = true;
    mobileNumberWrap.style.borderColor = '#D9D9D9';
    mobileNumberWrap.style.background = '#F5F5F5';
    mobileNumber.style.color = '#A3A3A3';
    residentEpic.style.background = '#FFFFFF';
    residentEpic.style.borderColor = '#737373';
    residentEpic.style.color = '#171717';
  } else if (mobileNumber.value.trim() === '') {
    mobileNumber.disabled = false;
    mobileNumberWrap.style.borderColor = '#737373';
    mobileNumberWrap.style.background = '#FFFFFF';
    mobileNumber.style.color = '#171717';
  }
});

overseasEmail.addEventListener('input', () => {
  if (overseasEmail.value.trim() !== '') {
    overseasEpic.disabled = true;
    overseasEpic.style.background = '#F5F5F5';
    overseasEpic.style.borderColor = '#D9D9D9';
    overseasEpic.style.color = '#A3A3A3';
  } else if (overseasEpic.value.trim() === '') {
    overseasEpic.disabled = false;
    overseasEpic.style.background = '#FFFFFF';
    overseasEpic.style.borderColor = '#737373';
    overseasEpic.style.color = '#171717';
  }
});

overseasEpic.addEventListener('input', () => {
  if (overseasEpic.value.trim() !== '') {
    overseasEmail.disabled = true;
    overseasEmail.style.background = '#F5F5F5';
    overseasEmail.style.borderColor = '#D9D9D9';
    overseasEmail.style.color = '#A3A3A3';
  } else if (overseasEmail.value.trim() === '') {
    overseasEmail.disabled = false;
    overseasEmail.style.background = '#FFFFFF';
    overseasEmail.style.borderColor = '#737373';
    overseasEmail.style.color = '#171717';
  }
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

DC.mount(Page, document.getElementById('app'), {});
