const mysql = require('mysql2/promise');

// MySQL Database Configuration
const mysqlConfig = {
  // Connection Settings
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'employee_voice',
  
  // Connection Pool Settings
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  
  // SSL Configuration (for production)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  
  // Character Set
  charset: 'utf8mb4',
  
  // Timezone
  timezone: '+00:00',
  
  // Additional Options
  multipleStatements: false,
  dateStrings: false,
  debug: process.env.NODE_ENV === 'development',
  trace: process.env.NODE_ENV === 'development'
};

// Create Connection Pool
const createPool = () => {
  return mysql.createPool(mysqlConfig);
};

// Create Single Connection
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL connected successfully');
    return connection;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
};

// Test Connection
const testConnection = async () => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ MySQL connection test passed');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error.message);
    return false;
  }
};

// Database Schema Creation
const createTables = async () => {
  const connection = await createConnection();
  
  try {
    // Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        national_id VARCHAR(50) UNIQUE NOT NULL,
        role ENUM('admin', 'member') DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_national_id (national_id),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Auth Tokens Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        user_role ENUM('admin', 'member') NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Submissions Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('complaint', 'suggestion', 'idea') NOT NULL,
        status ENUM('pending', 'in-review', 'resolved', 'rejected') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        submitted_by VARCHAR(36) NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        resolved_by VARCHAR(36) NULL,
        admin_notes TEXT NULL,
        department VARCHAR(100) NULL,
        impact ENUM('low', 'medium', 'high') DEFAULT 'medium',
        category VARCHAR(100) NULL,
        target_manager ENUM('operation-manager', 'hr-manager', 'area-manager') NULL,
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_submitted_by (submitted_by),
        INDEX idx_status (status),
        INDEX idx_submitted_at (submitted_at),
        INDEX idx_type (type),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Staff Profiles Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_profiles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) UNIQUE,
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        department VARCHAR(100),
        position VARCHAR(100),
        supervisor_id VARCHAR(36),
        hire_date DATE,
        profile_image_url TEXT,
        skills JSON,
        bio TEXT,
        status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active',
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(50),
        address TEXT,
        date_of_birth DATE,
        marital_status ENUM('single', 'married', 'divorced', 'widowed'),
        fathers_name VARCHAR(255),
        mothers_name VARCHAR(255),
        spouse_name VARCHAR(255),
        personal_email VARCHAR(255),
        work_email VARCHAR(255),
        mobile_number VARCHAR(50),
        home_phone VARCHAR(50),
        permanent_address TEXT,
        current_address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Malaysia',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_department (department),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Work Progress Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_progress (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        staff_id VARCHAR(36),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('project', 'task', 'training', 'meeting', 'other') DEFAULT 'task',
        status ENUM('not-started', 'in-progress', 'completed', 'on-hold', 'cancelled') DEFAULT 'not-started',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        start_date DATE DEFAULT (CURRENT_DATE),
        due_date DATE,
        completed_date DATE,
        progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        assigned_by VARCHAR(36),
        tags JSON,
        notes TEXT,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_staff_id (staff_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_assigned_by (assigned_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Staff Performance Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_performance (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        staff_id VARCHAR(36),
        period VARCHAR(100) NOT NULL,
        tasks_completed INT DEFAULT 0,
        tasks_on_time INT DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        goals JSON,
        achievements JSON,
        areas_for_improvement JSON,
        supervisor_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_staff_id (staff_id),
        INDEX idx_period (period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Submission Staff Assignment Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS submission_staff (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        submission_id VARCHAR(36),
        staff_id VARCHAR(36),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by VARCHAR(36),
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_submission_staff (submission_id, staff_id),
        INDEX idx_submission_id (submission_id),
        INDEX idx_staff_id (staff_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ All MySQL tables created successfully');
  } catch (error) {
    console.error('❌ Error creating MySQL tables:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

// Insert Sample Data
const insertSampleData = async () => {
  const connection = await createConnection();
  
  try {
    // Check if admin user exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM users WHERE national_id = ? LIMIT 1',
      ['ndsvoice']
    );

    if (adminExists.length === 0) {
      // Insert admin user
      await connection.execute(`
        INSERT INTO users (name, national_id, role) 
        VALUES (?, ?, ?)
      `, ['Employee Voice Admin', 'ndsvoice', 'admin']);
      
      console.log('✅ Admin user created');
    }

    // Check if sample member exists
    const [memberExists] = await connection.execute(
      'SELECT id FROM users WHERE national_id = ? LIMIT 1',
      ['123456789012']
    );

    if (memberExists.length === 0) {
      // Insert sample member
      await connection.execute(`
        INSERT INTO users (name, national_id, role) 
        VALUES (?, ?, ?)
      `, ['John Doe', '123456789012', 'member']);
      
      console.log('✅ Sample member created');
    }

  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

// Utility Functions
const executeQuery = async (query, params = []) => {
  const connection = await createConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

const executeTransaction = async (queries) => {
  const connection = await createConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

module.exports = {
  mysqlConfig,
  createPool,
  createConnection,
  testConnection,
  createTables,
  insertSampleData,
  executeQuery,
  executeTransaction
};