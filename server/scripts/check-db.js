const db = require('../models');

async function checkDatabase() {
  try {
    // Test connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if tables exist
    const tables = await db.sequelize.getQueryInterface().showAllTables();
    console.log('\n📊 Tables in database:');
    tables.forEach(table => console.log(`  - ${table}`));

    // Check Users table
    if (tables.includes('Users')) {
      const userCount = await db.User.count();
      console.log(`\n👥 Total users: ${userCount}`);
      
      if (userCount > 0) {
        const users = await db.User.findAll({
          attributes: ['id', 'email', 'name', 'role', 'ProjectId'],
          limit: 5
        });
        console.log('\n📋 Sample users:');
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
        });
      } else {
        console.log('⚠️  No users found. You need to register first.');
      }
    }

    // Check Projects table
    if (tables.includes('Projects')) {
      const projectCount = await db.Project.count();
      console.log(`\n📁 Total projects: ${projectCount}`);
    }

    await db.sequelize.close();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 Make sure:');
      console.error('  1. PostgreSQL is running');
      console.error('  2. Database "contentplanner" exists');
      console.error('  3. Credentials in config/config.json are correct');
    }
    process.exit(1);
  }
}

checkDatabase();

