import { APP } from '../config/constants.js';

export function validTimeZone(zone) {
  if (typeof zone !== 'string' || zone.length > 80) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function deviceTimeZone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return validTimeZone(detected) ? detected : APP.timeZone;
}

// Country mapping sourced from IANA tzdb zone.tab.
const ZONE_COUNTRIES = {"Europe/Andorra":"AD","Asia/Dubai":"AE","Asia/Kabul":"AF","America/Antigua":"AG","America/Anguilla":"AI","Europe/Tirane":"AL","Asia/Yerevan":"AM","Africa/Luanda":"AO","Antarctica/McMurdo":"AQ","Antarctica/Casey":"AQ","Antarctica/Davis":"AQ","Antarctica/DumontDUrville":"AQ","Antarctica/Mawson":"AQ","Antarctica/Palmer":"AQ","Antarctica/Rothera":"AQ","Antarctica/Syowa":"AQ","Antarctica/Troll":"AQ","Antarctica/Vostok":"AQ","America/Argentina/Buenos_Aires":"AR","America/Argentina/Cordoba":"AR","America/Argentina/Salta":"AR","America/Argentina/Jujuy":"AR","America/Argentina/Tucuman":"AR","America/Argentina/Catamarca":"AR","America/Argentina/La_Rioja":"AR","America/Argentina/San_Juan":"AR","America/Argentina/Mendoza":"AR","America/Argentina/San_Luis":"AR","America/Argentina/Rio_Gallegos":"AR","America/Argentina/Ushuaia":"AR","Pacific/Pago_Pago":"AS","Europe/Vienna":"AT","Australia/Lord_Howe":"AU","Antarctica/Macquarie":"AU","Australia/Hobart":"AU","Australia/Melbourne":"AU","Australia/Sydney":"AU","Australia/Broken_Hill":"AU","Australia/Brisbane":"AU","Australia/Lindeman":"AU","Australia/Adelaide":"AU","Australia/Darwin":"AU","Australia/Perth":"AU","Australia/Eucla":"AU","America/Aruba":"AW","Europe/Mariehamn":"AX","Asia/Baku":"AZ","Europe/Sarajevo":"BA","America/Barbados":"BB","Asia/Dhaka":"BD","Europe/Brussels":"BE","Africa/Ouagadougou":"BF","Europe/Sofia":"BG","Asia/Bahrain":"BH","Africa/Bujumbura":"BI","Africa/Porto-Novo":"BJ","America/St_Barthelemy":"BL","Atlantic/Bermuda":"BM","Asia/Brunei":"BN","America/La_Paz":"BO","America/Kralendijk":"BQ","America/Noronha":"BR","America/Belem":"BR","America/Fortaleza":"BR","America/Recife":"BR","America/Araguaina":"BR","America/Maceio":"BR","America/Bahia":"BR","America/Sao_Paulo":"BR","America/Campo_Grande":"BR","America/Cuiaba":"BR","America/Santarem":"BR","America/Porto_Velho":"BR","America/Boa_Vista":"BR","America/Manaus":"BR","America/Eirunepe":"BR","America/Rio_Branco":"BR","America/Nassau":"BS","Asia/Thimphu":"BT","Africa/Gaborone":"BW","Europe/Minsk":"BY","America/Belize":"BZ","America/St_Johns":"CA","America/Halifax":"CA","America/Glace_Bay":"CA","America/Moncton":"CA","America/Goose_Bay":"CA","America/Blanc-Sablon":"CA","America/Toronto":"CA","America/Iqaluit":"CA","America/Atikokan":"CA","America/Winnipeg":"CA","America/Resolute":"CA","America/Rankin_Inlet":"CA","America/Regina":"CA","America/Swift_Current":"CA","America/Edmonton":"CA","America/Cambridge_Bay":"CA","America/Inuvik":"CA","America/Vancouver":"CA","America/Creston":"CA","America/Dawson_Creek":"CA","America/Fort_Nelson":"CA","America/Whitehorse":"CA","America/Dawson":"CA","Indian/Cocos":"CC","Africa/Kinshasa":"CD","Africa/Lubumbashi":"CD","Africa/Bangui":"CF","Africa/Brazzaville":"CG","Europe/Zurich":"CH","Africa/Abidjan":"CI","Pacific/Rarotonga":"CK","America/Santiago":"CL","America/Coyhaique":"CL","America/Punta_Arenas":"CL","Pacific/Easter":"CL","Africa/Douala":"CM","Asia/Shanghai":"CN","Asia/Urumqi":"CN","America/Bogota":"CO","America/Costa_Rica":"CR","America/Havana":"CU","Atlantic/Cape_Verde":"CV","America/Curacao":"CW","Indian/Christmas":"CX","Asia/Nicosia":"CY","Asia/Famagusta":"CY","Europe/Prague":"CZ","Europe/Berlin":"DE","Europe/Busingen":"DE","Africa/Djibouti":"DJ","Europe/Copenhagen":"DK","America/Dominica":"DM","America/Santo_Domingo":"DO","Africa/Algiers":"DZ","America/Guayaquil":"EC","Pacific/Galapagos":"EC","Europe/Tallinn":"EE","Africa/Cairo":"EG","Africa/El_Aaiun":"EH","Africa/Asmara":"ER","Europe/Madrid":"ES","Africa/Ceuta":"ES","Atlantic/Canary":"ES","Africa/Addis_Ababa":"ET","Europe/Helsinki":"FI","Pacific/Fiji":"FJ","Atlantic/Stanley":"FK","Pacific/Chuuk":"FM","Pacific/Pohnpei":"FM","Pacific/Kosrae":"FM","Atlantic/Faroe":"FO","Europe/Paris":"FR","Africa/Libreville":"GA","Europe/London":"GB","America/Grenada":"GD","Asia/Tbilisi":"GE","America/Cayenne":"GF","Europe/Guernsey":"GG","Africa/Accra":"GH","Europe/Gibraltar":"GI","America/Nuuk":"GL","America/Danmarkshavn":"GL","America/Scoresbysund":"GL","America/Thule":"GL","Africa/Banjul":"GM","Africa/Conakry":"GN","America/Guadeloupe":"GP","Africa/Malabo":"GQ","Europe/Athens":"GR","Atlantic/South_Georgia":"GS","America/Guatemala":"GT","Pacific/Guam":"GU","Africa/Bissau":"GW","America/Guyana":"GY","Asia/Hong_Kong":"HK","America/Tegucigalpa":"HN","Europe/Zagreb":"HR","America/Port-au-Prince":"HT","Europe/Budapest":"HU","Asia/Jakarta":"ID","Asia/Pontianak":"ID","Asia/Makassar":"ID","Asia/Jayapura":"ID","Europe/Dublin":"IE","Asia/Jerusalem":"IL","Europe/Isle_of_Man":"IM","Asia/Kolkata":"IN","Indian/Chagos":"IO","Asia/Baghdad":"IQ","Asia/Tehran":"IR","Atlantic/Reykjavik":"IS","Europe/Rome":"IT","Europe/Jersey":"JE","America/Jamaica":"JM","Asia/Amman":"JO","Asia/Tokyo":"JP","Africa/Nairobi":"KE","Asia/Bishkek":"KG","Asia/Phnom_Penh":"KH","Pacific/Tarawa":"KI","Pacific/Kanton":"KI","Pacific/Kiritimati":"KI","Indian/Comoro":"KM","America/St_Kitts":"KN","Asia/Pyongyang":"KP","Asia/Seoul":"KR","Asia/Kuwait":"KW","America/Cayman":"KY","Asia/Almaty":"KZ","Asia/Qyzylorda":"KZ","Asia/Qostanay":"KZ","Asia/Aqtobe":"KZ","Asia/Aqtau":"KZ","Asia/Atyrau":"KZ","Asia/Oral":"KZ","Asia/Vientiane":"LA","Asia/Beirut":"LB","America/St_Lucia":"LC","Europe/Vaduz":"LI","Asia/Colombo":"LK","Africa/Monrovia":"LR","Africa/Maseru":"LS","Europe/Vilnius":"LT","Europe/Luxembourg":"LU","Europe/Riga":"LV","Africa/Tripoli":"LY","Africa/Casablanca":"MA","Europe/Monaco":"MC","Europe/Chisinau":"MD","Europe/Podgorica":"ME","America/Marigot":"MF","Indian/Antananarivo":"MG","Pacific/Majuro":"MH","Pacific/Kwajalein":"MH","Europe/Skopje":"MK","Africa/Bamako":"ML","Asia/Yangon":"MM","Asia/Ulaanbaatar":"MN","Asia/Hovd":"MN","Asia/Macau":"MO","Pacific/Saipan":"MP","America/Martinique":"MQ","Africa/Nouakchott":"MR","America/Montserrat":"MS","Europe/Malta":"MT","Indian/Mauritius":"MU","Indian/Maldives":"MV","Africa/Blantyre":"MW","America/Mexico_City":"MX","America/Cancun":"MX","America/Merida":"MX","America/Monterrey":"MX","America/Matamoros":"MX","America/Chihuahua":"MX","America/Ciudad_Juarez":"MX","America/Ojinaga":"MX","America/Mazatlan":"MX","America/Bahia_Banderas":"MX","America/Hermosillo":"MX","America/Tijuana":"MX","Asia/Kuala_Lumpur":"MY","Asia/Kuching":"MY","Africa/Maputo":"MZ","Africa/Windhoek":"NA","Pacific/Noumea":"NC","Africa/Niamey":"NE","Pacific/Norfolk":"NF","Africa/Lagos":"NG","America/Managua":"NI","Europe/Amsterdam":"NL","Europe/Oslo":"NO","Asia/Kathmandu":"NP","Pacific/Nauru":"NR","Pacific/Niue":"NU","Pacific/Auckland":"NZ","Pacific/Chatham":"NZ","Asia/Muscat":"OM","America/Panama":"PA","America/Lima":"PE","Pacific/Tahiti":"PF","Pacific/Marquesas":"PF","Pacific/Gambier":"PF","Pacific/Port_Moresby":"PG","Pacific/Bougainville":"PG","Asia/Manila":"PH","Asia/Karachi":"PK","Europe/Warsaw":"PL","America/Miquelon":"PM","Pacific/Pitcairn":"PN","America/Puerto_Rico":"PR","Asia/Gaza":"PS","Asia/Hebron":"PS","Europe/Lisbon":"PT","Atlantic/Madeira":"PT","Atlantic/Azores":"PT","Pacific/Palau":"PW","America/Asuncion":"PY","Asia/Qatar":"QA","Indian/Reunion":"RE","Europe/Bucharest":"RO","Europe/Belgrade":"RS","Europe/Kaliningrad":"RU","Europe/Moscow":"RU","Europe/Simferopol":"UA","Europe/Kirov":"RU","Europe/Volgograd":"RU","Europe/Astrakhan":"RU","Europe/Saratov":"RU","Europe/Ulyanovsk":"RU","Europe/Samara":"RU","Asia/Yekaterinburg":"RU","Asia/Omsk":"RU","Asia/Novosibirsk":"RU","Asia/Barnaul":"RU","Asia/Tomsk":"RU","Asia/Novokuznetsk":"RU","Asia/Krasnoyarsk":"RU","Asia/Irkutsk":"RU","Asia/Chita":"RU","Asia/Yakutsk":"RU","Asia/Khandyga":"RU","Asia/Vladivostok":"RU","Asia/Ust-Nera":"RU","Asia/Magadan":"RU","Asia/Sakhalin":"RU","Asia/Srednekolymsk":"RU","Asia/Kamchatka":"RU","Asia/Anadyr":"RU","Africa/Kigali":"RW","Asia/Riyadh":"SA","Pacific/Guadalcanal":"SB","Indian/Mahe":"SC","Africa/Khartoum":"SD","Europe/Stockholm":"SE","Asia/Singapore":"SG","Atlantic/St_Helena":"SH","Europe/Ljubljana":"SI","Arctic/Longyearbyen":"SJ","Europe/Bratislava":"SK","Africa/Freetown":"SL","Europe/San_Marino":"SM","Africa/Dakar":"SN","Africa/Mogadishu":"SO","America/Paramaribo":"SR","Africa/Juba":"SS","Africa/Sao_Tome":"ST","America/El_Salvador":"SV","America/Lower_Princes":"SX","Asia/Damascus":"SY","Africa/Mbabane":"SZ","America/Grand_Turk":"TC","Africa/Ndjamena":"TD","Indian/Kerguelen":"TF","Africa/Lome":"TG","Asia/Bangkok":"TH","Asia/Dushanbe":"TJ","Pacific/Fakaofo":"TK","Asia/Dili":"TL","Asia/Ashgabat":"TM","Africa/Tunis":"TN","Pacific/Tongatapu":"TO","Europe/Istanbul":"TR","America/Port_of_Spain":"TT","Pacific/Funafuti":"TV","Asia/Taipei":"TW","Africa/Dar_es_Salaam":"TZ","Europe/Kyiv":"UA","Africa/Kampala":"UG","Pacific/Midway":"UM","Pacific/Wake":"UM","America/New_York":"US","America/Detroit":"US","America/Kentucky/Louisville":"US","America/Kentucky/Monticello":"US","America/Indiana/Indianapolis":"US","America/Indiana/Vincennes":"US","America/Indiana/Winamac":"US","America/Indiana/Marengo":"US","America/Indiana/Petersburg":"US","America/Indiana/Vevay":"US","America/Chicago":"US","America/Indiana/Tell_City":"US","America/Indiana/Knox":"US","America/Menominee":"US","America/North_Dakota/Center":"US","America/North_Dakota/New_Salem":"US","America/North_Dakota/Beulah":"US","America/Denver":"US","America/Boise":"US","America/Phoenix":"US","America/Los_Angeles":"US","America/Anchorage":"US","America/Juneau":"US","America/Sitka":"US","America/Metlakatla":"US","America/Yakutat":"US","America/Nome":"US","America/Adak":"US","Pacific/Honolulu":"US","America/Montevideo":"UY","Asia/Samarkand":"UZ","Asia/Tashkent":"UZ","Europe/Vatican":"VA","America/St_Vincent":"VC","America/Caracas":"VE","America/Tortola":"VG","America/St_Thomas":"VI","Asia/Ho_Chi_Minh":"VN","Pacific/Efate":"VU","Pacific/Wallis":"WF","Pacific/Apia":"WS","Asia/Aden":"YE","Indian/Mayotte":"YT","Africa/Johannesburg":"ZA","Africa/Lusaka":"ZM","Africa/Harare":"ZW"};
const ZONE_ALIASES = {'Asia/Calcutta':'Asia/Kolkata','Europe/Kiev':'Europe/Kyiv','America/Godthab':'America/Nuuk'};
function zoneCountry(zone) { return ZONE_COUNTRIES[zone] || ZONE_COUNTRIES[ZONE_ALIASES[zone]] || null; }
let cachedZoneOptions;
export function timeZoneOptions(selected = deviceTimeZone()) {
  if (cachedZoneOptions) return cachedZoneOptions.includes(selected) ? cachedZoneOptions : [selected, ...cachedZoneOptions].filter(validTimeZone);
  const available = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone') : Object.keys(ZONE_COUNTRIES);
  cachedZoneOptions = [...new Set([APP.timeZone, ...available, ...Object.keys(ZONE_COUNTRIES)])]
    .filter(zone => zoneCountry(zone) && validTimeZone(zone));
  return cachedZoneOptions.includes(selected) ? cachedZoneOptions : [selected, ...cachedZoneOptions].filter(validTimeZone);
}
const CITY_NAMES = {
  'America/New_York': ['뉴욕', 'New York'],
  'America/Chicago': ['시카고', 'Chicago'],
  'America/Denver': ['덴버', 'Denver'],
  'America/Los_Angeles': ['로스앤젤레스', 'Los Angeles'],
  'America/Phoenix': ['피닉스', 'Phoenix'],
  'America/Anchorage': ['앵커리지', 'Anchorage'],
  'Pacific/Honolulu': ['호놀룰루', 'Honolulu'],
  'America/Toronto': ['토론토', 'Toronto'],
  'America/Vancouver': ['밴쿠버', 'Vancouver'],
  'Australia/Sydney': ['시드니', 'Sydney'],
  'Australia/Melbourne': ['멜버른', 'Melbourne'],
  'Australia/Perth': ['퍼스', 'Perth'],
  'America/Sao_Paulo': ['상파울루', 'São Paulo'],
  'America/Mexico_City': ['멕시코시티', 'Mexico City'],
  'Asia/Jakarta': ['자카르타', 'Jakarta'],
};


