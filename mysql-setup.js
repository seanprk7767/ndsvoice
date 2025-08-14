#!/usr/bin/env node

/**
 * MySQL Database Setup Script
 * Run this script to initialize the MySQL database for Employee Voice
 */

const { 
  testConnection, 
  createTables, 
  insertSampleData 
} = require('./mysql.config');

async function setupDatabase() {
  console.log('🚀 Starting MySQL Database Setup...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing MySQL connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest) {
      console.error('❌ Cannot connect to MySQL. Please check your configuration.');
      process.exit(1);
    }

    // Create tables
    console.log('\n2️⃣ Creating database tables...');
    await createTables();

    // Insert sample data
    console.log('\n3️⃣ Inserting sample data...');
    await insertSampleData();

    console.log('\n✅ MySQL Database setup completed successfully!');
    console.log('\n📋 Sample Credentials:');
    console.log('   Admin: National ID = ndsvoice');
    console.log('   Member: National ID = 123456789012');
    console.log('\n🎉 You can now start the application!');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };