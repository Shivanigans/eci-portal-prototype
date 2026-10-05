// ============================================================================================
// PROTOTYPE SCAFFOLDING: SAMPLE VOTER RECORD
// Stands in for the signed-in voter's entry on the electoral roll. Everything the form shows
// as "Currently recorded", every read-only detail and every prefilled answer comes from here.
// Remove this block when the form reads a real record.
// ============================================================================================
const SAMPLE_RECORD = {
  name: { first: 'Ananya Devi', surname: 'Rao', firstHi: 'अनन्या देवी', surnameHi: 'राव' },
  relative: { first: 'Suresh', surname: 'Rao', firstHi: 'सुरेश', surnameHi: 'राव' },
  relationType: 'father',
  epic: 'MPZ4829103',
  gender: 'female',
  dob: '17/04/2004',
  address: {
    house: '14-B, Ashoka Apartments', houseHi: '14-बी, अशोका अपार्टमेंट्स',
    street: 'Shivaji Nagar', streetHi: 'शिवाजी नगर',
    town: 'Bhopal', townHi: 'भोपाल',
    postOffice: 'Shivaji Nagar', postOfficeHi: 'शिवाजी नगर',
    pin: '462016',
    tehsil: 'Huzur', tehsilHi: 'हुज़ूर',
    district: 'Bhopal', state: 'Madhya Pradesh'
  },
  mobile: '98765 43210',
  email: 'ananya.rao@example.com',
  state: 'Madhya Pradesh',
  district: 'Bhopal',
  constituency: { number: '155', name: 'Huzur' },
  // PIN autofill: typing this PIN code in either address fills in the post office, district
  // and state. In the new address it also suggests the constituency (its number below).
  samplePin: { pin: '462003', postOffice: 'T T Nagar', postOfficeHi: 'टी टी नगर', district: 'Bhopal', state: 'Madhya Pradesh', constituency: '152' }
};

// ============================================================================================
// PROTOTYPE SCAFFOLDING: SCRIPTED DOCUMENT CHECK
// The same scripted check as the Form 6 application. Outcomes below are HARD-CODED FOR
// DEMONSTRATION. NO FILE ANALYSIS TAKES PLACE: whatever file is chosen, the field shows
// "Verifying document." for SCAN_SECONDS and then the outcome set here, every time. An upload
// not listed (the disability certificate) is held without any check. Warnings are advisory
// and never block the form. See form6-application.js for the full list of warning lines.
// ============================================================================================
const SCRIPTED_DOC_CHECK = {
  SCAN_SECONDS: 2.5,
  // true: files over 2 MB, or not JPG, JPEG, PNG or PDF, are refused before the check runs.
  ENFORCE_SIZE_AND_TYPE: true,
  LEGIBILITY_WARNINGS: ['Document is not clear enough to read', 'Image quality is too low to read'],
  outcomes: {
    'fix-name-file': 'clean',
    'fix-gender-file': 'clean',
    'fix-dob-file': 'Date of birth does not match the date you entered',
    'fix-relation-type-file': 'clean',
    'fix-relative-file': 'clean',
    'fa-file': 'Address does not match the address you entered',
    'fix-photo-file': 'Photograph background is not plain white',
    'mv-file': 'Address does not match the address you entered',
    'fir-file': 'clean'
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
    'fix-name-file': 'aadhaar-card.pdf',
    'fix-gender-file': 'aadhaar-card.pdf',
    'fix-dob-file': 'birth-certificate.pdf',
    'fix-relation-type-file': 'ration-card.pdf',
    'fix-relative-file': 'ration-card.pdf',
    'fa-file': 'electricity-bill.pdf',
    'fix-photo-file': 'passport-photo.jpg',
    'mv-file': 'rent-agreement.pdf',
    'fir-file': 'police-report.pdf',
    'dis-file': 'disability-certificate.pdf'
  }
};

// ============================================================================================
// PROTOTYPE SCAFFOLDING: AADHAAR e-SIGN
// No one-time password is sent and nothing is signed. Any six digits are accepted.
// ============================================================================================
const ESIGN_ACCEPTS_ANY_SIX_DIGITS = true;

// The four purposes, in the order the first question lists them.
const PURPOSES = {
  correct: { label: 'Correct wrong details', request: 'I request correction of the details above in my entry.' },
  move: { label: 'Move to a new address', request: 'I request that my entry be moved to the address above.' },
  replace: { label: 'Replace your voter ID card', request: 'I request a replacement voter ID card.' },
  disability: { label: 'Mark as a person with disability', request: 'I request that my entry be marked as a person with disability.' }
};

// The purpose is the form's first question. A link can preselect it with ?purpose=; the prep
// page does not, as nothing is chosen there.
const URL_PURPOSE = new URLSearchParams(location.search).get('purpose');
const PURPOSE = PURPOSES[URL_PURPOSE] ? URL_PURPOSE : null;

// Details that can be corrected, in the order they are always shown. `fields` are the
// answers that belong to the detail: they count as entries and are cleared when it is removed.
const DETAILS = [
  { key: 'name', section: 'fixName', id: 'fix-name', label: 'Name', docPrefix: 'fixName', file: 'fix-name-file',
    fields: ['fixNameFirst', 'fixNameFirstHi', 'fixNameSurname', 'fixNameSurnameHi', 'fixNameDoc', 'fixNameDocOther'] },
  { key: 'gender', section: 'fixGender', id: 'fix-gender', label: 'Gender', docPrefix: 'fixGender', file: 'fix-gender-file',
    fields: ['fixGenderNew', 'fixGenderDoc', 'fixGenderDocOther'] },
  { key: 'dob', section: 'fixDob', id: 'fix-dob', label: 'Date of birth or age', docPrefix: 'fixDob', file: 'fix-dob-file',
    fields: ['fixDobNew', 'fixDobDoc', 'fixDobDocOther'] },
  { key: 'relationType', section: 'fixRelationType', id: 'fix-relation-type', label: 'Relation type', docPrefix: 'fixRelationType', file: 'fix-relation-type-file',
    fields: ['fixRelationTypeNew', 'fixRelationTypeDoc', 'fixRelationTypeDocOther'] },
  { key: 'relativeName', section: 'fixRelative', id: 'fix-relative', label: 'Relative’s name', docPrefix: 'fixRelative', file: 'fix-relative-file',
    fields: ['fixRelativeFirst', 'fixRelativeFirstHi', 'fixRelativeSurname', 'fixRelativeSurnameHi', 'fixRelativeDoc', 'fixRelativeDocOther'] },
  { key: 'address', section: 'fixAddress', id: 'fix-address', label: 'Address', docPrefix: 'fa', file: 'fa-file',
    fields: ['faHouse', 'faHouseHi', 'faStreet', 'faStreetHi', 'faTown', 'faTownHi', 'faPostOffice', 'faPostOfficeHi', 'faPin', 'faTehsil', 'faTehsilHi', 'faDistrict', 'faState', 'faDoc', 'faDocOther'] },
  { key: 'mobile', section: 'fixMobile', id: 'fix-mobile', label: 'Mobile number', docPrefix: null, file: null,
    fields: ['fixMobileNew'] },
  { key: 'photo', section: 'fixPhoto', id: 'fix-photo', label: 'Photograph', docPrefix: null, file: 'fix-photo-file',
    fields: [] }
];
const MAX_DETAILS = 4;

