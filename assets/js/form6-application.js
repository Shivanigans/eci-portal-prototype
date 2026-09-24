class Page extends DCLogic {
  sectionList = [
    { key: 'constituency', id: 'constituency', label: 'Select state, district and constituency' },
    { key: 'personal', id: 'your-details', label: 'Personal details' },
    { key: 'relative', id: 'relative', label: 'Parent or spouse details' },
    { key: 'contact', id: 'contact', label: 'Contact details' },
    { key: 'aadhaar', id: 'aadhaar', label: 'Aadhaar details' },
    { key: 'gender', id: 'gender', label: 'Gender' },
    { key: 'dob', id: 'dob', label: 'Date of birth details' },
    { key: 'address', id: 'address', label: 'Current address details' },
    { key: 'disability', id: 'disability', label: 'Disability details' },
    { key: 'family', id: 'family', label: 'Family member details' },
    { key: 'declaration', id: 'declaration', label: 'Declaration' }
  ];

  // PLACEHOLDER DATA — the states and union territories are complete, but only Madhya
  // Pradesh has districts and only Bhopal has assembly constituencies, and the constituency
  // numbers are unconfirmed. The real lists belong to ECI's data, not this page.
  states = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
    'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

  districts = {
    'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind',
      'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna',
      'Gwalior', 'Harda', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla',
      'Mandsaur', 'Mauganj', 'Morena', 'Narmadapuram', 'Narsinghpur', 'Neemuch', 'Niwari', 'Pandhurna', 'Panna',
      'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur',
      'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha']
  };

  assemblyConstituencies = {
    'Bhopal': ['Berasia', 'Bhopal Uttar', 'Narela', 'Bhopal Dakshin-Paschim', 'Bhopal Madhya', 'Govindpura', 'Huzur']
  };

  parliamentaryConstituencies = ['Chandigarh', 'Lakshadweep', 'Ladakh'];

  acNumbers = { 'Huzur': '155', 'Bhopal Madhya': '152', 'Narela': '151', 'Govindpura': '153' };

  messages = {
    'state': 'Select your state or union territory.',
    'district': 'Select your district.',
    'constituency-type': 'Choose assembly or parliamentary constituency.',
    'ac-name': 'Select your assembly constituency.',
    'ac-number': 'Enter the constituency number, using digits only.',
    'pc-name': 'Select your parliamentary constituency.',
    'pc-number': 'Enter the constituency number, using digits only.',
    'first-name': 'Enter your first name as it appears on your Aadhaar card.',
    'rel-name': 'Enter the name of your parent or spouse.',
    'rel-type': 'Select a relationship.',
    'mobile': 'Enter a ten digit mobile number.',
    'email': 'Enter an email address in the format name@example.com.',
    'aadhaar-number': 'Enter all twelve digits of your Aadhaar number.',
    'dob-date': 'Enter your date of birth as DD/MM/YYYY.',
    'house': 'Enter your house or flat number.',
    'street': 'Enter your street or locality.',
    'town': 'Enter your town or village.',
    'post-office': 'Enter your post office.',
    'pin': 'Enter a six digit pin code.',
    'addr-district': 'Select your district.',
    'family-name': 'Enter the name of the family member.',
    'family-relation': 'Select a relationship.',
    'family-epic': 'Enter a ten character voter ID, three letters followed by seven digits.',
    'decl-place': 'Enter the place where you are making this declaration.',
    'decl-date': 'Enter the date as DD/MM/YYYY.',
    'gender': 'Select your gender.',
    'declaration-confirm': 'Tick the declaration to continue.'
  };

  controlsIn(sectionId) {
    const root = document.getElementById(sectionId);
    if (!root) return [];
    return Array.prototype.slice.call(root.querySelectorAll('input, select, textarea'))
      .filter(el => el.willValidate && el.type !== 'file');
  }

  // DD/MM/YYYY that also exists on the calendar, so 31/02/2008 is caught.
  realDate(text) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text || '');
    if (!m) return null;
    const d = +m[1], mo = +m[2], y = +m[3];
    const date = new Date(y, mo - 1, d);
    return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
  }

  checkSection(sectionId) {
    const found = {};
    this.controlsIn(sectionId).forEach(el => {
      const key = el.id || el.name;
      if (!key || found[key]) return;
      if (!el.checkValidity()) { found[key] = this.messages[key] || el.validationMessage; return; }
      if (el.hasAttribute('data-date') && el.value && !this.realDate(el.value)) found[key] = el.value + ' is not a real date. Check the day and month.';
    });
    return found;
  }

  // The words a person sees for a field, for the summary at the top of a section.
  fieldLabel(key) {
    const el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
    if (!el) return key;
    if (el.dataset.label) return el.dataset.label;
    const fieldset = el.closest('fieldset');
    const source = (el.id && document.querySelector('label[for="' + el.id + '"]')) || (fieldset && fieldset.querySelector('legend'));
    if (!source) return key;
    const copy = source.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"], [data-no-summary]').forEach(n => n.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  applyErrors(sectionId, found) {
    const errors = Object.assign({}, this.state.errors);
    this.controlsIn(sectionId).forEach(el => { delete errors[el.id || el.name]; });
    Object.keys(found).forEach(k => { errors[k] = found[k]; });
    return errors;
  }

  // Errors are raised only here, when Save and continue is pressed: never while typing and
  // never on blur. Once raised, each one clears as soon as it is put right (see below).
  saveOrShowErrors(sectionId, proceed) {
    const found = this.checkSection(sectionId);
    const keys = Object.keys(found);
    const summaries = Object.assign({}, this.state.summaries);
    if (keys.length) summaries[sectionId] = keys.map(k => ({ key: k, label: this.fieldLabel(k) }));
    else delete summaries[sectionId];
    this.setState({ errors: this.applyErrors(sectionId, found), summaries: summaries });
    if (keys.length) {
      const first = this.controlsIn(sectionId).filter(el => (el.id || el.name) === keys[0])[0];
      if (first && first.focus) setTimeout(() => first.focus(), 0);
      return;
    }
    proceed();
  }

  // A quiet reassurance that answers are being kept. It appears at most once every
  // 30 seconds while someone is filling in the form, fades on its own, and blocks nothing.
  showSaved(force) {
    const now = Date.now();
    if (!force && now - (this.lastSavedNote || 0) < 30000) return;
    this.lastSavedNote = now;
    const time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    this.setState({ savedNote: 'Progress saved at ' + time });
    clearTimeout(this.savedNoteTimer);
    this.savedNoteTimer = setTimeout(() => this.setState({ savedNote: '' }), 4000);
  }

  // Errors are only ever added by Save and continue, but one that has been put right goes
  // away as soon as it is: the field's message, its red state and its line in the summary.
  clearFixedErrors() {
    const errors = Object.assign({}, this.state.errors);
    let changed = false;
    Object.keys(errors).forEach(key => {
      const el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
      if (!el || !el.checkValidity()) return;
      if (el.hasAttribute('data-date') && el.value && !this.realDate(el.value)) return;
      delete errors[key];
      changed = true;
    });
    if (!changed) return;
    const summaries = {};
    Object.keys(this.state.summaries).forEach(id => {
      const left = this.state.summaries[id].filter(it => errors[it.key]);
      if (left.length) summaries[id] = left;
    });
    this.setState({ errors: errors, summaries: summaries });
  }

  componentDidMount() {
    this.noteSaved = (e) => {
      if (this.state.screen === 'form' && e.target.closest && e.target.closest('section[id]')) this.showSaved(false);
    };
    // Checked after the page has re-rendered, so a combobox pick or radio choice is in place.
    this.afterInteraction = () => {
      if (Object.keys(this.state.errors).length) setTimeout(() => this.clearFixedErrors(), 0);
    };
    document.addEventListener('change', this.noteSaved, true);
    ['input', 'change', 'click', 'focusout'].forEach(t => document.addEventListener(t, this.afterInteraction, true));
  }

  componentWillUnmount() {
    document.removeEventListener('change', this.noteSaved, true);
    ['input', 'change', 'click', 'focusout'].forEach(t => document.removeEventListener(t, this.afterInteraction, true));
  }


  state = {
    active: 'constituency',
    open: 'constituency',
    errors: {},
    summaries: {},
    done: [],
    // Neither constituency type is chosen for the person, and neither is ruled out.
    type: '',
    tip: null,
    combo: null,
    docs: {},
    submitting: false,
    savedNote: '',
    noAadhaar: false,
    declared: false,
    leaveOpen: false,
    leaveHref: 'index.html?loggedIn=1',
    screen: 'form',
    refNumber: '',
    copied: false,
    disabilities: { visual: false, hearing: false, locomotor: false, other: false },
    values: {
      state: 'Madhya Pradesh', district: 'Bhopal', acName: 'Huzur', acNumber: '155', pcName: '', pcNumber: '',
      firstName: 'Ananya Devi', surname: 'Rao', nameRegional: 'अनन्या देवी राव',
      relativeName: 'Suresh Rao', relativeRelation: 'father',
      mobile: '98765 43210', email: 'ananya.rao@example.com',
      aadhaar: '2345 6789 0123',
      gender: 'female',
      dob: '17/04/2008',
      house: '14-B, Ashoka Apartments', street: 'Shivaji Nagar', town: 'Bhopal',
      postOffice: 'Shivaji Nagar', pin: '462016', addrDistrict: 'Bhopal',
      familyName: 'Suresh Rao', familyRelation: 'father', familyEpic: 'MPZ1234567',
      place: 'Bhopal', declDate: '12/09/2026'
    }
  };

  scrollTo(id) {
    setTimeout(() => {
      const el = document.getElementById(id);
      const se = document.scrollingElement || document.documentElement;
      if (el && se) se.scrollTop = el.getBoundingClientRect().top + se.scrollTop - 88;
    }, 0);
  }

  jump(id) {
    return (e) => {
      e.preventDefault();
      this.openSection(id);
    };
  }

  openSection(id) {
    this.setState({ open: id, active: id || this.state.active });
    if (id) this.scrollTo(id);
  }

  saveSection(id) {
    const ids = this.sectionList.map(s => s.id);
    const next = this.sectionList[ids.indexOf(id) + 1];
    const done = this.state.done.indexOf(id) > -1 ? this.state.done : this.state.done.concat([id]);
    this.setState({ done: done, open: next ? next.id : null, active: next ? next.id : id });
    if (next) this.scrollTo(next.id);
    this.showSaved(true);
  }

  goToPreview() {
    const done = this.state.done.indexOf('declaration') > -1 ? this.state.done : this.state.done.concat(['declaration']);
    this.setState({ done: done, open: null, screen: 'preview' });
    setTimeout(() => {
      const se = document.scrollingElement || document.documentElement;
      if (se) se.scrollTop = 0;
    }, 0);
  }

  editSection(id) {
    return () => {
      this.setState({ screen: 'form', open: id, active: id });
      this.scrollTo(id);
    };
  }

  previewRows() {
    const v = this.state.values;
    const dis = this.state.disabilities;
    const genderLabels = { male: 'Male', female: 'Female', third: 'Third gender' };
    const disList = [];
    if (dis.visual) disList.push('Visual impairment');
    if (dis.hearing) disList.push('Speech or hearing disability');
    if (dis.locomotor) disList.push('Locomotor disability');
    if (dis.other) disList.push('Another disability');
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    const assembly = this.state.type === 'assembly';
    const parliamentary = this.state.type === 'parliamentary';
    return [
      { letter: 'A', id: 'constituency', heading: 'Constituency details', rows: [
        { label: 'State or union territory', value: v.state },
        { label: 'District', value: v.district },
        { label: assembly ? 'Assembly constituency name' : parliamentary ? 'Parliamentary constituency name' : 'Constituency name', value: assembly ? v.acName : parliamentary ? v.pcName : '' },
        { label: assembly ? 'Assembly constituency number' : parliamentary ? 'Parliamentary constituency number' : 'Constituency number', value: assembly ? v.acNumber : parliamentary ? v.pcNumber : '' }
      ] },
      { letter: 'B', id: 'your-details', heading: 'Applicant details', rows: [
        { label: 'First name and middle name', value: v.firstName },
        { label: 'Surname', value: v.surname },
        { label: 'Name in regional language', value: v.nameRegional },
        { label: 'Passport size photograph', value: this.state.done.indexOf('your-details') > -1 ? 'Attached' : '' }
      ] },
      { letter: 'C', id: 'relative', heading: 'Details of parent or spouse', rows: [
        { label: 'Name', value: v.relativeName },
        { label: 'Relationship to the applicant', value: cap(v.relativeRelation) }
      ] },
      { letter: 'D', id: 'contact', heading: 'Contact details', rows: [
        { label: 'Mobile number', value: v.mobile },
        { label: 'Email address', value: v.email }
      ] },
      { letter: 'E', id: 'aadhaar', heading: 'Aadhaar details', rows: [
        { label: 'Aadhaar number', value: this.state.noAadhaar ? '' : v.aadhaar },
        { label: 'No Aadhaar number held', value: this.state.noAadhaar ? 'Declared' : '' }
      ] },
      { letter: 'F', id: 'gender', heading: 'Gender', rows: [
        { label: 'Gender', value: genderLabels[v.gender] || '' }
      ] },
      { letter: 'G', id: 'dob', heading: 'Date of birth details', rows: [
        { label: 'Date of birth', value: v.dob },
        { label: 'Proof of date of birth', value: this.state.done.indexOf('dob') > -1 ? 'Attached' : '' }
      ] },
      { letter: 'H', id: 'address', heading: 'Details of present ordinary residence', rows: [
        { label: 'House or flat number', value: v.house },
        { label: 'Street or locality', value: v.street },
        { label: 'Town or village', value: v.town },
        { label: 'Post office', value: v.postOffice },
        { label: 'Pin code', value: v.pin },
        { label: 'District', value: v.addrDistrict },
        { label: 'Proof of present address', value: this.state.done.indexOf('address') > -1 ? 'Attached' : '' }
      ] },
      { letter: 'I', id: 'disability', heading: 'Disability details', rows: [
        { label: 'Disability', value: disList.join(', ') },
        { label: 'Disability certificate', value: '' }
      ] },
      { letter: 'J', id: 'family', heading: 'Details of a family member already in the roll', rows: [
        { label: 'Name', value: v.familyName },
        { label: 'Relationship to the applicant', value: cap(v.familyRelation) },
        { label: 'Voter ID number', value: v.familyEpic }
      ] },
      { letter: 'K', id: 'declaration', heading: 'Declaration', rows: [
        { label: 'Place', value: v.place },
        { label: 'Date', value: v.declDate },
        { label: 'Declaration confirmed', value: this.state.declared ? 'Yes' : '' }
      ] }
    ];
  }

  confirmLeave(href) {
    return (e) => {
      e.preventDefault();
      this.setState({ leaveOpen: true, leaveHref: href });
    };
  }

  setVal(k) {
    return (e) => {
      const values = Object.assign({}, this.state.values);
      values[k] = e.target.value;
      this.setState({ values: values });
    };
  }

  setValTo(k, val) {
    const values = Object.assign({}, this.state.values);
    values[k] = val;
    this.setState({ values: values });
  }

  // Dates are typed as DD/MM/YYYY, and the slashes are put in as the digits arrive.
  onDate(k) {
    return (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 8);
      let out = d.slice(0, 2);
      if (d.length > 2) out += '/' + d.slice(2, 4);
      if (d.length > 4) out += '/' + d.slice(4);
      this.setValTo(k, out);
    };
  }

  // ---- Combobox (ux4g-combobox, single select) -------------------------------------
  // The typed text, whether the list is open and which option is highlighted all live in
  // page state, so a re-render never overwrites what someone is part way through typing.

  comboDefs() {
    const v = this.state.values;
    return {
      state: { valueKey: 'state', options: this.states },
      district: { valueKey: 'district', options: this.districts[v.state] || [] },
      acName: { valueKey: 'acName', options: this.assemblyConstituencies[v.district] || [] },
      pcName: { valueKey: 'pcName', options: this.parliamentaryConstituencies },
      addrDistrict: { valueKey: 'addrDistrict', options: this.districts[v.state] || [] }
    };
  }

  comboFiltered(key) {
    const options = this.comboDefs()[key].options;
    const c = this.state.combo;
    if (!c || c.key !== key || !c.typed) return options;
    const q = c.query.trim().toLowerCase();
    return options.filter(o => o.toLowerCase().indexOf(q) > -1);
  }

  comboOpen(key) {
    const def = this.comboDefs()[key];
    const current = def.options.indexOf(this.state.values[def.valueKey]);
    this.setState({ combo: { key: key, typed: false, query: '', open: true, active: Math.max(0, current) } });
  }

  comboCommit(key, value) {
    const values = Object.assign({}, this.state.values);
    const valueKey = this.comboDefs()[key].valueKey;
    const changed = values[valueKey] !== value;
    values[valueKey] = value;
    // A new state or district makes the choices that depend on it stale.
    if (changed && key === 'state') Object.assign(values, { district: '', acName: '', acNumber: '', addrDistrict: '' });
    if (changed && key === 'district') Object.assign(values, { acName: '', acNumber: '' });
    if (changed && key === 'acName') values.acNumber = this.acNumbers[value] || '';
    this.setState({ values: values, combo: null });
  }

  // Leaving the box keeps an exact match, clears an emptied box, and otherwise puts back
  // the last choice, so half-typed text can never be saved as an answer.
  comboBlur(key) {
    const c = this.state.combo;
    if (!c || c.key !== key) return;
    if (!c.typed) { this.setState({ combo: null }); return; }
    const q = c.query.trim().toLowerCase();
    const match = this.comboDefs()[key].options.filter(o => o.toLowerCase() === q)[0];
    if (match) this.comboCommit(key, match);
    else if (!q) this.comboCommit(key, '');
    else this.setState({ combo: null });
  }

  comboKey(key, id, e) {
    const c = this.state.combo && this.state.combo.key === key ? this.state.combo : null;
    const list = this.comboFiltered(key);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!c || !c.open) { this.comboOpen(key); return; }
      const next = Math.max(0, Math.min(list.length - 1, c.active + (e.key === 'ArrowDown' ? 1 : -1)));
      this.setState({ combo: Object.assign({}, c, { active: next }) });
      setTimeout(() => {
        const opt = document.getElementById(id + '-opt-' + next);
        if (opt) opt.scrollIntoView({ block: 'nearest' });
      }, 0);
    } else if (e.key === 'Enter') {
      if (c && c.open && list[c.active] != null) { e.preventDefault(); this.comboCommit(key, list[c.active]); }
    } else if (e.key === 'Escape') {
      if (c) { e.preventDefault(); this.setState({ combo: null }); }
    }
  }

  comboVals(key, id, invalid) {
    const def = this.comboDefs()[key];
    const c = this.state.combo && this.state.combo.key === key ? this.state.combo : null;
    const open = !!(c && c.open);
    const list = this.comboFiltered(key);
    const committed = this.state.values[def.valueKey] || '';
    return {
      text: c && c.typed ? c.query : committed,
      cls: 'ux4g-combobox ux4g-combobox-lg' + (open ? ' is-open' : '') + (invalid ? ' ux4g-combobox-error' : ''),
      expanded: open,
      activeId: open && list.length ? id + '-opt-' + c.active : '',
      noOptions: list.length === 0,
      emptyText: def.options.length ? 'Nothing matches. Check the spelling, or clear the box to see the full list.' : 'Nothing to choose from yet. Check your answer above.',
      options: list.map((o, i) => ({
        id: id + '-opt-' + i,
        label: o,
        selected: o === committed,
        cls: 'ux4g-combobox-single-option' + (o === committed ? ' is-selected' : '') + (open && i === c.active ? ' is-active' : ''),
        pick: () => this.comboCommit(key, o)
      })),
      open: (e) => {
        const input = e.currentTarget.querySelector('input');
        if (input && document.activeElement !== input) input.focus();
        if (!open) this.comboOpen(key);
      },
      onInput: (e) => this.setState({ combo: { key: key, typed: true, query: e.target.value, open: true, active: 0 } }),
      onKeydown: (e) => this.comboKey(key, id, e),
      onBlur: () => this.comboBlur(key),
      // Clicking an option or the caret must not take focus out of the input first.
      keepFocus: (e) => e.preventDefault()
    };
  }

  // ---- Advisory document checks --------------------------------------------------------
  // After an upload, look for the things most likely to get a document sent back. The
  // result is advice only: it never blocks saving or submitting, and it stays silent when
  // nothing looks wrong.

  setDoc(key, doc) {
    const docs = Object.assign({}, this.state.docs);
    docs[key] = doc;
    this.setState({ docs: docs });
  }

  onFile(key) {
    return (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { this.setDoc(key, null); return; }
      const token = Date.now() + Math.random();
      this.setDoc(key, { token: token, status: 'scanning', name: file.name, warnings: [] });
      const started = Date.now();
      this.inspect(key, file).catch(() => []).then(codes => {
        // Hold the scanning state briefly, so it reads as a check rather than a flicker.
        setTimeout(() => {
          const now = this.state.docs[key];
          if (!now || now.token !== token) return;   // a newer file has replaced this one
          this.setDoc(key, { token: token, status: 'done', name: file.name, warnings: codes.map(c => this.warningText(c, key)) });
        }, Math.max(0, 1400 - (Date.now() - started)));
      });
    };
  }

  inspect(key, file) {
    // Demo hooks. Reading the text and comparing the address need text recognition, which
    // this prototype does not have, so a file name containing one of these words stands in
    // for that result. The other checks below are measured from the image itself.
    const hooks = ['unreadable', 'mismatch', 'cropped', 'dark', 'blurred', 'lowres']
      .filter(w => file.name.toLowerCase().indexOf(w) > -1)
      .filter(w => key === 'addr-proof' || w !== 'mismatch')
      .filter(w => key !== 'photo' || (w !== 'unreadable' && w !== 'cropped'));
    if (!/^image\//.test(file.type)) return Promise.resolve(hooks);
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
      img.src = url;
    }).then(img => {
      const measured = this.measure(img, key);
      return measured.concat(hooks.filter(h => measured.indexOf(h) < 0));
    });
  }

  // Rough image heuristics: overall brightness, sharpness (variance of the Laplacian), size,
  // and whether dark marks run into the edges as if the page had been cut off.
  measure(img, key) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const scale = Math.min(1, 640 / Math.max(w, h));
    const cw = Math.max(3, Math.round(w * scale)), ch = Math.max(3, Math.round(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cw, ch);
    const px = ctx.getImageData(0, 0, cw, ch).data;
    const gray = new Float32Array(cw * ch);
    let sum = 0;
    for (let i = 0; i < gray.length; i++) {
      gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
      sum += gray[i];
    }
    const mean = sum / gray.length;

    let lapSum = 0, lapSq = 0, n = 0;
    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const i = y * cw + x;
        const lap = gray[i - 1] + gray[i + 1] + gray[i - cw] + gray[i + cw] - 4 * gray[i];
        lapSum += lap; lapSq += lap * lap; n++;
      }
    }
    const lapVar = n ? lapSq / n - Math.pow(lapSum / n, 2) : 0;

    const out = [];
    if (Math.min(w, h) < (key === 'photo' ? 300 : 800)) out.push('lowres');
    if (mean < 70) out.push('dark');
    if (lapVar < 40) out.push('blurred');

    if (key !== 'photo') {
      const band = Math.max(2, Math.round(Math.min(cw, ch) * 0.015));
      const ink = Math.min(110, mean * 0.55);
      const strip = (x0, y0, x1, y1) => {
        let dark = 0, total = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { total++; if (gray[y * cw + x] < ink) dark++; }
        return total ? dark / total : 0;
      };
      // Text crossing an edge leaves a mix of dark and light there; a plain dark table
      // behind the page is almost all dark, and is not a sign of cropping.
      const edges = [strip(0, 0, cw, band), strip(0, ch - band, cw, ch), strip(0, 0, band, ch), strip(cw - band, 0, cw, ch)];
      if (edges.some(f => f > 0.1 && f < 0.6)) out.push('cropped');
    }
    return out;
  }

  // Phrased as what might happen, not as a verdict or a measurement.
  warningText(code, key) {
    const photo = key === 'photo';
    return {
      dark: photo ? 'This photo looks quite dark, so the officer may not be able to recognise your face.' : 'This looks quite dark, so the officer may not be able to read it.',
      blurred: photo ? 'This photo looks blurred, so the officer may not be able to recognise your face.' : 'This looks blurred, so the officer may not be able to read the details.',
      lowres: photo ? 'This photo is quite small, so it may print unclearly on your voter ID.' : 'This image is quite small, so the details may be too unclear for the officer to read.',
      cropped: 'The edges look cut off. If part of the document is missing, the officer may not accept it.',
      unreadable: 'Some of the text may be hard to make out, so the officer may not be able to check it.',
      mismatch: 'The address on this document may not match the address you entered above. If they differ, the officer may not accept it as proof.'
    }[code];
  }

  docVals(key) {
    const d = this.state.docs[key];
    return {
      scanning: !!(d && d.status === 'scanning'),
      name: d ? d.name : '',
      hasWarnings: !!(d && d.status === 'done' && d.warnings.length),
      warnings: d && d.status === 'done' ? d.warnings.map(t => ({ text: t })) : []
    };
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
    const done = this.state.done;
    const total = this.sectionList.length;
    const filled = done.length;
    const exact = (filled / total) * 100;
    let rounded = Math.round(exact / 10) * 10;
    if (filled === 0) rounded = 0;
    else if (rounded === 0) rounded = 10;
    if (rounded >= 100 && filled < total) rounded = 90;
    if (filled === total) rounded = 100;

    const rowBase = 'display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 36px; padding: 7px 12px 7px 13px; border-top: 1px solid #EDEDED; text-decoration: none; background: #FFFFFF;';
    const sections = this.sectionList.map(s => {
      const active = this.state.active === s.id;
      return {
        label: s.label,
        href: '#' + s.id,
        active: active,
        inactive: !active,
        done: done.indexOf(s.id) > -1,
        onClick: this.jump(s.id),
        rowStyle: active
          ? 'display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 36px; padding: 7px 12px 7px 10px; border-top: 1px solid #EDEDED; border-left: 3px solid #4A2BC2; text-decoration: none; background: #F3F0FF;'
          : rowBase,
        labelStyle: active
          ? 'font-size: 14px; line-height: 20px; font-weight: 600; color: #4A2BC2; text-wrap: pretty;'
          : 'font-size: 14px; line-height: 20px; color: #404040; text-wrap: pretty;'
      };
    });

    const heads = {};
    this.sectionList.forEach((s, i) => {
      const open = this.state.open === s.id;
      const isDone = done.indexOf(s.id) > -1;
      const prev = this.sectionList[i - 1];
      const summary = this.state.summaries[s.id] || [];
      heads[s.key] = {
        label: s.label,
        open: open,
        done: isDone,
        onClick: () => this.openSection(open ? null : s.id),
        onSave: (() => {
          const last = i === this.sectionList.length - 1;
          const proceed = last ? () => this.goToPreview() : () => this.saveSection(s.id);
          return () => this.saveOrShowErrors(s.id, proceed);
        })(),
        // One missing answer is clear enough from its own inline message; the summary is
        // for when several are missing and some may be scrolled out of view.
        hasErrors: summary.length > 1,
        errorTitle: 'Check ' + summary.length + ' answers before continuing',
        errorItems: summary.map(it => ({
          label: it.label,
          href: '#' + it.key,
          go: (e) => {
            e.preventDefault();
            const el = document.getElementById(it.key) || document.querySelector('[name="' + it.key + '"]');
            if (el) el.focus();
          }
        })),
        onPrevious: () => this.openSection(prev ? prev.id : s.id),
        cardStyle: 'background: #FFFFFF; border: 1px solid ' + (open ? '#DDD5F7' : '#E5E5E5') + '; border-radius: 12px; overflow: hidden;',
        rowStyle: 'display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box; min-height: 56px; padding: 14px 24px; border: none; border-bottom: 1px solid ' + (open ? '#DDD5F7' : 'transparent') + '; background: ' + (open ? '#F3F0FF' : '#FFFFFF') + '; font-family: inherit; text-align: left; cursor: pointer;',
        titleStyle: 'flex: 1 1 auto; min-width: 0; font-size: ' + (open ? '17px' : '16px') + '; line-height: 24px; font-weight: 600; color: ' + (open || isDone ? '#171717' : '#525252') + '; text-wrap: pretty;',
        chevStyle: 'flex: 0 0 auto; transition: transform 160ms ease; transform: rotate(' + (open ? '180deg' : '0deg') + ');'
      };
    });

    const v = this.state.values;
    const tip = this.state.tip;
    const dis = this.state.disabilities;
    const toggleDis = (k) => () => {
      const next = Object.assign({}, dis);
      next[k] = !next[k];
      this.setState({ disabilities: next });
    };

    const errState = this.state.errors;
    const errs = {};
    ['state', 'district', 'constituency-type', 'ac-name', 'ac-number', 'pc-name', 'pc-number', 'first-name', 'surname', 'name-regional', 'photo', 'rel-name', 'rel-type', 'mobile', 'email', 'aadhaar-number', 'dob-date', 'dob-proof', 'house', 'street', 'town', 'post-office', 'pin', 'addr-district', 'addr-proof', 'disability-cert', 'family-name', 'family-relation', 'family-epic', 'decl-place', 'decl-date', 'gender', 'declaration-confirm'].forEach(k => {
      const camel = k.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      errs[camel] = { show: !!errState[k], msg: errState[k] || '' };
    });

    return {
      ...this.headerVals({ loggedIn: true, homeHref: 'index.html?loggedIn=1' }),
      errs: errs,
      sections,
      heads,
      v: v,
      pctExact: Math.round(exact),
      barWidth: exact.toFixed(1) + '%',
      pctLabel: rounded + '%',

      isAssembly: this.state.type === 'assembly',
      isParliamentary: this.state.type === 'parliamentary',
      chooseAssembly: () => this.setState({ type: 'assembly' }),
      chooseParliamentary: () => this.setState({ type: 'parliamentary' }),

      combo: {
        state: this.comboVals('state', 'state', errs.state.show),
        district: this.comboVals('district', 'district', errs.district.show),
        acName: this.comboVals('acName', 'ac-name', errs.acName.show),
        pcName: this.comboVals('pcName', 'pc-name', errs.pcName.show),
        addrDistrict: this.comboVals('addrDistrict', 'addr-district', errs.addrDistrict.show)
      },

      // The name label follows the relationship chosen above it.
      relNameLabel: { father: 'Father’s name', mother: 'Mother’s name', husband: 'Husband’s name', wife: 'Wife’s name', guardian: 'Legal guardian’s name' }[v.relativeRelation] || 'Name of parent or spouse',

      docs: { photo: this.docVals('photo'), dobProof: this.docVals('dob-proof'), addrProof: this.docVals('addr-proof') },
      onFile: { photo: this.onFile('photo'), dobProof: this.onFile('dob-proof'), addrProof: this.onFile('addr-proof') },

      savedNote: this.state.savedNote,
      savedNoteStyle: 'position: fixed; left: 24px; bottom: 24px; z-index: 30; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: #262626; color: #FAFAFA; font-size: 13px; line-height: 18px; box-shadow: 0 4px 12px rgba(23,23,23,0.2); pointer-events: none; transition: opacity 300ms ease; opacity: ' + (this.state.savedNote ? '1' : '0') + ';',

      tips: { ac: tip === 'ac', first: tip === 'first', name: tip === 'name', epic: tip === 'epic', type: tip === 'type' },
      tipType: () => this.setState({ tip: 'type' }),
      tipAc: () => this.setState({ tip: 'ac' }),
      tipFirst: () => this.setState({ tip: 'first' }),
      tipName: () => this.setState({ tip: 'name' }),
      tipEpic: () => this.setState({ tip: 'epic' }),
      hideTip: () => this.setState({ tip: null }),

      on: {
        acNumber: this.setVal('acNumber'),
        firstName: this.setVal('firstName'),
        surname: this.setVal('surname'),
        nameRegional: this.setVal('nameRegional'),
        relativeName: this.setVal('relativeName'),
        relativeRelation: this.setVal('relativeRelation'),
        mobile: this.setVal('mobile'),
        email: this.setVal('email'),
        dob: this.onDate('dob'),
        pcNumber: this.setVal('pcNumber'),
        house: this.setVal('house'),
        street: this.setVal('street'),
        town: this.setVal('town'),
        postOffice: this.setVal('postOffice'),
        familyName: this.setVal('familyName'),
        familyRelation: this.setVal('familyRelation'),
        familyEpic: this.setVal('familyEpic'),
        place: this.setVal('place'),
        declDate: this.onDate('declDate'),
        genderMale: () => this.setValTo('gender', 'male'),
        genderFemale: () => this.setValTo('gender', 'female'),
        genderThird: () => this.setValTo('gender', 'third'),
        dVisual: toggleDis('visual'),
        dHearing: toggleDis('hearing'),
        dLocomotor: toggleDis('locomotor'),
        dOther: toggleDis('other')
      },

      onAadhaar: (e) => {
        const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
        const groups = [];
        for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
        this.setValTo('aadhaar', groups.join(' '));
      },
      onPin: (e) => this.setValTo('pin', e.target.value.replace(/[^0-9]/g, '').slice(0, 6)),

      hasAadhaar: !this.state.noAadhaar,
      noAadhaar: this.state.noAadhaar,
      toggleNoAadhaar: () => this.setState({ noAadhaar: !this.state.noAadhaar }),

      g: { male: v.gender === 'male', female: v.gender === 'female', third: v.gender === 'third' },
      d: dis,

      declared: this.state.declared,
      toggleDeclared: () => this.setState({ declared: !this.state.declared }),

      leaveOpen: this.state.leaveOpen,
      leaveHref: this.state.leaveHref,
      openLeave: () => this.setState({ leaveOpen: true, leaveHref: 'index.html?loggedIn=1' }),
      closeLeave: () => this.setState({ leaveOpen: false }),
      leaveTo: {
        home: this.confirmLeave('index.html?loggedIn=1'),
        register: this.confirmLeave('index.html?loggedIn=1'),
        prep: this.confirmLeave('form6-prep.html')
      },

      screenTrack: this.state.screen === 'track',
      goToTrack: (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.setState({ screen: 'track' });
        setTimeout(() => { const se = document.scrollingElement || document.documentElement; if (se) se.scrollTop = 0; }, 0);
      },
      screenForm: this.state.screen === 'form',
      screenPreview: this.state.screen === 'preview',
      screenDone: this.state.screen === 'done',
      eroLine: (this.state.type === 'assembly' && v.acName ? v.acName + ' assembly constituency, ' : '') +
        (this.state.type === 'parliamentary' && v.pcName ? v.pcName + ' parliamentary constituency, ' : '') +
        (v.district || '') + (v.state ? ', ' + v.state : ''),
      previewSections: this.previewRows().map(sec => ({
        title: sec.letter + '. ' + sec.heading,
        onEdit: this.editSection(sec.id),
        rows: sec.rows.map(r => ({
          label: r.label,
          value: r.value || '',
          valueStyle: (r.value || '') === ''
            ? 'margin: 0; font-size: 14px; line-height: 20px; min-height: 20px; border-bottom: 1px dashed #D4D4D4;'
            : 'margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; color: #171717; text-wrap: pretty;'
        }))
      })),
      backToForm: (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.setState({ screen: 'form', open: 'declaration', active: 'declaration' });
        this.scrollTo('declaration');
      },
      needsDeclaration: !this.state.declared,
      submitting: this.state.submitting,
      submitLabel: this.state.submitting ? 'Submitting' : 'Submit application',
      // Disabled while submitting, so the application cannot be sent twice.
      submitDisabled: !this.state.declared || this.state.submitting,
      submitApplication: () => {
        if (this.state.submitting) return;
        this.setState({ submitting: true });
        setTimeout(() => {
          let digits = '';
          for (let i = 0; i < 6; i++) digits += Math.floor(Math.random() * 10);
          this.setState({ screen: 'done', submitting: false, refNumber: 'MP/BHO/2026/' + digits, copied: false });
          const se = document.scrollingElement || document.documentElement;
          if (se) se.scrollTop = 0;
        }, 1500);
      },
      refNumber: this.state.refNumber,
      trackHref: 'index.html?ref=' + encodeURIComponent(this.state.refNumber),
      copyLabel: this.state.copied ? 'Copied' : 'Copy code',
      copyRef: () => {
        if (navigator.clipboard) navigator.clipboard.writeText(this.state.refNumber);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      }
    };
  }
}

DC.mount(Page, document.getElementById('app'), {"userName": "Ananya Rao"});
