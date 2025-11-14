#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(PROJECT_ROOT, 'src/data');
const FILE_MAP = {
  trips: 'trips.json',
  places: 'places.json',
  rides: 'rides.json'
};

const args = process.argv.slice(2);
const countArg = args.find(arg => arg.startsWith('--count'));
const typeArg = args.find(arg => arg.startsWith('--type'));
let count = DEFAULT_COUNT;
let dataType = 'trips';

if (countArg) {
  const [, value] = countArg.split('=');
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

if (typeArg) {
  const [, value] = typeArg.split('=');
  if (value && FILE_MAP[value]) {
    dataType = value;
  }
}

const rideOptions = [
  { name: 'AutoDriverX', image: '/car1.jpg', icon: 'https://ext.same-assets.com/407674263/3757967630.png', basePrice: 26.6 },
  { name: 'Comfort', image: '/car2.jpg', icon: 'https://ext.same-assets.com/407674263/2600779409.svg', basePrice: 31.5 },
  { name: 'AutoDriverXL', image: '/car3.jpg', icon: 'https://ext.same-assets.com/407674263/2882408466.svg', basePrice: 27.37 },
  { name: 'EcoRide', image: '/car4.jpg', icon: 'https://ext.same-assets.com/407674263/2010403157.png', basePrice: 23.1 },
  { name: 'Premier', image: '/car5.jpg', icon: 'https://ext.same-assets.com/407674263/2411776243.png', basePrice: 39.9 },
  { name: 'CityLux', image: '/car6.jpg', icon: 'https://ext.same-assets.com/407674263/1474040816.png', basePrice: 44.25 },
  { name: 'AirportExpress', image: '/car7.jpg', icon: 'https://ext.same-assets.com/407674263/2266033345.svg', basePrice: 36.2 }
];

const pickupLocations = [
  '100 Van Ness Ave, San Francisco, CA 94102',
  '1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105',
  'SFO International Airport, San Francisco, CA 94128',
  'Ferry Building, 1 Ferry Building, San Francisco, CA 94111',
  'LinkedIn HQ - 222 2nd St, San Francisco, CA 94105',
  'Golden Gate Park, San Francisco, CA 94117',
  'Chase Center, 1 Warriors Way, San Francisco, CA 94158',
  'Pier 39, Beach Street & The Embarcadero, San Francisco, CA 94133',
  'Oracle Park, 24 Willie Mays Plaza, San Francisco, CA 94107',
  'Palace of Fine Arts, 3601 Lyon St, San Francisco, CA 94123'
];

const dropoffLocations = [
  '1000 Chestnut St, San Francisco, CA 94109',
  'Salesforce Tower - 415 Mission St, San Francisco, CA 94105',
  'Union Square, San Francisco, CA 94108',
  'Mission Dolores Park, San Francisco, CA 94114',
  'Twin Peaks, San Francisco, CA 94131',
  'Moscone Center, 747 Howard St, San Francisco, CA 94103',
  'Exploratorium, Pier 15, San Francisco, CA 94111',
  'Ghirardelli Square, 900 North Point St, San Francisco, CA 94109',
  'Coit Tower, 1 Telegraph Hill Blvd, San Francisco, CA 94133',
  'The Castro Theatre, 429 Castro St, San Francisco, CA 94114'
];

const driverFirstNames = ['Alexei', 'Maria', 'Samir', 'Priya', 'Liam', 'Sofia', 'Noah', 'Olivia', 'Isabella', 'Mateo', 'Chen', 'Haruto', 'Ava'];
const driverLastNames = ['Ivanov', 'Chen', 'Patel', 'Garcia', 'Lopez', 'Nguyen', 'Kim', 'Singh', 'Johnson', 'Khan', 'Martinez', 'Brown'];
const carModels = ['Toyota Camry', 'Honda Accord', 'Tesla Model 3', 'BMW 3 Series', 'Audi A4', 'Mercedes C-Class', 'Kia EV6', 'Hyundai Ioniq', 'Ford Mustang Mach-E'];
const carColors = ['Blue', 'White', 'Red', 'Black', 'Silver', 'Gray', 'Green'];
const paymentMethods = ['Visa ••••1270', 'Visa ••••8899', 'Mastercard ••••4432', 'Amex ••••0025', 'Discover ••••6621'];
const statuses = ['upcoming', 'completed', 'cancelled'];

const placeCategories = ['hotel', 'landmark', 'airport', 'office', 'residential', 'restaurant'];
const placeMainNames = [
  'Hotel Zephyr',
  'Hotel Vitale',
  'The Marker San Francisco',
  'Parc 55 San Francisco',
  'Hilton San Francisco Union Square',
  'Fairmont San Francisco',
  'The Westin St. Francis',
  'Golden Gate Park',
  'Union Square Plaza',
  'LinkedIn Headquarters',
  'Salesforce Tower',
  'Chase Center',
  'Mission Dolores Park'
];
const streetNames = ['Mission St', 'Market St', 'Howard St', 'Folsom St', 'Geary St', 'Post St', 'Van Ness Ave', 'Chestnut St', 'California St', 'Taylor St'];

const rideNames = ['AutoDriver', 'Comfort', 'AutoDriverXL', 'EcoRide', 'Premier', 'CityLux', 'NightOwl', 'RapidGo', 'FamilyXL', 'PetRide', 'VIP Select'];

function dataPath(type) {
  return path.resolve(DATA_DIR, FILE_MAP[type]);
}

function loadData(type) {
  const p = dataPath(type);
  if (!fs.existsSync(p)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error reading ${p}:`, error.message);
    return [];
  }
}

function saveData(type, data) {
  fs.writeFileSync(dataPath(type), `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, digits = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function generateDriver() {
  const first = randomFrom(driverFirstNames);
  const last = randomFrom(driverLastNames);
  const name = `${first} ${last}`;
  const car = `${randomFrom(carModels)} (${randomFrom(carColors)})`;
  const plate = `${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))} ${randomInt(100, 999)}`;
  const phone = `+1 ${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
  const gender = Math.random() > 0.5 ? 'men' : 'women';
  const photo = `https://randomuser.me/api/portraits/${gender}/${randomInt(1, 99)}.jpg`;
  return { name, car, plate, phone, photo };
}

function generateTrips(existingTrips, count) {
  const existingIds = new Set(existingTrips.map(t => (t.id || '').toLowerCase()));
  let nextId = existingTrips.length > 0 ? Math.max(...existingTrips.map(t => {
    const match = (t.id || '').match(/^(\d+)$/);
    return match ? Number.parseInt(match[1], 10) : 0;
  })) + 1 : 1;

  const newTrips = [];
  let attempts = 0;
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-12-31');

  while (newTrips.length < count && attempts < count * 20) {
    const id = String(nextId);
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const rideOption = randomFrom(rideOptions);
    const ridePrice = Number((rideOption.basePrice * (0.85 + Math.random() * 0.4)).toFixed(2));
    const date = randomDate(startDate, endDate);
    date.setHours(randomInt(5, 22), randomFrom([0, 15, 30, 45]));

    const pickup = randomFrom(pickupLocations);
    let dropoff = randomFrom(dropoffLocations);
    let attemptsDrop = 0;
    while (dropoff === pickup && attemptsDrop < 5) {
      dropoff = randomFrom(dropoffLocations);
      attemptsDrop += 1;
    }

    const trip = {
      id,
      status: randomFrom(statuses),
      ride: {
        name: rideOption.name,
        image: rideOption.image,
        icon: rideOption.icon,
        price: ridePrice
      },
      pickup,
      dropoff,
      date: formatDate(date),
      time: formatTime(date),
      price: ridePrice,
      payment: randomFrom(paymentMethods),
      driver: generateDriver()
    };

    existingIds.add(id.toLowerCase());
    newTrips.push(trip);
    nextId += 1;
    attempts += 1;
  }

  return newTrips;
}

function generatePlaces(existingPlaces, count) {
  const existingIds = new Set(existingPlaces.map(p => p.id));
  let nextId = existingPlaces.reduce((max, place) => Math.max(max, Number(place.id?.replace(/\\D/g, '')) || 0), 0) + 1;
  const existingLabels = new Set(existingPlaces.map(p => p.label.toLowerCase()));
  const results = [];

  while (results.length < count) {
    const main = randomFrom(placeMainNames);
    const street = `${randomInt(100, 999)} ${randomFrom(streetNames)}`;
    const address = `${street}, San Francisco, CA 94${randomInt(100, 199)}`;
    const label = `${main} - ${address}`;
    if (existingLabels.has(label.toLowerCase())) continue;

    const place = {
      id: `pl${nextId++}`,
      label,
      main,
      sub: address,
      category: randomFrom(placeCategories),
      latitude: Number((37.75 + Math.random() * 0.12).toFixed(6)),
      longitude: Number((-122.52 + Math.random() * 0.2).toFixed(6))
    };

    existingLabels.add(label.toLowerCase());
    existingIds.add(place.id);
    results.push(place);
  }

  return results;
}

function generateRides(existingRides, count) {
  const existingIds = new Set(existingRides.map(r => r.id));
  let nextId = existingRides.reduce((max, ride) => Math.max(max, Number(ride.id?.replace(/\\D/g, '')) || 0), 0) + 1;
  const existingNames = new Set(existingRides.map(r => r.name.toLowerCase()));
  const results = [];

  while (results.length < count) {
    const baseName = randomFrom(rideNames);
    const suffix = Math.random() > 0.7 ? randomFrom(['X', 'XL', 'Plus', 'Prime', 'Flex']) : '';
    let name = suffix ? `${baseName} ${suffix}` : baseName;
    
    // Add numerical variation if name already exists
    let nameAttempt = 0;
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      const variation = randomInt(1, 999);
      name = suffix ? `${baseName} ${suffix} ${variation}` : `${baseName} ${variation}`;
      nameAttempt += 1;
    }
    if (existingNames.has(name.toLowerCase())) {
      name = suffix ? `${baseName} ${suffix} ${randomInt(1000, 9999)}` : `${baseName} ${randomInt(1000, 9999)}`;
    }
    const basePrice = randomFloat(18, 55);
    const oldPrice = Number((basePrice * (1.05 + Math.random() * 0.25)).toFixed(2));
    const ride = {
      id: `r${nextId++}`,
      name,
      image: `/car${randomInt(1, 7)}.jpg`,
      icon: randomFrom([
        'https://ext.same-assets.com/407674263/3757967630.png',
        'https://ext.same-assets.com/407674263/2600779409.svg',
        'https://ext.same-assets.com/407674263/2882408466.svg',
        'https://ext.same-assets.com/407674263/2010403157.png',
        'https://ext.same-assets.com/407674263/2411776243.png'
      ]),
      price: basePrice,
      oldPrice,
      seats: randomInt(3, 6),
      eta: `${randomInt(2, 8)} min away`,
      desc: randomFrom([
        'Comfortable ride with pro drivers',
        'Spacious ride for groups',
        'Eco-friendly hybrid fleet',
        'Premium leather interior',
        'Pet-friendly vehicles'
      ]),
      recommended: Math.random() > 0.8,
      waitTime: `< ${randomInt(5, 12)} min`,
      perMile: randomFloat(1.1, 2.0),
      perMinute: randomFloat(0.35, 0.85),
      features: [
        'Climate control',
        randomFrom(['Wi-Fi', 'Bottled water', 'Phone chargers', 'Quiet ride'])
      ]
    };

    existingNames.add(name.toLowerCase());
    existingIds.add(ride.id);
    results.push(ride);
  }

  return results;
}

function main() {
  const current = loadData(dataType);
  let newEntries = [];

  switch (dataType) {
    case 'trips':
      newEntries = generateTrips(current, count);
      break;
    case 'places':
      newEntries = generatePlaces(current, count);
      break;
    case 'rides':
      newEntries = generateRides(current, count);
      break;
    default:
      console.error(`Unsupported type: ${dataType}`);
      process.exit(1);
  }

  if (newEntries.length === 0) {
    console.warn('No new data generated.');
    return;
  }

  const updated = [...current, ...newEntries];
  saveData(dataType, updated);
  console.log(`Added ${newEntries.length} ${dataType} entries to ${FILE_MAP[dataType]}`);
}

main();