function zoneCity(zone, lang) {
  return CITY_NAMES[zone]?.[lang === 'en' ? 1 : 0] || zone.split('/').at(-1).replaceAll('_', ' ');
}
export function timeZoneGroups(selected = deviceTimeZone(), lang = 'ko') {
  const locale = lang === 'en' ? 'en' : 'ko';
  const display = new Intl.DisplayNames([locale], {type:'region'});
  const groups = new Map();
  for (const zone of timeZoneOptions(selected)) {
    const country = zoneCountry(zone);
    if (!groups.has(country)) groups.set(country, []);
    groups.get(country).push(zone);
  }
  const first = zoneCountry(selected);
  return [...groups].sort(([a],[b]) => a === first ? -1 : b === first ? 1 : display.of(a).localeCompare(display.of(b), locale))
    .map(([country,zones]) => ({
      label: display.of(country),
      options: zones.sort((a,b) => a === selected ? -1 : b === selected ? 1 : zoneCity(a,lang).localeCompare(zoneCity(b,lang),locale))
        .map(zone => ({value:zone, label: zones.length > 1 ? zoneCity(zone,lang) : display.of(country)}))
    }));
}
export function timeZoneLabel(zone, lang = 'ko') {
  if (zone === 'UTC' || zone === 'Etc/UTC') return 'UTC';
  const country = zoneCountry(zone);
  if (!country) return zone.split('/').at(-1).replaceAll('_', ' ');
  const name = new Intl.DisplayNames([lang === 'en' ? 'en' : 'ko'], {type:'region'}).of(country);
  const multi = Object.values(ZONE_COUNTRIES).filter(code => code === country).length > 1;
  return multi ? name + ' · ' + zoneCity(zone,lang) : name;
}

