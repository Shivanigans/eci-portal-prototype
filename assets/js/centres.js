/* PLACEHOLDER DATA. Not real offices, addresses, distances or hours.
 *
 * Sample centres for the "Find your nearest centre" side sheet
 * (assets/js/centre-sheet.js). The prototype calls no API: the same list shows
 * for "current location" and for any PIN code. Replace this file with a
 * real lookup before anything goes live.
 *
 * Each entry: name, address, distance (shown as is), hours (shown as is)
 * and openNow (true shows a green "Open now" tag, false a grey "Closed" tag). The
 * sheet shows the first 3, and each "Open in Google Maps" link searches for the name.
 */
window.ECI_CENTRES = [
  {
    name: 'Electoral Registration Office, New Delhi',
    address: 'Room 12, Jamnagar House, Shahjahan Road, New Delhi 110011',
    distance: '1.2 km',
    hours: 'Mon\u00A0to\u00A0Sat, 10\u00A0am to 5\u00A0pm',
    openNow: true
  },
  {
    name: 'Common Service Centre, Connaught Place',
    address: 'Shop 4, Block E, Connaught Place, New Delhi 110001',
    distance: '2.4 km',
    hours: 'Mon\u00A0to\u00A0Sat, 9\u00A0am to 7\u00A0pm',
    openNow: true
  },
  {
    name: 'Electoral Registration Office, Karol Bagh',
    address: 'Zonal Office, Ajmal Khan Road, Karol Bagh, New Delhi 110005',
    distance: '4.8 km',
    hours: 'Mon\u00A0to\u00A0Fri, 10\u00A0am to 5\u00A0pm',
    openNow: false
  },
  {
    name: 'Common Service Centre, Lajpat Nagar',
    address: '1st floor, Central Market, Lajpat Nagar II, New Delhi 110024',
    distance: '6.1 km',
    hours: 'Mon\u00A0to\u00A0Sat, 9\u00A0am to 6\u00A0pm',
    openNow: true
  },
  {
    name: 'Electoral Registration Office, Saket',
    address: 'SDM Office, Press Enclave Road, Saket, New Delhi 110017',
    distance: '9.3 km',
    hours: 'Mon\u00A0to\u00A0Fri, 10\u00A0am to 4\u00A0pm',
    openNow: false
  }
];
