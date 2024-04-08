var GetCurrentPosition;
var WatchPosition;
var ClearWatch;
var CoordinatesTextArea;
var watchId;
var MapArea;
var googleMap;
var googleMaps_maps;
var googleMaps_marker;
var marker;

function show(text) {
  CoordinatesTextArea.value = text;
}

function getOptions() {
  var options = {};
  var radios = document.getElementsByName('maximumAge');
  for(var i = 0; i < radios.length; i++) {
    if(radios[i].checked) {
      switch(radios[i].value) {
        case 'gps':
          options.maximumAge = 0;
          break;
        case 'mixed':
          options.maximumAge = parseInt(document.getElementById('MaximumAgeMS').value);
          break;
        case 'cached':
          options.maximumAge = Infinity;
          break;
      }
    }
  }
  var radios = document.getElementsByName('timeout');
  for(var i = 0; i < radios.length; i++) {
    if(radios[i].checked) {
      switch(radios[i].value) {
        case 'never':
          options.timeout = Infinity;
          break;
        case 'limited':
          options.timeout = parseInt(document.getElementById('TimeoutMS').value);
          break;
      }
    }
  }
  var radios = document.getElementsByName('highAccuracy');
  for(var i = 0; i < radios.length; i++) {
    if(radios[i].checked) {
      options.enableHighAccuracy = radios[i].value === 'true';
    }
  }
  return options;
}
function handleGetCurrentPositionClick() {
  GetCurrentPosition.disabled = true;
  WatchPosition.disabled = true;
  show("Getting coordinates...");
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, getOptions());
}
function handleClearWatchClick() {
  show("Clearing watch...");
  navigator.geolocation.clearWatch(watchId);
  watchId = undefined;
  WatchPosition.disabled = false;
  GetCurrentPosition.disabled = false;
  ClearWatch.disabled = true;
  show("Ready to get coordinates.");
}
function handleWatchPositionClick() {
  show("Watching coordinates...");
  watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, getOptions());
  WatchPosition.disabled = true;
  GetCurrentPosition.disabled = true;
  ClearWatch.disabled = false;
}

function decimalDegreesToDegreesMinutesSeconds(dd) {
  var degrees = Math.floor(dd);
  var minutes = Math.floor((dd - degrees) * 60);
  var seconds = (((dd - degrees) * 60) - minutes) * 60;
 return `${degrees}\u00B0 ${minutes}' ${seconds}"`;
}

function metersToFeet(meters) {
  if(meters === null || meters === undefined) return '0 feet';
  return `${meters / 0.3048} feet`;
}

function metersPerSecondToMilesPerHour(meters) {
  if(meters === null || meters === undefined) return '0 miles per hour';
  var metersPerHour = meters * 3600;
  var feetPerHour = metersPerHour / 0.3048;
  return `${Math.floor((feetPerHour / 5280) * 100)/100} miles per hour`;
}

function degreesToCardinalDirection(degrees) {
  if(degrees === null || degrees === undefined) return 'Unknown direction';
  // var directions = 'NESW';
  // var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  var directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
  ];
  var size = 360 / directions.length;
  var offset = size / 2;
  degrees = degrees + offset;
  if(degrees >= 360) degrees = 0;
  var i = Math.floor(degrees / size);
  return directions[i];
}
function successHandler(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var accuracy = position.coords.accuracy;
  var altitude = position.coords.altitude;
  var altitudeAccuracy = position.coords.altitudeAccuracy;
  var heading = position.coords.heading;
  var altitude = position.coords.altitude;
  var speed = position.coords.speed;

  show(`Latitude: ${latitude} Decimal Degrees (${decimalDegreesToDegreesMinutesSeconds(latitude)})
Longitude: ${longitude} Decimal Degrees (${decimalDegreesToDegreesMinutesSeconds(longitude)})
Accuracy: ${accuracy} meters (${metersToFeet(accuracy)})
Altitude: ${altitude} meters (${metersToFeet(altitude)})
Altitude Accuracy: ${altitudeAccuracy} meters (${metersToFeet(altitudeAccuracy)})
Heading: ${heading} degrees (${degreesToCardinalDirection(heading)})
Speed: ${speed} meters per second (${metersPerSecondToMilesPerHour(speed)})
Timestamp: ${position.timestamp} (${new Date(position.timestamp).toLocaleString()})
`);

  var googlePosition = { 
    lat: latitude, 
    lng: longitude 
  };

  googleMap = new googleMaps_maps.Map(MapArea, {
    center: googlePosition,
    zoom: 14,
    mapId: "4504f8b37365c3d0",
  });
  marker = new googleMaps_marker.AdvancedMarkerElement({
    map: googleMap,
    position: googlePosition
  })

  if(!watchId) {
    GetCurrentPosition.disabled = false;
    WatchPosition.disabled = false;
  }
}

function errorHandler(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      show('Permission Deinied');
      break;
    case error.POSITION_UNAVAILABLE:
      show('Location unavailable');
      break;
    case error.TIMEOUT:
      show('Timed out');
      break;
    case error.UNKNOWN_ERROR:
      show('Unknow error')
      break;
    default:
      show('An error occurred');
      break;
  }
  if(!watchId) {
    GetCurrentPosition.disabled = false;
    WatchPosition.disabled = false;
  }
}

async function initMap() {
   googleMaps_maps = await google.maps.importLibrary("maps");
   googleMaps_marker = await google.maps.importLibrary("marker");
}

window.onload = function() {
  GetCurrentPosition = document.getElementById("GetCurrentPosition");
  WatchPosition = document.getElementById("WatchPosition");
  ClearWatch = document.getElementById("ClearWatch");
  CoordinatesTextArea = document.getElementById("CoordinatesTextArea");
  MapArea = document.getElementById("MapArea");

  if(!navigator.geolocation) {
    show("geolocation not supported.");
  } else {
    GetCurrentPosition.addEventListener("click", handleGetCurrentPositionClick);
    WatchPosition.addEventListener("click", handleWatchPositionClick);
    ClearWatch.addEventListener("click", handleClearWatchClick);
    show("Ready to get coordinates.");
  }
}