const COUNTRY_SEARCH_ALIASES = { US: ['usa', 'u.s.a', 'us', 'america', 'united states', '미국'], GB: ['uk', 'britain', 'great britain', '영국'], KR: ['korea', 'south korea', '대한민국', '한국'], JP: ['japan', '일본'], AU: ['australia', '호주'], CA: ['canada', '캐나다'] };
export function searchTimeZoneGroups(selected, lang, search) {
  const query = String(search || '').trim().toLocaleLowerCase();
  const groups = timeZoneGroups(selected, lang);
  if (!query) return groups.filter(group => group.options.some(option => option.value === selected));
  const en = new Intl.DisplayNames(['en'], { type: 'region' });
  const ko = new Intl.DisplayNames(['ko'], { type: 'region' });
  const starts = (text) => String(text).toLocaleLowerCase().split(/[\\s/_-]+/).some(word => word.startsWith(query));
  return groups.map(group => ({
    ...group,
    options: group.options.filter(option => {
      const country = zoneCountry(option.value);
      const aliases = COUNTRY_SEARCH_ALIASES[country] || [];
      const countryMatch = [en.of(country), ko.of(country), country, ...aliases].some(name => name.toLocaleLowerCase() === query || starts(name));
      const cityMatch = [zoneCity(option.value, 'ko'), zoneCity(option.value, 'en'), option.value.split('/').at(-1)].some(starts);
      return countryMatch || cityMatch;
    }),
  })).filter(group => group.options.length);
}
