const mongoose = require('mongoose');
require('dotenv').config();

const { createAdminUserModel } = require('./src/models/AdminUser');

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to Admin MongoDB...\n');

    // Use the same connection method as the app
    const AdminUser = await createAdminUserModel();

    console.log('✅ Connected to Admin MongoDB\n');

    // Check if admin exists
    let admin = await AdminUser.findOne({ email: 'admin@locaura.com' });

    if (admin) {
      console.log('✅ Admin user exists');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Status: ${admin.status}`);
    } else {
      console.log('❌ Admin user not found. Creating...\n');

      // Create new admin user
      const newAdmin = new AdminUser({
        name: 'Admin',
        email: 'admin@locaura.com',
        password: 'Admin@1234',
        role: 'SuperAdmin',
        status: 'active'
      });

      await newAdmin.save();

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: admin@locaura.com`);
      console.log(`   Password: Admin@1234`);
      console.log(`   Role: SuperAdmin`);
    }

    // Also list all users
    const allUsers = await AdminUser.find({}, { password: 0 });
    console.log(`\n📋 Total admin users in database: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });

    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
