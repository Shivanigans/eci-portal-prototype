// ============================================================================================
// PROTOTYPE SCAFFOLDING: SCRIPTED DOCUMENT CHECK
// Outcomes below are HARD-CODED FOR DEMONSTRATION. NO FILE ANALYSIS TAKES PLACE: whatever file
// is chosen, the field shows "Verifying document." for SCAN_SECONDS and then the outcome set
// here, every time, including on re-upload. Remove this block when a real check exists.
//
// Each value is either 'clean' (shows "Document verified.") or one warning line. An upload not
// listed here (the disability certificate) is held without any check. A field shows
// one warning only, with one action beside it: "Re-upload", or "Upload a clearer copy" for
// the warnings listed in LEGIBILITY_WARNINGS. Warnings are advisory and never block the form.
//
// Warning lines, copy any in as a field's value:
//   'Address does not match the address you entered'
//   'Date of birth does not match the date you entered'
//   'Photograph does not meet the size and background requirements'
//   'Document is not clear enough to read'                          (legibility)
//   'Part of the document is missing'
//   'Image quality is too low to read'                              (legibility)
//   'Date of birth is not visible on this document'
//   'Document is not self-attested'
//   'Photograph background is not plain white'
//   'Photograph must not be signed or marked'
// ============================================================================================
const SCRIPTED_DOC_CHECK = {
  SCAN_SECONDS: 2.5,
  // true: files over 2 MB, or not of the type the field's hint names, are refused before the
  // check runs (a real portal rule, not analysis). false: every file goes through to the script.
  ENFORCE_SIZE_AND_TYPE: true,
  // Warnings about legibility rather than a mismatch; their action reads "Upload a clearer copy".
  LEGIBILITY_WARNINGS: ['Document is not clear enough to read', 'Image quality is too low to read'],
  outcomes: {
    'photo': 'Photograph does not meet the size and background requirements',
    'dob-proof': 'Date of birth does not match the date you entered',
    'addr-proof': 'Address does not match the address you entered'
  }
};

// ============================================================================================
// PROTOTYPE SCAFFOLDING: SAMPLE FILES
// Upload and Re-upload attach the sample file named here straight away, with no file picker,
// so the form can be walked through without real documents. The scripted check above still
// runs on it. Dragging a real file onto the panel still works. Set ON to false to open the
// file picker again.
// ============================================================================================
const SAMPLE_FILES = {
  ON: true,
  size: 412 * 1024,
  names: {
    photo: 'passport-photo.jpg',
    'dob-proof': 'birth-certificate.pdf',
    'addr-proof': 'electricity-bill.pdf',
    'disability-cert': 'disability-certificate.pdf'
  }
};

class Page extends DCLogic {
  // Lettered and worded as on the online Form 6 (ECINET), so this prototype lines up with the
  // live form. `heading` is used where the section heading is longer than its rail label.
  sectionList = [
    { key: 'constituency', id: 'constituency', letter: 'A', label: 'Select state, district and AC', heading: 'Select state, district and assembly/parliamentary constituency' },
    { key: 'personal', id: 'your-details', letter: 'B', label: 'Personal details' },
    { key: 'relative', id: 'relative', letter: 'C', label: 'Relatives details' },
    { key: 'contact', id: 'contact', letter: 'D', label: 'Contact details' },
    { key: 'aadhaar', id: 'aadhaar', letter: 'E', label: 'Aadhaar details' },
    { key: 'gender', id: 'gender', letter: 'F', label: 'Gender' },
    { key: 'dob', id: 'dob', letter: 'G', label: 'Date of birth details' },
    { key: 'address', id: 'address', letter: 'H', label: 'Present address details' },
    { key: 'disability', id: 'disability', letter: 'I', label: 'Disability details' },
    { key: 'family', id: 'family', letter: 'J', label: 'Family member details' },
    { key: 'declaration', id: 'declaration', letter: 'K', label: 'Declaration' }
  ].map(s => Object.assign(s, { title: s.letter + '. ' + s.label, headingTitle: s.letter + '. ' + (s.heading || s.label) }));

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

