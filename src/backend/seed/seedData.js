const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Disruption = require('../models/Disruption');
const Route = require('../models/Route');
const Carrier = require('../models/Carrier');
const Fleet = require('../models/Fleet');
const TemperatureLog = require('../models/TemperatureLog');
const RecoveryPlan = require('../models/RecoveryPlan');

async function runSeed() {
  console.log('Seeding database...');
  // Clear existing data
  await User.deleteMany({});
  await Shipment.deleteMany({});
  await Disruption.deleteMany({});
  await Route.deleteMany({});
  await Carrier.deleteMany({});
  await Fleet.deleteMany({});
  await TemperatureLog.deleteMany({});
  await RecoveryPlan.deleteMany({});

  console.log('Cleared existing data.');

  // 1. Create User
  await User.create({
    name: 'Operations Manager',
    email: 'ops@supplyshield.ai',
    password: 'password123',
    role: 'operations_manager'
  });

  // 2. Create Carriers
  const carriers = await Carrier.insertMany([
    { carrierId: 'CAR-01', name: 'Oceanic Freight', reliabilityScore: 85, availableCapacity: 500, costIndex: 2 },
    { carrierId: 'CAR-02', name: 'Global Logistics', reliabilityScore: 92, availableCapacity: 120, costIndex: 4 },
    { carrierId: 'CAR-03', name: 'FastTrack Air', reliabilityScore: 98, availableCapacity: 50, costIndex: 5 },
    { carrierId: 'CAR-04', name: 'Continental Rail', reliabilityScore: 75, availableCapacity: 800, costIndex: 1 }
  ]);

  // 3. Create Routes
  const routes = await Route.insertMany([
    { routeId: 'R-SEA-101', origin: 'Singapore', destination: 'Rotterdam', distanceKm: 15000, estimatedDurationHours: 720, riskLevel: 'Medium', disruptionExposure: true },
    { routeId: 'R-SEA-102', origin: 'Mumbai', destination: 'Dubai', distanceKm: 2000, estimatedDurationHours: 120, riskLevel: 'Low', disruptionExposure: false },
    { routeId: 'R-AIR-201', origin: 'Shanghai', destination: 'Frankfurt', distanceKm: 9000, estimatedDurationHours: 14, riskLevel: 'Low', disruptionExposure: false },
    { routeId: 'R-LND-301', origin: 'Berlin', destination: 'Paris', distanceKm: 1000, estimatedDurationHours: 12, riskLevel: 'Low', disruptionExposure: false },
    { routeId: 'R-SEA-101-ALT', origin: 'Singapore', destination: 'Rotterdam (via Cape)', distanceKm: 21000, estimatedDurationHours: 1000, riskLevel: 'Low', disruptionExposure: false }
  ]);

  // Update alternative routes
  await Route.updateOne({ routeId: 'R-SEA-101' }, { $set: { alternativeRouteIds: ['R-SEA-101-ALT', 'R-AIR-201'] }});

  // 4. Create Fleet
  const fleet = await Fleet.insertMany([
    { vehicleId: 'TRK-001', vehicleType: 'Reefer Truck', capacity: 20, currentLocation: 'Rotterdam', status: 'Available', temperatureControlled: true },
    { vehicleId: 'TRK-002', vehicleType: 'Standard Truck', capacity: 30, currentLocation: 'Berlin', status: 'In Transit', temperatureControlled: false },
    { vehicleId: 'TRK-003', vehicleType: 'Reefer Van', capacity: 5, currentLocation: 'Paris', status: 'Available', temperatureControlled: true },
    { vehicleId: 'TRK-004', vehicleType: 'Heavy Flatbed', capacity: 40, currentLocation: 'Singapore', status: 'Maintenance', temperatureControlled: false }
  ]);

  // 5. Create Disruptions
  const disruptions = await Disruption.insertMany([
    {
      disruptionId: 'D-2026-001',
      title: 'Suez Canal Blockage',
      type: 'Port Closure',
      description: 'A major vessel has run aground, blocking all traffic.',
      severity: 'Critical',
      location: 'Suez Canal, Egypt',
      startTime: new Date(),
      estimatedDurationHours: 168,
      status: 'Active',
      affectedRouteIds: ['R-SEA-101']
    },
    {
      disruptionId: 'D-2026-002',
      title: 'Severe Snowstorm',
      type: 'Weather',
      description: 'Heavy snow affecting central Europe highways.',
      severity: 'High',
      location: 'Germany/France Border',
      startTime: new Date(),
      estimatedDurationHours: 48,
      status: 'Active',
      affectedRouteIds: ['R-LND-301']
    }
  ]);

  // 6. Create Shipments
  const now = new Date();
  const shipments = await Shipment.insertMany([
    {
      shipmentId: 'SHP-1024',
      customer: 'PharmaCorp Inc.',
      cargoType: 'Vaccines',
      cargoValue: 5000000,
      priority: 'Critical',
      origin: 'Singapore',
      destination: 'Rotterdam',
      routeId: 'R-SEA-101',
      carrierId: 'CAR-01',
      status: 'In Transit',
      currentLocation: 'Indian Ocean',
      plannedETA: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      deliveryDeadline: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000), // very tight
      coldChainRequired: true,
      requiredTemperatureMin: 2,
      requiredTemperatureMax: 8
    },
    {
      shipmentId: 'SHP-2048',
      customer: 'TechGadgets LLC',
      cargoType: 'Electronics',
      cargoValue: 800000,
      priority: 'High',
      origin: 'Mumbai',
      destination: 'Dubai',
      routeId: 'R-SEA-102',
      carrierId: 'CAR-02',
      status: 'Booked',
      currentLocation: 'Mumbai Port',
      plannedETA: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      deliveryDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      coldChainRequired: false
    },
    {
      shipmentId: 'SHP-3096',
      customer: 'AutoParts Co.',
      cargoType: 'Engines',
      cargoValue: 250000,
      priority: 'Medium',
      origin: 'Berlin',
      destination: 'Paris',
      routeId: 'R-LND-301',
      carrierId: 'CAR-04',
      fleetId: 'TRK-002',
      status: 'Delayed',
      currentLocation: 'Stuttgart',
      plannedETA: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      deliveryDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      coldChainRequired: false
    }
  ]);

  // 7. Create Temperature Logs for Cold Chain Shipment
  await TemperatureLog.insertMany([
    { shipmentId: 'SHP-1024', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), temperature: 4.5, sensorStatus: 'Active' },
    { shipmentId: 'SHP-1024', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), temperature: 5.2, sensorStatus: 'Active' },
    { shipmentId: 'SHP-1024', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), temperature: 7.8, sensorStatus: 'Active' }, // getting warm
    { shipmentId: 'SHP-1024', timestamp: now, temperature: 9.1, sensorStatus: 'Faulty' }, // Excursion!
  ]);

  console.log('Seed completed successfully!');
}

// Allow running directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supplyshield';
  mongoose.connect(MONGODB_URI)
    .then(() => runSeed())
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { runSeed };