const YOUR_DETAILS = { key: 'yourDetails', id: 'your-details', label: 'Your details' };
const DECLARATION = { key: 'declaration', id: 'declaration', label: 'Declaration' };
const PURPOSE_SECTIONS = {
  move: { key: 'newAddress', id: 'new-address', label: 'Your new address' },
  replace: { key: 'replacement', id: 'replacement', label: 'Reason for replacement' },
  disability: { key: 'disability', id: 'disability', label: 'Disability details' }
};
// Section 1. For corrections it also holds the details to correct.
const PURPOSE_QUESTION = { key: 'purpose', id: 'purpose', label: 'What do you need to do' };
const ALL_SECTIONS = [PURPOSE_QUESTION]
  .concat(DETAILS.map(d => ({ key: d.section, id: d.id, label: d.label })))
  .concat([YOUR_DETAILS, PURPOSE_SECTIONS.move, PURPOSE_SECTIONS.replace, PURPOSE_SECTIONS.disability, DECLARATION]);

const UPLOADS = ['fix-name-file', 'fix-gender-file', 'fix-dob-file', 'fix-relation-type-file', 'fix-relative-file', 'fa-file', 'fix-photo-file', 'mv-file', 'fir-file', 'dis-file'];

const camel = (id) => id.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
const kebab = (key) => key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

