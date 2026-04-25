const { connectAdminMongoDB } = require('./src/config/database');
const AdminUser = require('./src/models/AdminUser');

async function seedDatabase() {
  try {
    // Connect to admin MongoDB
    const adminConnection = await connectAdminMongoDB();
    console.log('Admin MongoDB connected');

    // Create default admin user
    const existingAdmin = await AdminUser.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const adminUser = new AdminUser({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'SuperAdmin',
        status: 'active'
      });

      await adminUser.save();
      console.log('✅ Default admin created!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
