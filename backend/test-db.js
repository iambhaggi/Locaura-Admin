require('dotenv').config();
const { MongoClient } = require('mongodb');

const testDatabase = async () => {
  let client;
  try {
    console.log('🔍 Checking App Database Collections...\n');
    
    const mongoUri = process.env.APP_MONGO_URI;
    client = new MongoClient(mongoUri);
    
    await client.connect();
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('❌ No collections found in app database');
      console.log(`   MongoDB URI: ${mongoUri}\n`);
    } else {
      console.log(`✅ Found ${collections.length} collections:\n`);
      
      for (const collMeta of collections) {
        const col = db.collection(collMeta.name);
        const count = await col.countDocuments();
        const sample = await col.findOne();
        
        console.log(`📦 Collection: "${collMeta.name}"`);
        console.log(`   Documents: ${count}`);
        if (sample) {
          const sampleStr = JSON.stringify(sample, null, 2);
          console.log(`   Sample data: ${sampleStr.substring(0, 300)}...\n`);
        } else {
          console.log(`   (empty)\n`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
};

testDatabase();
