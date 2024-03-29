import _ from 'lodash';
import $ from 'jquery';

function isSoarInstrument(instrumentType) {
  return _.toLower(instrumentType).includes('soar');
}

function lampFlatDefaultExposureTime(slitWidth, instrumentType, readoutMode) {
  // Lamp flats are affected by the slit width, so exposure time needs to scale with it
  readoutMode = _.toLower(readoutMode);
  slitWidth = _.toLower(slitWidth);
  if (isSoarInstrument(instrumentType)) {
    if (readoutMode.includes('400m1')) {
      return 3;
    } else if (readoutMode.includes('400m2')) {
      return 2;
    }
  } else {
    if (slitWidth.includes('1.2')) {
      return 70;
    } else if (slitWidth.includes('1.6')) {
      return 50;
    } else if (slitWidth.includes('2.0')) {
      return 40;
    } else if (slitWidth.includes('6.0')) {
      return 15;
    }
  }
  return 60;
}

function arcDefaultExposureTime(instrumentType) {
  if (isSoarInstrument(instrumentType)) {
    return 0.5;
  } else {
    return 60;
  }
}

function julianToModifiedJulian(jd) {
  if (jd && jd >= 2400000.5) {
    let precision = (jd + '').split('.')[1].length;
    return Number((parseFloat(jd) - 2400000.5).toFixed(precision));
  }
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = $.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

let datetimeFormat = 'YYYY-MM-DD HH:mm:ss';

const tooltipConfig = {
  delay: {
    show: 500,
    hide: 100
  },
  trigger: 'hover'
};

let siteToColor = {
  tfn: '#263c6f', // dark blue
  elp: '#700000', // dark red
  lsc: '#f04e23', // red-orange
  cpt: '#004f00', // dark green
  coj: '#fac900', // golden-yellow
  ogg: '#3366dd', // sky blue
  sqa: '#009d00', // green
  tlv: '#8150d7', // purple
  sor: '#7EF5C9', // sea green
  ngq: '#FA5DEB' // magenta
};

let siteCodeToName = {
  tfn: 'Teide',
  elp: 'McDonald',
  lsc: 'Cerro Tololo',
  cpt: 'Sutherland',
  coj: 'Siding Spring',
  ogg: 'Haleakala',
  sqa: 'Sedgwick',
  ngq: 'Ali',
  sor: 'Cerro Pachón',
  tlv: 'Wise'
};

let observatoryCodeToNumber = {
  doma: '1',
  domb: '2',
  domc: '3',
  clma: '',
  aqwa: '1',
  aqwb: '2'
};

let telescopeCodeToName = {
  '1m0a': '1m',
  '0m4a': '0.4m A',
  '0m4b': '0.4m B',
  '0m4c': '0.4m C',
  '2m0a': '2m',
  '4m0a': '4m',
  '0m8a': '0.8m'
};

let colorPalette = [
  // useful assigning colors to datasets.
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#3B3EAC',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#329262',
  '#5574A6',
  '#3B3EAC',
  '#FFFF00',
  '#1CE6FF',
  '#FF34FF',
  '#FF4A46',
  '#008941',
  '#006FA6',
  '#A30059',
  '#FFDBE5',
  '#7A4900',
  '#0000A6',
  '#63FFAC',
  '#B79762',
  '#004D43',
  '#8FB0FF',
  '#997D87',
  '#5A0007',
  '#809693',
  '#FEFFE6',
  '#1B4400',
  '#4FC601',
  '#61615A',
  '#BA0900',
  '#6B7900',
  '#00C2A0',
  '#FFAA92',
  '#FF90C9',
  '#B903AA',
  '#D16100',
  '#DDEFFF',
  '#000035',
  '#7B4F4B',
  '#A1C299',
  '#300018',
  '#0AA6D8',
  '#013349',
  '#00846F',
  '#372101',
  '#FFB500',
  '#C2FFED',
  '#A079BF',
  '#CC0744',
  '#C0B9B2',
  '#C2FF99',
  '#001E09',
  '#00489C',
  '#6F0062',
  '#0CBD66',
  '#EEC3FF',
  '#456D75',
  '#B77B68',
  '#7A87A1',
  '#788D66',
  '#885578',
  '#FAD09F',
  '#FF8A9A',
  '#D157A0',
  '#BEC459',
  '#456648',
  '#0086ED',
  '#886F4C',
  '#34362D',
  '#B4A8BD',
  '#00A6AA',
  '#452C2C',
  '#636375',
  '#A3C8C9',
  '#FF913F',
  '#938A81',
  '#575329',
  '#00FECF',
  '#B05B6F',
  '#8CD0FF',
  '#3B9700',
  '#04F757',
  '#C8A1A1',
  '#1E6E00',
  '#7900D7',
  '#A77500',
  '#6367A9',
  '#A05837',
  '#6B002C',
  '#772600',
  '#D790FF',
  '#9B9700',
  '#549E79',
  '#FFF69F',
  '#201625',
  '#72418F',
  '#BC23FF',
  '#99ADC0',
  '#3A2465',
  '#922329',
  '#5B4534',
  '#FDE8DC',
  '#404E55',
  '#0089A3',
  '#CB7E98',
  '#A4E804',
  '#324E72',
  '#6A3A4C',
  '#3B5DFF',
  '#4A3B53',
  '#FF2F80'
];

export {
  datetimeFormat,
  siteToColor,
  siteCodeToName,
  arcDefaultExposureTime,
  lampFlatDefaultExposureTime,
  observatoryCodeToNumber,
  telescopeCodeToName,
  colorPalette,
  julianToModifiedJulian,
  tooltipConfig,
  getCookie,
  csrfSafeMethod
};