function todayText() {
  const d = new Date();
  const pad = (n) => (n < 10 ? '0' : '') + n;
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

// PROTOTYPE: every typed answer starts filled in from SAMPLE_ANSWERS, so the form can be walked
// through by clicking alone. Choices (radios, selects, ticks) are still left to the person.
// Set SAMPLE_ANSWERS.ON to false to start the typed answers empty again.
const SAMPLE_ANSWERS = {
  ON: true,
  values: {
    fixNameFirst: 'Ananya Devi', fixNameFirstHi: 'अनन्या देवी', fixNameSurname: 'Rao Sharma', fixNameSurnameHi: 'राव शर्मा',
    fixDobNew: '17/04/2005',
    fixRelativeFirst: 'Suresh Kumar', fixRelativeFirstHi: 'सुरेश कुमार', fixRelativeSurname: 'Rao', fixRelativeSurnameHi: 'राव',
    fixMobileNew: '91234 56789',
    aadhaarNumber: '2345 6789 0123',
    // The new address uses the sample PIN, so its post office, district, state and
    // constituency are the ones PIN autofill would give.
    mvHouse: '22, Lake View Residency', mvHouseHi: '22, लेक व्यू रेजीडेंसी', mvStreet: 'Arera Colony', mvStreetHi: 'अरेरा कॉलोनी',
    mvTown: 'Bhopal', mvTownHi: 'भोपाल', mvPin: '462003', mvPostOffice: 'T T Nagar', mvPostOfficeHi: 'टी टी नगर',
    mvTehsil: 'Huzur', mvTehsilHi: 'हुज़ूर', mvDistrict: 'Bhopal', mvState: 'Madhya Pradesh', mvAc: '152',
    disOtherText: 'Chronic neurological condition', disPercent: '45',
    otp: '123456'
  }
};

// Every answer on the form, keyed so that its field's id is the key in kebab case.
function initialValues() {
  const r = SAMPLE_RECORD, a = r.address;
  const blank = {
    fixNameFirst: '', fixNameFirstHi: '', fixNameSurname: '', fixNameSurnameHi: '', fixNameDoc: '', fixNameDocOther: '',
    fixGenderNew: '', fixGenderDoc: '', fixGenderDocOther: '',
    fixDobNew: '', fixDobDoc: '', fixDobDocOther: '',
    fixRelationTypeNew: '', fixRelationTypeDoc: '', fixRelationTypeDocOther: '',
    fixRelativeFirst: '', fixRelativeFirstHi: '', fixRelativeSurname: '', fixRelativeSurnameHi: '', fixRelativeDoc: '', fixRelativeDocOther: '',
    // Correcting the address starts from the address on record, for editing.
    faHouse: a.house, faHouseHi: a.houseHi, faStreet: a.street, faStreetHi: a.streetHi, faTown: a.town, faTownHi: a.townHi,
    faPostOffice: a.postOffice, faPostOfficeHi: a.postOfficeHi, faPin: a.pin, faTehsil: a.tehsil, faTehsilHi: a.tehsilHi,
    faDistrict: a.district, faState: a.state, faDoc: '', faDocOther: '',
    fixMobileNew: '',
    aadhaarNumber: '', mobile: r.mobile, email: r.email,
    mvHouse: '', mvHouseHi: '', mvStreet: '', mvStreetHi: '', mvTown: '', mvTownHi: '', mvPostOffice: '', mvPostOfficeHi: '',
    mvPin: '', mvTehsil: '', mvTehsilHi: '', mvDistrict: '', mvState: '', mvAc: '', mvOwner: '', mvDoc: '', mvDocOther: '',
    replaceReason: '',
    disOtherText: '', disPercent: '',
    declPlace: r.district, declDate: todayText()
  };
  return SAMPLE_ANSWERS.ON ? Object.assign(blank, SAMPLE_ANSWERS.values) : blank;
}

class Page extends DCLogic {
  // PLACEHOLDER DATA, as on the Form 6 application: every state and union territory, but
  // districts for Madhya Pradesh only and constituencies for Bhopal only. The constituency
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

  // Number and name together, as the new constituency dropdown shows them.
  constituencies = {
    'Bhopal': [['149', 'Berasia'], ['150', 'Bhopal Uttar'], ['151', 'Narela'], ['152', 'Bhopal Dakshin-Paschim'],
      ['153', 'Bhopal Madhya'], ['154', 'Govindpura'], ['155', 'Huzur']]
  };

  relationLabels = { father: 'Father', mother: 'Mother', husband: 'Husband', wife: 'Wife', guardian: 'Guardian' };
  genderLabels = { male: 'Male', female: 'Female', third: 'Third gender' };
  ownerLabels = { self: 'Myself', parent: 'Parent', spouse: 'Spouse', child: 'Adult child' };
  reasonLabels = { lost: 'Lost', damaged: 'Damaged', destroyed: 'Destroyed in a flood, fire or other disaster' };
  disabilityLabels = { locomotor: 'Locomotor', visual: 'Visual', hearing: 'Hearing or speech', other: 'Other' };

  messages = {
    'fix-name-first': 'Enter the correct first name.',
    'fix-gender-new': 'Select the correct gender.',
    'fix-dob-new': 'Enter the correct date of birth as DD/MM/YYYY.',
    'fix-relation-type-new': 'Select the correct relation type.',
    'fix-relative-first': 'Enter the correct first name of your relative.',
    'fix-mobile-new': 'Enter a ten digit mobile number.',
    'fa-house': 'Enter your house or building number.', 'mv-house': 'Enter your house or building number.',
    'fa-street': 'Enter your street, area or locality.', 'mv-street': 'Enter your street, area or locality.',
    'fa-town': 'Enter your town or village.', 'mv-town': 'Enter your town or village.',
    'fa-post-office': 'Enter your post office.', 'mv-post-office': 'Enter your post office.',
    'fa-pin': 'Enter a six digit PIN code.', 'mv-pin': 'Enter a six digit PIN code.',
    'fa-tehsil': 'Enter your tehsil, taluka or mandal.', 'mv-tehsil': 'Enter your tehsil, taluka or mandal.',
    'fa-district': 'Select your district.', 'mv-district': 'Select your district.',
    'fa-state': 'Select your state or union territory.', 'mv-state': 'Select your state or union territory.',
    'mv-ac': 'Select your new constituency.',
    'mv-owner': 'Select whose name the document is in.',
    'aadhaar-number': 'Enter all twelve digits of your Aadhaar number.',
    'mobile': 'Enter a ten digit mobile number.',
    'email': 'Enter an email address in the format name@example.com.',
    'replace-reason': 'Select why you need a replacement card.',
    'dis-other-text': 'Describe the disability.',
    'dis-percent': 'Enter a percentage from 0 to 100, using digits only.',
    'decl-place': 'Enter the place where you are making this declaration.',
    'decl-date': 'Enter the date as DD/MM/YYYY.',
    'declaration-confirm': 'Tick the declaration to continue.',
    'purpose-choice': 'Choose what you need to do'
  };

  // Every document dropdown and its "Document name" field share one message each.
  messageFor(key) {
    if (this.messages[key]) return this.messages[key];
    if (/-doc$/.test(key)) return 'Select the document you are attaching.';
    if (/-doc-other$/.test(key)) return 'Enter the name of the document.';
    return '';
  }

  // Checks that no single field can make: a group where at least one box must be ticked.
  // Each stays until it is put right, like any other error.
  customChecks = {
    // Asked only once "Correct wrong details" is chosen.
    'fix-choice': () => this.state.purpose !== 'correct' || this.selectedDetails().length ? '' : 'Select at least one detail to correct',
    'dis-category': () => Object.keys(this.state.dis).some(k => this.state.dis[k]) ? '' : 'Select at least one category of disability.'
  };
  customBySection = { purpose: ['fix-choice'], disability: ['dis-category'] };

  state = {
    purpose: PURPOSE,
    active: 'purpose',
    open: 'purpose',
    errors: {},
    summaries: {},
    done: [],
    fixes: {},
    dis: { locomotor: false, visual: false, hearing: false, other: false },
    noAadhaar: false,
    declared: false,
    combo: null,
    docs: {},
    dragging: {},
    savedNote: '',
    leaveOpen: false,
    leaveHref: 'index.html?loggedIn=1#services',
    removeKey: null,
    changeTo: null,
    screen: 'form',
    resent: false,
    submitting: false,
    refNumber: '',
    copied: false,
    values: initialValues()
  };

  // ---- Sections ---------------------------------------------------------------------------

  selectedDetails() {
    return DETAILS.filter(d => this.state.fixes[d.key]);
  }

  // The rail and the accordion follow this list, so a change in Section 1 updates both at once.
  // Before a choice there is only Section 1.
  sectionList() {
    const list = [PURPOSE_QUESTION];
    const p = this.state.purpose;
    if (!p) return list;
    if (p === 'correct') {
      this.selectedDetails().forEach(d => list.push({ key: d.section, id: d.id, label: d.label }));
      list.push(YOUR_DETAILS);
    } else {
      list.push(YOUR_DETAILS);
      list.push(PURPOSE_SECTIONS[p]);
    }
    list.push(DECLARATION);
    return list;
  }

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
    (this.customBySection[sectionId] || []).forEach(k => {
      const msg = this.customChecks[k]();
      if (msg) found[k] = msg;
    });
    this.controlsIn(sectionId).forEach(el => {
      const key = el.id || el.name;
      if (!key || found[key]) return;
      if (!el.checkValidity()) { found[key] = this.messageFor(key) || el.validationMessage; return; }
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
    (this.customBySection[sectionId] || []).forEach(k => { delete errors[k]; });
    Object.keys(found).forEach(k => { errors[k] = found[k]; });
    return errors;
  }

  // As on Form 6: errors are raised only when Save and continue is pressed, and each one
  // clears as soon as it is put right.
  saveOrShowErrors(sectionId, proceed) {
    const found = this.checkSection(sectionId);
    const keys = Object.keys(found);
    const summaries = Object.assign({}, this.state.summaries);
    if (keys.length) summaries[sectionId] = keys.map(k => ({ key: k, label: this.fieldLabel(k) }));
    else delete summaries[sectionId];
    this.setState({ errors: this.applyErrors(sectionId, found), summaries: summaries });
    if (keys.length) {
      const first = document.getElementById(keys[0]) || document.querySelector('[name="' + keys[0] + '"]');
      if (first && first.focus) setTimeout(() => first.focus(), 0);
      return;
    }
    proceed();
  }

  showSaved(force) {
    const now = Date.now();
    if (!force && now - (this.lastSavedNote || 0) < 30000) return;
    this.lastSavedNote = now;
    const time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    this.setState({ savedNote: 'Saved ' + time });
  }

  clearFixedErrors() {
    const errors = Object.assign({}, this.state.errors);
    let changed = false;
    Object.keys(errors).forEach(key => {
      if (this.customChecks[key]) {
        if (this.customChecks[key]()) return;
        delete errors[key];
        changed = true;
        return;
      }
      const el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
      if (!el || !el.checkValidity()) return;
      if (el.type === 'file') return;   // cleared only when an acceptable file is chosen
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

  scrollTo(id) {
    setTimeout(() => {
      const el = document.getElementById(id);
      const se = document.scrollingElement || document.documentElement;
      if (el && se) se.scrollTop = el.getBoundingClientRect().top + se.scrollTop - 88;
    }, 0);
  }

  scrollTop() {
    setTimeout(() => {
      const se = document.scrollingElement || document.documentElement;
      if (se) se.scrollTop = 0;
    }, 0);
  }

  openSection(id) {
    this.setState({ open: id, active: id || this.state.active });
    if (id) this.scrollTo(id);
  }

  saveSection(id) {
    const list = this.sectionList();
    const ids = list.map(s => s.id);
    const next = list[ids.indexOf(id) + 1];
    const done = this.state.done.indexOf(id) > -1 ? this.state.done : this.state.done.concat([id]);
    this.setState({ done: done, open: next ? next.id : null, active: next ? next.id : id });
    if (next) this.scrollTo(next.id);
    this.showSaved(true);
  }

  goToReview() {
    const done = this.state.done.indexOf('declaration') > -1 ? this.state.done : this.state.done.concat(['declaration']);
    this.setState({ done: done, open: null, screen: 'review' });
    this.scrollTop();
  }

  editSection(id) {
    return () => {
      this.setState({ screen: 'form', open: id, active: id });
      this.scrollTo(id);
    };
  }

  // ---- Answers ------------------------------------------------------------------------------

  setVal(k) {
    return (e) => this.setValTo(k, e.target.value);
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

  // PIN autofill (PROTOTYPE: only SAMPLE_RECORD.samplePin is known). The filled fields stay
  // editable. In the new address, the constituency is suggested from the same PIN.
  onPin(prefix) {
    return (e) => {
      const pin = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      const values = Object.assign({}, this.state.values);
      values[prefix + 'Pin'] = pin;
      const s = SAMPLE_RECORD.samplePin;
      if (pin === s.pin) {
        values[prefix + 'PostOffice'] = s.postOffice;
        values[prefix + 'PostOfficeHi'] = s.postOfficeHi;
        values[prefix + 'District'] = s.district;
        values[prefix + 'State'] = s.state;
        if (prefix === 'mv') values.mvAc = s.constituency;
      }
      this.setState({ values: values });
    };
  }

  // ---- What are you correcting ----------------------------------------------------------------

  // Anything typed, chosen or uploaded for a detail. Only then is removing it confirmed.
  hasEntries(key) {
    const d = DETAILS.filter(x => x.key === key)[0];
    const init = initialValues();
    const v = this.state.values;
    return d.fields.some(f => (v[f] || '') !== (init[f] || '')) || !!(d.file && this.state.docs[d.file]);
  }

  toggleFix(key) {
    const on = !this.state.fixes[key];
    if (on && this.selectedDetails().length >= MAX_DETAILS) return;
    if (!on && this.hasEntries(key)) { this.setState({ removeKey: key }); return; }
    this.setFix(key, on);
  }

  // Removing a detail clears everything entered for it, so adding it back starts afresh.
  setFix(key, on) {
    const fixes = Object.assign({}, this.state.fixes);
    fixes[key] = on;
    const next = { fixes: fixes, removeKey: null };
    if (!on) {
      const d = DETAILS.filter(x => x.key === key)[0];
      const init = initialValues();
      const values = Object.assign({}, this.state.values);
      d.fields.forEach(f => { values[f] = init[f]; });
      const docs = Object.assign({}, this.state.docs);
      if (d.file) delete docs[d.file];
      const errors = Object.assign({}, this.state.errors);
      d.fields.forEach(f => { delete errors[kebab(f)]; });
      if (d.file) delete errors[d.file];
      const summaries = Object.assign({}, this.state.summaries);
      delete summaries[d.id];
      Object.assign(next, {
        values: values, docs: docs, errors: errors, summaries: summaries,
        done: this.state.done.filter(id => id !== d.id),
        open: this.state.open === d.id ? 'purpose' : this.state.open,
        active: this.state.active === d.id ? 'purpose' : this.state.active
      });
    }
    this.setState(next);
  }

  // ---- What do you need to do ---------------------------------------------------------------

  // Anything entered after Section 1: a changed answer, an upload, a ticked box. The prefilled
  // answers (mobile, email, place, date, the address on record) do not count until edited.
  hasLaterEntries() {
    const s = this.state, init = initialValues();
    return Object.keys(init).some(k => (s.values[k] || '') !== (init[k] || '')) ||
      Object.keys(s.docs).length > 0 || Object.keys(s.dis).some(k => s.dis[k]) || s.noAadhaar || s.declared;
  }

  // Choosing a different purpose asks first when later sections hold entries.
  choosePurpose(k) {
    if (k === this.state.purpose) return;
    if (this.state.purpose && this.hasLaterEntries()) { this.setState({ changeTo: k }); return; }
    this.applyPurpose(k);
  }

  // A new purpose starts every later section afresh. Section 1 stays open.
  applyPurpose(k) {
    this.setState({
      purpose: k, changeTo: null, fixes: {}, values: initialValues(), docs: {},
      dis: { locomotor: false, visual: false, hearing: false, other: false },
      noAadhaar: false, declared: false, done: [], errors: {}, summaries: {},
      open: 'purpose', active: 'purpose'
    });
  }

  // The address alert's link selects "Move to a new address" on this same screen.
  switchToMove(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.choosePurpose('move');
  }

  // ---- Combobox (ux4g-combobox, single select), as on Form 6 ----------------------------------

  comboDefs() {
    const v = this.state.values;
    return {
      faState: { valueKey: 'faState', options: this.states },
      faDistrict: { valueKey: 'faDistrict', options: this.districts[v.faState] || [] },
      mvState: { valueKey: 'mvState', options: this.states },
      mvDistrict: { valueKey: 'mvDistrict', options: this.districts[v.mvState] || [] }
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
    // A new state makes the district stale, and a new district the suggested constituency.
    if (changed && key === 'faState') values.faDistrict = '';
    if (changed && key === 'mvState') Object.assign(values, { mvDistrict: '', mvAc: '' });
    if (changed && key === 'mvDistrict') values.mvAc = '';
    this.setState({ values: values, combo: null });
  }

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
      keepFocus: (e) => e.preventDefault()
    };
  }

  // ---- Uploads and the advisory document check, as on Form 6 ----------------------------------

  setDoc(key, doc) {
    const docs = Object.assign({}, this.state.docs);
    docs[key] = doc;
    this.setState({ docs: docs });
  }

  fileRule = { pattern: /\.(jpe?g|png|pdf)$/i, types: 'a JPG, JPEG, PNG or PDF' };
  maxFileBytes = 2 * 1048576;

  fileProblem(file) {
    if (!SCRIPTED_DOC_CHECK.ENFORCE_SIZE_AND_TYPE) return '';
    if (!this.fileRule.pattern.test(file.name)) return file.name + ' is not ' + this.fileRule.types + ' file. Choose ' + this.fileRule.types + ' file.';
    if (file.size > this.maxFileBytes) return file.name + ' is ' + (file.size / 1048576).toFixed(1) + ' MB. Choose a file under 2 MB.';
    return '';
  }

  setFileError(key, msg) {
    const errors = Object.assign({}, this.state.errors);
    if (msg) errors[key] = msg; else delete errors[key];
    this.setState({ errors: errors });
  }

  isChecked(key) {
    return Object.prototype.hasOwnProperty.call(SCRIPTED_DOC_CHECK.outcomes, key);
  }

  scriptedWarning(key) {
    const outcome = SCRIPTED_DOC_CHECK.outcomes[key];
    return !outcome || outcome === 'clean' ? '' : String(outcome);
  }

  takeSampleFile(key) {
    this.takeFile(key, { name: SAMPLE_FILES.names[key] || key + '.pdf', size: SAMPLE_FILES.size });
  }

  takeFile(key, file) {
    const input = document.getElementById(key);
    if (!file) { this.setDoc(key, null); return; }
    const problem = this.fileProblem(file);
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
      if (!now || now.token !== token) return;
      this.setDoc(key, { token: token, status: 'done', checked: true, name: file.name, size: file.size, warning: this.scriptedWarning(key) });
    }, SCRIPTED_DOC_CHECK.SCAN_SECONDS * 1000);
  }

  setDragging(key, on) {
    if (!!(this.state.dragging || {})[key] === on) return;
    this.setState(st => ({ dragging: Object.assign({}, st.dragging, { [key]: on }) }));
  }

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
      // The file rules sit beneath the upload on this form, so the panel's hint is only the
      // name of the file being checked.
      panelHint: scanning ? d.name : '',
      done: done,
      itemClass: 'ux4g-upload-file-item' + (warned ? ' is-flagged' : ''),
      clean: done && d.checked && !warned,
      name: d ? d.name : '',
      size: size,
      announce: scanning ? 'Verifying document.' : !done ? '' : warned ? d.warning : d.checked ? 'Document verified.' : d.name + ' added.',
      pick: () => { if (SAMPLE_FILES.ON) { this.takeSampleFile(key); return; } const input = document.getElementById(key); if (input) input.click(); },
      dragOver: (e) => { e.preventDefault(); if (!d) this.setDragging(key, true); },
      dragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) this.setDragging(key, false); },
      drop: (e) => {
        e.preventDefault();
        this.setDragging(key, false);
        if (d) return;
        this.takeFile(key, e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      },
      remove: () => {
        const input = document.getElementById(key);
        if (input) input.value = '';
        this.setDoc(key, null);
        focusUpload();
      },
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

  attached(key) {
    const d = this.state.docs[key];
    return d && d.status === 'done' ? 'Attached' : '';
  }

  // ---- Review ----------------------------------------------------------------------------------

  joinName(first, surname) {
    return [first, surname].filter(Boolean).join(' ');
  }

  addressText(prefix) {
    const v = this.state.values;
    const g = (k) => v[prefix + k] || '';
    return [g('House'), g('Street'), g('Town'), g('PostOffice') ? g('PostOffice') + ' post office' : '', g('Tehsil'),
      g('District'), g('State'), g('Pin')].filter(Boolean).join(', ');
  }

  recordedAddress() {
    const a = SAMPLE_RECORD.address;
    return [a.house, a.street, a.town, a.postOffice + ' post office', a.tehsil, a.district, a.state, a.pin].join(', ');
  }

  docName(prefix) {
    const v = this.state.values;
    const chosen = v[prefix + 'Doc'];
    return chosen === 'other' ? v[prefix + 'DocOther'] : chosen;
  }

  // Each chosen detail as it is recorded now and as it should read.
  corrections() {
    const v = this.state.values, r = SAMPLE_RECORD;
    const rows = {
      name: [
        { label: 'Name', before: this.joinName(r.name.first, r.name.surname), after: this.joinName(v.fixNameFirst, v.fixNameSurname) },
        { label: 'Name in Hindi', before: this.joinName(r.name.firstHi, r.name.surnameHi), after: this.joinName(v.fixNameFirstHi, v.fixNameSurnameHi) }
      ],
      gender: [{ label: 'Gender', before: this.genderLabels[r.gender], after: this.genderLabels[v.fixGenderNew] || '' }],
      dob: [{ label: 'Date of birth', before: r.dob, after: v.fixDobNew }],
      relationType: [{ label: 'Relation type', before: this.relationLabels[r.relationType], after: this.relationLabels[v.fixRelationTypeNew] || '' }],
      relativeName: [
        { label: 'Relative’s name', before: this.joinName(r.relative.first, r.relative.surname), after: this.joinName(v.fixRelativeFirst, v.fixRelativeSurname) },
        { label: 'Relative’s name in Hindi', before: this.joinName(r.relative.firstHi, r.relative.surnameHi), after: this.joinName(v.fixRelativeFirstHi, v.fixRelativeSurnameHi) }
      ],
      address: [{ label: 'Address', before: this.recordedAddress(), after: this.addressText('fa') }],
      mobile: [{ label: 'Mobile number', before: r.mobile, after: v.fixMobileNew }],
      photo: []
    };
    return this.selectedDetails().map(d => ({
      id: d.id,
      title: d.label,
      onEdit: this.editSection(d.id),
      hasCompare: rows[d.key].length > 0,
      compare: rows[d.key].map(c => ({ label: c.label, before: c.before || '', after: c.after || '' })),
      rows: d.key === 'photo'
        ? [{ label: 'New photograph', value: this.attached(d.file) }]
        : d.docPrefix
          ? [{ label: 'Supporting document', value: this.docName(d.docPrefix) }, { label: 'Document', value: this.attached(d.file) }]
          : []
    }));
  }

  // Everything else on the review, in the order of the form.
  reviewSections() {
    const v = this.state.values, r = SAMPLE_RECORD, p = this.state.purpose, dis = this.state.dis;
    const out = [];
    const yourRows = [
      { label: 'Name', value: this.joinName(r.name.first, r.name.surname) },
      { label: 'Voter ID number (EPIC)', value: r.epic },
      { label: 'State or union territory', value: r.state },
      { label: 'District', value: r.district },
      { label: 'Assembly constituency', value: r.constituency.number + ' ' + r.constituency.name },
      this.state.noAadhaar ? { label: 'Aadhaar number', value: 'Not held' } : { label: 'Aadhaar number', value: v.aadhaarNumber }
    ];
    if (this.showMobile()) yourRows.push({ label: 'Mobile number', value: v.mobile });
    yourRows.push({ label: 'Email address', value: v.email });
    out.push({ id: 'your-details', title: 'Your details', rows: yourRows });

    if (p === 'move') {
      const ac = (this.constituencies[v.mvDistrict] || []).filter(c => c[0] === v.mvAc)[0];
      out.push({ id: 'new-address', title: 'Your new address', rows: [
        { label: 'New address', value: this.addressText('mv') },
        { label: 'New constituency', value: ac ? ac[0] + ' ' + ac[1] : '' },
        { label: 'Document in the name of', value: this.ownerLabels[v.mvOwner] || '' },
        { label: 'Supporting document', value: this.docName('mv') },
        { label: 'Document', value: this.attached('mv-file') }
      ] });
    }
    if (p === 'replace') {
      const rows = [{ label: 'Reason', value: this.reasonLabels[v.replaceReason] || '' }];
      if (v.replaceReason === 'lost') rows.push({ label: 'FIR or police report', value: this.attached('fir-file') });
      out.push({ id: 'replacement', title: 'Reason for replacement', rows: rows });
    }
    if (p === 'disability') {
      const cats = Object.keys(this.disabilityLabels).filter(k => dis[k]).map(k => this.disabilityLabels[k]);
      const rows = [{ label: 'Category of disability', value: cats.join(', ') }];
      if (dis.other) rows.push({ label: 'Description', value: v.disOtherText });
      rows.push({ label: 'Percentage of disability', value: v.disPercent ? v.disPercent + '%' : '' });
      rows.push({ label: 'Disability certificate', value: this.attached('dis-file') });
      out.push({ id: 'disability', title: 'Disability details', rows: rows });
    }
    return out;
  }

  rowVals(rows) {
    return rows.map(row => ({
      label: row.label,
      value: row.value || '',
      valueClass: 'ux4g-text-neutral-secondary ux4g-body-s-default' + ((row.value || '') === '' ? ' preview-empty' : '')
    }));
  }

  // The names as they will be printed on the new card: corrected where they are being corrected.
  cardNames() {
    const v = this.state.values, r = SAMPLE_RECORD, f = this.state.fixes;
    const correcting = this.state.purpose === 'correct';
    const name = correcting && f.name;
    const rel = correcting && f.relativeName;
    return this.rowVals([
      { label: 'Name', value: name ? this.joinName(v.fixNameFirst, v.fixNameSurname) : this.joinName(r.name.first, r.name.surname) },
      { label: 'Name in Hindi', value: name ? this.joinName(v.fixNameFirstHi, v.fixNameSurnameHi) : this.joinName(r.name.firstHi, r.name.surnameHi) },
      { label: 'Relative’s name', value: rel ? this.joinName(v.fixRelativeFirst, v.fixRelativeSurname) : this.joinName(r.relative.first, r.relative.surname) },
      { label: 'Relative’s name in Hindi', value: rel ? this.joinName(v.fixRelativeFirstHi, v.fixRelativeSurnameHi) : this.joinName(r.relative.firstHi, r.relative.surnameHi) }
    ]);
  }

  showMobile() {
    return !(this.state.purpose === 'correct' && this.state.fixes.mobile);
  }

  // ---- Leaving --------------------------------------------------------------------------------

  confirmLeave(href) {
    return (e) => {
      if (e && e.preventDefault) e.preventDefault();
      this.setState({ leaveOpen: true, leaveHref: href });
    };
  }

  // Everything the shared <header> binds to, identical on every page.
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
      loginHref: 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html'),
      accountOpen: !!s.accountOpen,
      toggleAccount: () => this.setState(st => ({ accountOpen: !st.accountOpen })),
      closeAccountOnBlur: (e) => {
        const wrap = e.currentTarget.closest('[data-account]');
        if (!wrap || !wrap.contains(e.relatedTarget)) this.setState({ accountOpen: false });
      },
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
    const s = this.state, v = s.values, p = s.purpose, r = SAMPLE_RECORD;
    const list = this.sectionList();
    const done = s.done.filter(id => list.some(x => x.id === id));
    const total = list.length;
    const filled = done.length;
    const exact = (filled / total) * 100;
    let rounded = Math.round(exact / 10) * 10;
    if (filled === 0) rounded = 0;
    else if (rounded === 0) rounded = 10;
    if (rounded >= 100 && filled < total) rounded = 90;
    if (filled === total) rounded = 100;

    const sections = list.map((sec, i) => {
      const active = s.active === sec.id;
      const isDone = done.indexOf(sec.id) > -1;
      return {
        label: sec.label,
        prefix: '',
        mark: String(i + 1),
        href: '#' + sec.id,
        current: active ? 'step' : 'false',
        done: isDone,
        onClick: (e) => { e.preventDefault(); this.openSection(sec.id); },
        // UX4G's 'completed' is its base step class; 'done' is a finished step, shown green with a
        // tick. The current step gets the purple ring, and later steps stay grey.
        stepClass: 'ux4g-status-pipeline-step ux4g-status-pipeline-completed' + (isDone && !active ? ' ux4g-status-pipeline-done' : '') + (!isDone && !active ? ' ux4g-status-pipeline-step-pending' : ''),
        iconClass: 'ux4g-status-pipeline-head-icon' + (active ? ' ux4g-status-pipeline-head-icon-active' : ''),
        checkClass: 'ux4g-status-pipeline-head-check' + (active ? ' ux4g-status-pipeline-head-check-active' : ''),
        linkClass: 'section-rail-link ux4g-status-pipeline-label ' + (active ? 'ux4g-label-m-strong ux4g-text-primary' : 'ux4g-label-m-default ux4g-text-neutral-primary')
      };
    });

    // Every section the page can show. Those not in this application are never rendered.
    const show = {};
    const heads = {};
    ALL_SECTIONS.forEach(sec => {
      const i = list.map(x => x.id).indexOf(sec.id);
      show[sec.key] = i > -1;
      const open = s.open === sec.id;
      const isDone = done.indexOf(sec.id) > -1;
      const prev = list[i - 1];
      const summary = s.summaries[sec.id] || [];
      // Before a choice, Section 1 is the only section but not the last one.
      const last = !!p && i === list.length - 1;
      heads[sec.key] = {
        label: sec.label,
        open: open,
        done: isDone,
        onClick: () => this.openSection(open ? null : sec.id),
        onSave: () => this.saveOrShowErrors(sec.id, last ? () => this.goToReview() : () => this.saveSection(sec.id)),
        saveLabel: last ? 'Review application' : 'Save and continue',
        hasPrevious: i > 0,
        onPrevious: () => this.openSection(prev ? prev.id : sec.id),
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
        buttonClass: 'ux4g-accordion__button' + (open ? '' : ' collapsed')
      };
    });
    // "Your details" sits after the corrections, or before the purpose section otherwise.
    show.yourDetailsFirst = show.yourDetails && p !== 'correct';
    show.yourDetailsLast = show.yourDetails && p === 'correct';

    // Errors for every field on the page, keyed by the camel case of the field's id.
    const errKeys = Object.keys(v).map(kebab).concat(UPLOADS, ['purpose-choice', 'fix-choice', 'dis-category', 'declaration-confirm', 'otp']);
    const errs = {};
    errKeys.forEach(k => {
      const show = !!s.errors[k];
      errs[camel(k)] = {
        show: show,
        ok: !show,
        msg: s.errors[k] || '',
        inputClass: 'ux4g-input-container ux4g-input-md ' + (show ? 'ux4g-input-error' : 'ux4g-input-default'),
        radioClass: 'ux4g-radio ux4g-radio-md' + (show ? ' ux4g-radio-error' : ''),
        checkboxClass: 'ux4g-checkbox ux4g-checkbox-md' + (show ? ' ux4g-checkbox-error' : '')
      };
    });

    const on = {};
    Object.keys(v).forEach(k => { on[k] = this.setVal(k); });
    on.fixDobNew = this.onDate('fixDobNew');
    on.declDate = this.onDate('declDate');
    on.faPin = this.onPin('fa');
    on.mvPin = this.onPin('mv');
    on.aadhaarNumber = (e) => {
      const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
      const groups = [];
      for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
      this.setValTo('aadhaarNumber', groups.join(' '));
    };
    on.disPercent = (e) => this.setValTo('disPercent', e.target.value.replace(/[^0-9]/g, '').slice(0, 3));

    const docs = {}, onFile = {};
    UPLOADS.forEach(k => {
      docs[camel(k)] = this.docVals(k);
      onFile[camel(k)] = (e) => this.takeFile(k, e.target.files && e.target.files[0]);
    });

    // Detail checkboxes: the fifth cannot be ticked, so the rest disable at the limit.
    const count = this.selectedDetails().length;
    const atLimit = count >= MAX_DETAILS;
    const fix = {};
    DETAILS.forEach(d => {
      fix[d.key] = {
        checked: !!s.fixes[d.key],
        disabled: atLimit && !s.fixes[d.key],
        toggle: () => this.toggleFix(d.key)
      };
    });

    const dis = s.dis;
    const toggleDis = (k) => () => this.setState({ dis: Object.assign({}, dis, { [k]: !dis[k] }) });
    const removeDetail = DETAILS.filter(d => d.key === s.removeKey)[0];
    const moveAcs = this.constituencies[v.mvDistrict] || [];
    const reason = v.replaceReason;
    const prepHref = 'form8-prep.html?loggedIn=1';

    return {
      // Logging out mid-application goes through the same dialog as any other exit.
      ...this.headerVals({
        loggedIn: true,
        homeHref: 'index.html?loggedIn=1',
        onLogOut: s.screen === 'done' ? null : () => this.setState({ leaveOpen: true, leaveHref: 'index.html' })
      }),
      errs: errs,
      sections: sections,
      heads: heads,
      show: show,
      v: v,
      on: on,
      docs: docs,
      onFile: onFile,
      pctExact: Math.round(exact),
      barValue: exact.toFixed(1),
      pctLabel: rounded + '%',

      savedNote: s.savedNote || 'Answers are saved automatically',

      purposeLabel: p ? PURPOSES[p].label : '',
      formLine: p ? 'Form\u00A08: ' + PURPOSES[p].label : '',
      requestLine: p ? PURPOSES[p].request : '',

      rec: {
        name: this.joinName(r.name.first, r.name.surname),
        nameHi: this.joinName(r.name.firstHi, r.name.surnameHi),
        gender: this.genderLabels[r.gender],
        dob: r.dob,
        relationType: this.relationLabels[r.relationType],
        relative: this.joinName(r.relative.first, r.relative.surname),
        relativeHi: this.joinName(r.relative.firstHi, r.relative.surnameHi),
        address: this.recordedAddress(),
        mobile: r.mobile,
        epic: r.epic,
        state: r.state,
        district: r.district,
        constituency: r.constituency.number + ' ' + r.constituency.name
      },

      // What are you correcting
      fix: fix,
      countLine: count + ' of ' + MAX_DETAILS + ' selected',
      atLimit: atLimit,
      addressTicked: !!s.fixes.address,
      switchToMove: (e) => this.switchToMove(e),

      // Document name dropdowns: "Any other document" asks for its name.
      other: {
        fixName: v.fixNameDoc === 'other', fixGender: v.fixGenderDoc === 'other', fixDob: v.fixDobDoc === 'other',
        fixRelationType: v.fixRelationTypeDoc === 'other', fixRelative: v.fixRelativeDoc === 'other',
        fa: v.faDoc === 'other', mv: v.mvDoc === 'other'
      },

      is: {
        purpose: Object.fromEntries(Object.keys(PURPOSES).map(k => [k, p === k])),
        gender: { male: v.fixGenderNew === 'male', female: v.fixGenderNew === 'female', third: v.fixGenderNew === 'third' },
        reason: { lost: reason === 'lost', damaged: reason === 'damaged', destroyed: reason === 'destroyed' }
      },
      pick: {
        purpose: Object.fromEntries(Object.keys(PURPOSES).map(k => [k, () => this.choosePurpose(k)])),
        gender: { male: () => this.setValTo('fixGenderNew', 'male'), female: () => this.setValTo('fixGenderNew', 'female'), third: () => this.setValTo('fixGenderNew', 'third') },
        reason: { lost: () => this.setValTo('replaceReason', 'lost'), damaged: () => this.setValTo('replaceReason', 'damaged'), destroyed: () => this.setValTo('replaceReason', 'destroyed') }
      },
      replaceLost: reason === 'lost',

      combo: {
        faState: this.comboVals('faState', 'fa-state', errs.faState.show),
        faDistrict: this.comboVals('faDistrict', 'fa-district', errs.faDistrict.show),
        mvState: this.comboVals('mvState', 'mv-state', errs.mvState.show),
        mvDistrict: this.comboVals('mvDistrict', 'mv-district', errs.mvDistrict.show)
      },
      // PLACEHOLDER: constituencies are known for Bhopal only, so the dropdown appears once the
      // new address is in Bhopal.
      showMoveAc: moveAcs.length > 0,
      ownerHint: !!v.mvOwner && v.mvOwner !== 'self' && !errs.mvOwner.show,

      // Your details
      noAadhaar: s.noAadhaar,
      aadhaarRequired: !s.noAadhaar,
      aadhaarBoxClass: 'ux4g-input' + (s.noAadhaar ? ' ux4g-input-is-disabled' : ''),
      toggleNoAadhaar: () => {
        const errors = Object.assign({}, s.errors);
        delete errors['aadhaar-number'];
        this.setState({ noAadhaar: !s.noAadhaar, errors: errors });
      },
      showMobile: this.showMobile(),

      // Disability
      d: dis,
      toggleDisability: { locomotor: toggleDis('locomotor'), visual: toggleDis('visual'), hearing: toggleDis('hearing'), other: toggleDis('other') },

      // Declaration
      declared: s.declared,
      toggleDeclared: () => this.setState({ declared: !s.declared }),

      // Leaving: every breadcrumb, close control and the Change link asks first.
      leaveOpen: s.leaveOpen,
      leaveHref: s.leaveHref,
      openLeave: () => this.setState({ leaveOpen: true, leaveHref: 'index.html?loggedIn=1#services' }),
      closeLeave: () => this.setState({ leaveOpen: false }),
      leaveTo: {
        home: this.confirmLeave('index.html?loggedIn=1#services'),
        blo: this.confirmLeave('service.html?s=book-blo&loggedIn=1'),
        prep: this.confirmLeave(prepHref)
      },
      prepHref: prepHref,

      // Removing a detail that has entries
      removeOpen: !!removeDetail,
      removeTitle: removeDetail ? 'Remove ' + removeDetail.label + ' from this application?' : '',
      keepDetail: () => this.setState({ removeKey: null }),
      // Changing what the application is for, once later sections hold entries.
      changeOpen: !!s.changeTo,
      keepPurpose: () => this.setState({ changeTo: null }),
      changePurpose: () => { if (s.changeTo) this.applyPurpose(s.changeTo); },
      removeDetail: () => { if (removeDetail) this.setFix(removeDetail.key, false); },

      // Screens
      screenForm: s.screen === 'form',
      screenReview: s.screen === 'review',
      screenEsign: s.screen === 'esign',
      screenDone: s.screen === 'done',

      // Review
      isCorrect: p === 'correct',
      showCardNames: p !== 'disability',
      cardNames: this.cardNames(),
      corrections: this.corrections().map(c => Object.assign(c, { rows: this.rowVals(c.rows), hasRows: c.rows.length > 0 })),
      reviewSections: this.reviewSections().map(sec => ({ title: sec.title, onEdit: this.editSection(sec.id), rows: this.rowVals(sec.rows) })),
      backToForm: (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.setState({ screen: 'form', open: 'declaration', active: 'declaration' });
        this.scrollTo('declaration');
      },
      needsDeclaration: !s.declared,
      signDisabled: !s.declared,
      goToEsign: () => {
        if (!s.declared) return;
        this.setState({ screen: 'esign', resent: false });
        this.scrollTop();
      },

      // e-Sign
      backToReview: () => { this.setState({ screen: 'review' }); this.scrollTop(); },
      resendOtp: () => this.setState({ resent: true, values: Object.assign({}, v, { otp: initialValues().otp || '' }) }),
      resent: s.resent,
      onOtp: (e) => this.setValTo('otp', e.target.value.replace(/[^0-9]/g, '').slice(0, 6)),
      submitting: s.submitting,
      submitLabel: s.submitting ? 'Submitting' : 'Sign and submit',
      signAndSubmit: () => {
        if (s.submitting) return;
        // PROTOTYPE: any six digits sign the application (ESIGN_ACCEPTS_ANY_SIX_DIGITS).
        const ok = ESIGN_ACCEPTS_ANY_SIX_DIGITS && /^\d{6}$/.test(v.otp || '');
        const errors = Object.assign({}, s.errors);
        if (!ok) {
          errors.otp = 'Enter the 6 digit one-time password.';
          this.setState({ errors: errors });
          setTimeout(() => { const el = document.getElementById('otp'); if (el) el.focus(); }, 0);
          return;
        }
        delete errors.otp;
        this.setState({ errors: errors, submitting: true });
        // PROTOTYPE: the reference number is made up here, and nothing is sent anywhere.
        setTimeout(() => {
          let digits = '';
          for (let i = 0; i < 6; i++) digits += Math.floor(Math.random() * 10);
          this.setState({ screen: 'done', submitting: false, refNumber: 'MP/BHO/2026/' + digits, copied: false });
          this.scrollTop();
        }, 1500);
      },

      // Confirmation
      refNumber: s.refNumber,
      // PROTOTYPE: the tracking page shows this application from the URL alone: the form type,
      // the purpose and, for corrections, the details. A real portal would look up the reference.
      trackHref: 'track.html?loggedIn=1&status=submitted&form=8&purpose=' + p +
        (p === 'correct' ? '&details=' + this.selectedDetails().map(d => d.key).join(',') : '') +
        '&ref=' + encodeURIComponent(s.refNumber),
      copyLabel: s.copied ? 'Copied' : 'Copy code',
      copyRef: () => {
        if (navigator.clipboard) navigator.clipboard.writeText(s.refNumber);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      },
      returnCard: p === 'correct' || p === 'move' || (p === 'replace' && reason === 'damaged'),
      oldEntryRemoved: p === 'move',
      finalStep: {
        correct: { title: 'Entry corrected', text: 'If approved, your entry is corrected and a new voter ID card is issued.' },
        move: { title: 'Entry moved', text: 'If approved, your entry is moved to your new address and a new voter ID card is issued.' },
        replace: { title: 'Card issued', text: 'If approved, a replacement voter ID card is issued.' },
        disability: { title: 'Entry marked', text: 'If approved, your entry is marked as a person with disability.' }
      }[p]
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

