import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-leads';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Sales User',
    email: 'sales@demo.com',
    password: 'password123',
    role: 'sales',
  },
];

const leadNames = [
  'Rahul Sharma', 'Priya Patel', 'Arjun Singh', 'Sneha Verma', 'Vikram Nair',
  'Ananya Mehta', 'Rohan Kapoor', 'Neha Joshi', 'Karan Malhotra', 'Divya Gupta',
  'Siddharth Rao', 'Pooja Reddy', 'Aman Kumar', 'Riya Agarwal', 'Nikhil Bansal',
];

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'];
const sources = ['Website', 'Instagram', 'Referral'];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Cleared existing data');

    // Create users
    const userDocs = await Promise.all(
      seedUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(u.password, salt);
        return mongoose.connection.collection('users').insertOne({
          name: u.name,
          email: u.email,
          password: hashed,
          role: u.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      })
    );
    console.log(`👤 Created ${userDocs.length} users`);

    // Get inserted user IDs
    const adminId = userDocs[0].insertedId;
    const salesId = userDocs[1].insertedId;

    // Create leads
    const leads = leadNames.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      status: statuses[i % statuses.length],
      source: sources[i % sources.length],
      notes: i % 3 === 0 ? `Interested in premium plan. Follow up on ${new Date(Date.now() + i * 86400000).toLocaleDateString()}` : undefined,
      createdBy: i % 2 === 0 ? adminId : salesId,
      createdAt: new Date(Date.now() - (leadNames.length - i) * 86400000 * 2),
      updatedAt: new Date(),
    }));

    await mongoose.connection.collection('leads').insertMany(leads);
    console.log(`📋 Created ${leads.length} leads`);

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────');
    console.log('Demo credentials:');
    console.log('  Admin → admin@demo.com / password123');
    console.log('  Sales → sales@demo.com / password123');
    console.log('─────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
