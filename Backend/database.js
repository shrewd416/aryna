const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// const dbPath = path.resolve(__dirname, 'record_maintenance.db');

const diskPath = process.env.RENDER_DISK_PATH;
const dbPath = diskPath ? path.join(diskPath, 'record_maintenance.db') : path.resolve(__dirname, 'record_maintenance.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.exec('PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.error("Could not enable foreign keys:", err);
    });
  }
});

const createTables = () => {
  const createUserMasterTable = `
    CREATE TABLE IF NOT EXISTS TblUserMaster (
      userID INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT NOT NULL UNIQUE,
      mobileNumber TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `;

  const createEmployeeMasterTable = `
    CREATE TABLE IF NOT EXISTS TblEmployeeMaster (
      mastCode INTEGER PRIMARY KEY AUTOINCREMENT,
      userID INTEGER,
      empID TEXT NOT NULL UNIQUE,
      empName TEXT NOT NULL,
      designation TEXT,
      department TEXT,
      joinedDate TEXT,
      salary REAL,
      FOREIGN KEY (userID) REFERENCES TblUserMaster(userID) ON DELETE CASCADE
    );
  `;

  const createEmployeeDetailTable = `
    CREATE TABLE IF NOT EXISTS TblEmployeeDetail (
      empDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
      mastCode INTEGER UNIQUE,
      addressLine1 TEXT,
      addressLine2 TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      FOREIGN KEY (mastCode) REFERENCES TblEmployeeMaster(mastCode) ON DELETE CASCADE
    );
  `;

  // New table for secure password resets
  const createPasswordResetsTable = `
    CREATE TABLE IF NOT EXISTS TblPasswordResets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expiresAt DATETIME NOT NULL,
        FOREIGN KEY (userID) REFERENCES TblUserMaster(userID) ON DELETE CASCADE
    );
  `;

  db.serialize(() => {
    db.run(createUserMasterTable, (err) => {
        if (err) console.error("Error creating TblUserMaster:", err.message);
    });
    db.run(createEmployeeMasterTable, (err) => {
        if (err) console.error("Error creating TblEmployeeMaster:", err.message);
    });
    db.run(createEmployeeDetailTable, (err) => {
        if (err) console.error("Error creating TblEmployeeDetail:", err.message);
    });
    db.run(createPasswordResetsTable, (err) => {
        if(err) console.error("Error creating TblPasswordResets:", err.message);
    });
  });
};

createTables();

module.exports = db;