const mongoose = require('mongoose');

const APP_MONGO_URI = process.env.APP_MONGO_URI || 'mongodb+srv://locaura_db_user:locaura_db_1234@locaura-dev-cluster.ax6zctm.mongodb.net/?appName=locaura-dev-cluster';

async function checkDatabases() {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    
    // Connect without specifying a database - gives access to admin functions
    const adminConnection = await mongoose.connect(APP_MONGO_URI, {
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    const db = adminConnection.connection.getClient().db('admin');
    
    // Get all databases
    console.log('📊 DATABASES IN CLUSTER:\n');
    const databases = await db.admin().listDatabases();
    
    for (let database of databases.databases) {
      console.log(`\n📁 DATABASE: "${database.name}" (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      
      try {
        // Connect to each database
        const testDb = adminConnection.connection.getClient().db(database.name);
        const collections = await testDb.listCollections().toArray();
        
        if (collections.length === 0) {
          console.log('   └─ (no collections)');
        } else {
          for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            const stats = await testDb.collection(collection.name).stats();
            const docCount = stats.count || 0;
            console.log(`   ${i === collections.length - 1 ? '└─' : '├─'} ${collection.name}: ${docCount} documents`);
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Cannot access (permission denied)`);
      }
    }

    await adminConnection.disconnect();
    console.log('\n✅ Database scan complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabases();
