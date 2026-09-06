const bcrypt = require('bcryptjs');
const { connectDB, getMongoStatus } = require('../config/db');
const User = require('../models/User');
const Slot = require('../models/Slot');
const PlateLog = require('../models/PlateLog');
const { initialSlots, initialPlateLogs } = require('./seedData');
const store = require('./store');

async function seedDatabase() {
  await connectDB();
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  const defaultAdmin = {
    name: 'SmartPark System Admin',
    email: 'admin@smartpark.ai',
    password: adminPassword,
    role: 'admin',
    vehicleNumber: 'KA-01-SP-0001',
    phone: '+91 98765 43210',
    isEvUser: false
  };

  const defaultUser = {
    name: 'Gnanan Sai',
    email: 'user@smartpark.ai',
    password: userPassword,
    role: 'user',
    vehicleNumber: 'KA-05-EV-2026',
    phone: '+91 91234 56789',
    isEvUser: true
  };

  if (getMongoStatus()) {
    console.log('[Seed] Seeding MongoDB database...');
    // Upsert admin
    await User.findOneAndUpdate({ email: defaultAdmin.email }, defaultAdmin, { upsert: true, new: true });
    // Upsert user
    await User.findOneAndUpdate({ email: defaultUser.email }, defaultUser, { upsert: true, new: true });

    // Seed slots
    for (const slot of initialSlots) {
      await Slot.findOneAndUpdate({ slotNumber: slot.slotNumber }, slot, { upsert: true, new: true });
    }

    // Seed plate logs
    for (const log of initialPlateLogs) {
      await PlateLog.findOneAndUpdate({ logId: log.logId }, log, { upsert: true, new: true });
    }
    console.log('[Seed] MongoDB seeded successfully!');
  } else {
    console.log('[Seed] Seeding JSON store...');
    const existingAdmin = await store.getUserByEmail(defaultAdmin.email);
    if (!existingAdmin) {
      await store.createUser(defaultAdmin);
    }
    const existingUser = await store.getUserByEmail(defaultUser.email);
    if (!existingUser) {
      await store.createUser(defaultUser);
    }
    console.log('[Seed] JSON store seeded successfully!');
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seed completed.');
    process.exit(0);
  });
}

module.exports = seedDatabase;