  // The time in the auto-save bar above the sections. It moves on at most once every
  // 30 seconds while someone is filling in the form, and at once when a section is saved.
  showSaved(force) {
    const now = Date.now();
    if (!force && now - (this.lastSavedNote || 0) < 30000) return;
    this.lastSavedNote = now;
    const time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    this.setState({ savedNote: 'Saved ' + time });
  }

  // Errors are only ever added by Save and continue, but one that has been put right goes
  // away as soon as it is: the field's message, its red state and its line in the summary.
  clearFixedErrors() {
    const errors = Object.assign({}, this.state.errors);
    let changed = false;
    Object.keys(errors).forEach(key => {
      const el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
      if (!el || !el.checkValidity()) return;
      if (el.type === 'file') return;   // cleared only when an acceptable file is chosen (onFile)
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
      { id: 'constituency', rows: [
        { label: 'State or union territory', value: v.state },
        { label: 'District', value: v.district },
        { label: assembly ? 'Assembly constituency name' : parliamentary ? 'Parliamentary constituency name' : 'Constituency name', value: assembly ? v.acName : parliamentary ? v.pcName : '' },
        { label: assembly ? 'Assembly constituency number' : parliamentary ? 'Parliamentary constituency number' : 'Constituency number', value: assembly ? v.acNumber : parliamentary ? v.pcNumber : '' }
      ] },
      { id: 'your-details', rows: [
        { label: 'First name and middle name', value: v.firstName },
        { label: 'Surname', value: v.surname },
        { label: 'Name in regional language', value: v.nameRegional },
        { label: 'Passport size photograph', value: this.state.done.indexOf('your-details') > -1 ? 'Attached' : '' }
      ] },
      { id: 'relative', rows: [
        { label: 'Name', value: v.relativeName },
        { label: 'Relationship to the applicant', value: cap(v.relativeRelation) }
      ] },
      { id: 'contact', rows: [
        { label: 'Mobile number', value: v.mobile },
        { label: 'Email address', value: v.email }
      ] },
      { id: 'aadhaar', rows: [
        { label: 'Aadhaar number', value: this.state.noAadhaar ? '' : v.aadhaar },
        { label: 'No Aadhaar number held', value: this.state.noAadhaar ? 'Declared' : '' }
      ] },
      { id: 'gender', rows: [
        { label: 'Gender', value: genderLabels[v.gender] || '' }
      ] },
      { id: 'dob', rows: [
        { label: 'Date of birth', value: v.dob },
        { label: 'Proof of date of birth', value: this.state.done.indexOf('dob') > -1 ? 'Attached' : '' }
      ] },
      { id: 'address', rows: [
        { label: 'House or flat number', value: v.house },
        { label: 'Street or locality', value: v.street },
        { label: 'Town or village', value: v.town },
        { label: 'Post office', value: v.postOffice },
        { label: 'Pin code', value: v.pin },
        { label: 'District', value: v.addrDistrict },
        { label: 'Proof of present address', value: this.state.done.indexOf('address') > -1 ? 'Attached' : '' }
      ] },
      { id: 'disability', rows: [
        { label: 'Disability', value: disList.join(', ') },
        { label: 'Disability certificate', value: '' }
      ] },
      { id: 'family', rows: [
        { label: 'Name', value: v.familyName },
        { label: 'Relationship to the applicant', value: cap(v.familyRelation) },
        { label: 'Voter ID number', value: v.familyEpic }
      ] },
      { id: 'declaration', rows: [
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

  // What each upload's hint promises: a file outside it is refused straight away with the
  // reason against the field. Can be switched off in SCRIPTED_DOC_CHECK at the top.
  fileRules = {
    photo: { pattern: /\.jpe?g$/i, types: 'a JPG or JPEG', list: 'JPG, JPEG' },
    'dob-proof': { pattern: /\.(jpe?g|pdf)$/i, types: 'a JPG, JPEG or PDF', list: 'JPG, JPEG, PDF' },
    'addr-proof': { pattern: /\.(jpe?g|pdf)$/i, types: 'a JPG, JPEG or PDF', list: 'JPG, JPEG, PDF' },
    'disability-cert': { pattern: /\.(jpe?g|pdf)$/i, types: 'a JPG, JPEG or PDF', list: 'JPG, JPEG, PDF' }
  };
  maxFileBytes = 2 * 1048576;

  fileProblem(key, file) {
    if (!SCRIPTED_DOC_CHECK.ENFORCE_SIZE_AND_TYPE) return '';
    const rule = this.fileRules[key];
    if (!rule.pattern.test(file.name)) return file.name + ' is not ' + rule.types + ' file. Choose ' + rule.types + ' file.';
    if (file.size > this.maxFileBytes) return file.name + ' is ' + (file.size / 1048576).toFixed(1) + ' MB. Choose a file under 2 MB.';
    return '';
  }

  setFileError(key, msg) {
    const errors = Object.assign({}, this.state.errors);
    if (msg) errors[key] = msg; else delete errors[key];
    this.setState({ errors: errors });
  }

  // Only fields listed in SCRIPTED_DOC_CHECK.outcomes go through the check; any other upload
  // (the disability certificate) is simply held, with no verifying step and no verdict.
  isChecked(key) {
    return Object.prototype.hasOwnProperty.call(SCRIPTED_DOC_CHECK.outcomes, key);
  }

  // The scripted outcome for a field: one warning line, or empty when it is set to clean.
  // Nothing about the file is read: see SCRIPTED_DOC_CHECK at the top of this script.
  scriptedWarning(key) {
    const outcome = SCRIPTED_DOC_CHECK.outcomes[key];
    return !outcome || outcome === 'clean' ? '' : String(outcome);
  }

  // One way in for a file, whether it was chosen with Upload or dropped on the panel.
  takeSampleFile(key) {
    this.takeFile(key, { name: SAMPLE_FILES.names[key] || key + '.pdf', size: SAMPLE_FILES.size });
  }

  takeFile(key, file) {
    const input = document.getElementById(key);
    if (!file) { this.setDoc(key, null); return; }
    const problem = this.fileProblem(key, file);
    this.setFileError(key, problem);
    if (problem) { if (input) input.value = ''; this.setDoc(key, null); return; }
    const token = Date.now() + Math.random();
    if (!this.isChecked(key)) {
      this.setDoc(key, { token: token, status: 'done', checked: false, name: file.name, size: file.size, warning: '' });
      return;
    }
    this.setDoc(key, { token: token, status: 'scanning', checked: true, name: file.name, size: file.size, warning: '' });
    setTimeout(() => {
      const now = this.state.docs[key];
      if (!now || now.token !== token) return;   // removed, or replaced by a newer file
      this.setDoc(key, { token: token, status: 'done', checked: true, name: file.name, size: file.size, warning: this.scriptedWarning(key) });
    }, SCRIPTED_DOC_CHECK.SCAN_SECONDS * 1000);
  }

  onFile(key) {
    return (e) => this.takeFile(key, e.target.files && e.target.files[0]);
  }

  setDragging(key, on) {
    if (!!(this.state.dragging || {})[key] === on) return;
    this.setState(st => ({ dragging: Object.assign({}, st.dragging, { [key]: on }) }));
  }

  // Everything one upload field binds to. The UX4G state class is chosen here: selecting while
  // a file is dragged over, scanning during the check, error while a refused file's message
  // shows, default otherwise. Once a file is held the panel gives way to the file list.
  docVals(key) {
    const d = this.state.docs[key];
    const scanning = !!(d && d.status === 'scanning');
    const done = !!(d && d.status === 'done');
    const warned = done && !!d.warning;
    const dragging = !d && !!(this.state.dragging || {})[key];
    const refused = !d && !!this.state.errors[key];
    const state = scanning ? 'scanning' : dragging ? 'selecting' : refused ? 'error' : done ? 'uploaded' : 'default';
    const size = !d ? '' : d.size >= 1048576 ? (d.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(d.size / 1024)) + ' KB';
    const focusUpload = () => setTimeout(() => { const el = document.getElementById(key + '-btn'); if (el) el.focus(); }, 0);
    return {
      uploadClass: 'ux4g-upload ux4g-upload-state-' + state,
      showPanel: !done,
      idle: !d && !dragging,
      scanning: scanning,
      notScanning: !scanning,
      panelHeading: scanning ? 'Verifying document.' : 'Drop file here',
      panelHint: scanning ? d.name : 'File type: ' + this.fileRules[key].list + '. Max size: 2 MB',
      done: done,
      // UX4G colours a held file's name green; a flagged file keeps it neutral.
      itemClass: 'ux4g-upload-file-item' + (warned ? ' is-flagged' : ''),
      clean: done && d.checked && !warned,
      name: d ? d.name : '',
      size: size,
      // Read out by the hidden status line, since the panel changes state without moving focus.
      announce: scanning ? 'Verifying document.' : !done ? '' : warned ? d.warning : d.checked ? 'Document verified.' : d.name + ' added.',
      pick: () => { if (SAMPLE_FILES.ON) { this.takeSampleFile(key); return; } const input = document.getElementById(key); if (input) input.click(); },
      dragOver: (e) => { e.preventDefault(); if (!d) this.setDragging(key, true); },
      dragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) this.setDragging(key, false); },
      drop: (e) => {
        e.preventDefault();
        this.setDragging(key, false);
        if (d) return;   // a file is already being checked
        this.takeFile(key, e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      },
      remove: () => {
        const input = document.getElementById(key);
        if (input) input.value = '';
        this.setDoc(key, null);
        focusUpload();
      },
      // Drops the flagged file and opens the file picker straight away.
      reupload: () => {
        const input = document.getElementById(key);
        if (input) input.value = '';
        this.setDoc(key, null);
        if (SAMPLE_FILES.ON) this.takeSampleFile(key);
        else if (input) input.click();
        focusUpload();
      },
      hasWarnings: warned,
      warning: warned ? d.warning : '',
      actionLabel: warned && SCRIPTED_DOC_CHECK.LEGIBILITY_WARNINGS.indexOf(d.warning) > -1 ? 'Upload a clearer copy' : 'Re-upload'
    };
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
    const done = this.state.done;
    const total = this.sectionList.length;
    const filled = done.length;
    const exact = (filled / total) * 100;
    let rounded = Math.round(exact / 10) * 10;
    if (filled === 0) rounded = 0;
    else if (rounded === 0) rounded = 10;
    if (rounded >= 100 && filled < total) rounded = 90;
    if (filled === total) rounded = 100;

    const sections = this.sectionList.map(s => {
      const active = this.state.active === s.id;
      const isDone = done.indexOf(s.id) > -1;
      return {
        label: s.label,
        prefix: s.letter + '. ',
        mark: s.letter,
        href: '#' + s.id,
        current: active ? 'step' : 'false',
        done: isDone,
        onClick: this.jump(s.id),
        // UX4G's 'completed' is its base step class; 'done' is a finished step, shown green with a
        // tick. The current step gets the purple ring, and later steps stay grey.
        stepClass: 'ux4g-status-pipeline-step ux4g-status-pipeline-completed' + (isDone && !active ? ' ux4g-status-pipeline-done' : '') + (!isDone && !active ? ' ux4g-status-pipeline-step-pending' : ''),
        iconClass: 'ux4g-status-pipeline-head-icon' + (active ? ' ux4g-status-pipeline-head-icon-active' : ''),
        checkClass: 'ux4g-status-pipeline-head-check' + (active ? ' ux4g-status-pipeline-head-check-active' : ''),
        linkClass: 'section-rail-link ux4g-status-pipeline-label ' + (active ? 'ux4g-label-m-strong ux4g-text-primary' : 'ux4g-label-m-default ux4g-text-neutral-primary')
      };
    });

    const heads = {};
    this.sectionList.forEach((s, i) => {
      const open = this.state.open === s.id;
      const isDone = done.indexOf(s.id) > -1;
      const prev = this.sectionList[i - 1];
      const summary = this.state.summaries[s.id] || [];
      heads[s.key] = {
        label: s.headingTitle,
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
        buttonClass: 'ux4g-accordion__button' + (open ? '' : ' collapsed')
      };
    });

    const v = this.state.values;
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
      const show = !!errState[k];
      // UX4G Input has one helper line: the field's hint (while `ok`), replaced by the error.
      errs[camel] = { show: show, ok: !show, msg: errState[k] || '', inputClass: 'ux4g-input-container ux4g-input-md ' + (show ? 'ux4g-input-error' : 'ux4g-input-default') };
    });
    // UX4G Radio: the error variant goes on every option in a group while its error shows.
    const radioClass = (show) => 'ux4g-radio ux4g-radio-md' + (show ? ' ux4g-radio-error' : '');
    errs.constituencyType.radioClass = radioClass(errs.constituencyType.show);
    errs.gender.radioClass = radioClass(errs.gender.show);

    return {
      // Logging out mid-application loses the place, so it goes through the same "Leave this
      // application?" dialogue as any other exit. Once submitted there is nothing to lose.
      ...this.headerVals({
        loggedIn: true,
        homeHref: 'index.html?loggedIn=1',
        onLogOut: this.state.screen === 'done' ? null : () => this.setState({ leaveOpen: true, leaveHref: 'index.html' })
      }),
      errs: errs,
      sections,
      heads,
      v: v,
      pctExact: Math.round(exact),
      barValue: exact.toFixed(1),
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

      docs: { photo: this.docVals('photo'), dobProof: this.docVals('dob-proof'), addrProof: this.docVals('addr-proof'), disabilityCert: this.docVals('disability-cert') },
      onFile: { photo: this.onFile('photo'), dobProof: this.onFile('dob-proof'), addrProof: this.onFile('addr-proof'), disabilityCert: this.onFile('disability-cert') },

      savedNote: this.state.savedNote || 'Answers are saved automatically',

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
        blo: this.confirmLeave('service.html?s=book-blo&loggedIn=1'),
        register: this.confirmLeave('index.html?loggedIn=1'),
        prep: this.confirmLeave('form6-prep.html')
      },

      screenForm: this.state.screen === 'form',
      screenPreview: this.state.screen === 'preview',
      screenDone: this.state.screen === 'done',
      eroLine: (this.state.type === 'assembly' && v.acName ? v.acName + ' assembly constituency, ' : '') +
        (this.state.type === 'parliamentary' && v.pcName ? v.pcName + ' parliamentary constituency, ' : '') +
        (v.district || '') + (v.state ? ', ' + v.state : ''),
      previewSections: this.previewRows().map(sec => ({
        title: this.sectionList.filter(x => x.id === sec.id)[0].headingTitle,
        onEdit: this.editSection(sec.id),
        rows: sec.rows.map(r => ({
          label: r.label,
          value: r.value || '',
          valueClass: 'ux4g-text-neutral-secondary ux4g-body-s-default' + ((r.value || '') === '' ? ' preview-empty' : '')
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
      // The confirmation hands over to the track page, with the reference just issued.
      trackHref: 'track.html?loggedIn=1&status=submitted&ref=' + encodeURIComponent(this.state.refNumber),
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

// Escape hides the tooltip under the pointer or focus; it returns once the pointer or focus leaves.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.ux4g-tooltip-wrapper:hover, .ux4g-tooltip-wrapper:focus-within').forEach((w) => w.classList.add('tip-dismissed'));
});
['mouseout', 'focusout'].forEach((type) => document.addEventListener(type, (e) => {
  const w = e.target.closest && e.target.closest('.tip-dismissed');
  if (w && !w.contains(e.relatedTarget)) w.classList.remove('tip-dismissed');
}));

