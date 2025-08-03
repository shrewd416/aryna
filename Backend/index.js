const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./database');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// --- AUTH ROUTES (UPDATED) ---

// Register (No change)
app.post('/api/register', async (req, res) => {
    const { userName, mobileNumber, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: "Passwords don't match" });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO TblUserMaster (userName, mobileNumber, password) VALUES (?, ?, ?)';
        db.run(sql, [userName, mobileNumber, hashedPassword], function(err) {
            if (err) return res.status(400).json({ success: false, message: 'Username already exists.' });
            res.status(201).json({ success: true, message: 'User registered successfully.' });
        });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error during registration.' }); }
});

// Login (No change)
app.post('/api/login', (req, res) => {
    const { userName, password } = req.body;
    const sql = 'SELECT * FROM TblUserMaster WHERE userName = ?';
    db.get(sql, [userName], async (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        const token = jwt.sign({ id: user.userID, userName: user.userName }, 'your_jwt_secret', { expiresIn: '1h' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, data: { token, user: userWithoutPassword } });
    });
});

// --- SECURE PASSWORD RESET FLOW ---

// Forgot Password (UPDATED)
app.post('/api/forgot-password', (req, res) => {
    const { userName, mobileNumber } = req.body;
    const findUserSql = 'SELECT * FROM TblUserMaster WHERE userName = ? AND mobileNumber = ?';

    db.get(findUserSql, [userName, mobileNumber], (err, user) => {
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or mobile number mismatch.' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const insertTokenSql = 'INSERT INTO TblPasswordResets (userID, token, expiresAt) VALUES (?, ?, ?)';
        db.run(insertTokenSql, [user.userID, token, expiresAt], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Could not create password reset token.' });
            }
            // In a real app, send the token via SMS/email. Here we return it.
            res.json({ success: true, message: 'Token generated successfully.', data: { token } });
        });
    });
});

// Reset Password (UPDATED)
app.post('/api/reset-password', (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords don't match." });
    }

    const findTokenSql = 'SELECT * FROM TblPasswordResets WHERE token = ? AND expiresAt > ?';
    db.get(findTokenSql, [token, new Date()], async (err, resetRequest) => {
        if (err || !resetRequest) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateUserSql = 'UPDATE TblUserMaster SET password = ? WHERE userID = ?';
            
            db.run(updateUserSql, [hashedPassword, resetRequest.userID], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to update password.' });
                }

                // Invalidate the token
                const deleteTokenSql = 'DELETE FROM TblPasswordResets WHERE id = ?';
                db.run(deleteTokenSql, [resetRequest.id]);

                res.json({ success: true, message: 'Password has been reset successfully.' });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error during password reset.' });
        }
    });
});


// --- PROFILE ROUTES (NEW) ---

// Update Username
app.put('/api/profile/username', authMiddleware, (req, res) => {
    const { newUserName } = req.body;
    const userID = req.user.id;

    if (!newUserName || newUserName.length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }

    const sql = 'UPDATE TblUserMaster SET userName = ? WHERE userID = ?';
    db.run(sql, [newUserName, userID], function(err) {
        if (err) {
            // "UNIQUE constraint failed" error has code SQLITE_CONSTRAINT
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ success: false, message: 'Username is already taken.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to update username.' });
        }

        // Fetch updated user to return
        db.get('SELECT userID, userName, mobileNumber FROM TblUserMaster WHERE userID = ?', [userID], (err, updatedUser) => {
            res.json({ success: true, message: 'Username updated successfully.', data: updatedUser });
        });
    });
});

// Change Password (when logged in)
app.post('/api/profile/password', authMiddleware, (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userID = req.user.id;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "New passwords don't match." });
    }

    const getUserSql = 'SELECT * FROM TblUserMaster WHERE userID = ?';
    db.get(getUserSql, [userID], async (err, user) => {
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE TblUserMaster SET password = ? WHERE userID = ?';
        db.run(updateSql, [hashedPassword, userID], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to change password.' });
            }
            res.json({ success: true, message: 'Password changed successfully.' });
        });
    });
});


// --- EMPLOYEE ROUTES ---

// Get all employees with search
app.get('/api/employees', authMiddleware, (req, res) => {
    const { q } = req.query;
    let sql = `
        SELECT m.*, d.* FROM TblEmployeeMaster m
        LEFT JOIN TblEmployeeDetail d ON m.mastCode = d.mastCode
    `;
    const params = [];

    if (q) {
        sql += ' WHERE m.empName LIKE ? OR m.empID LIKE ? OR m.designation LIKE ? OR m.department LIKE ?';
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching employees.' });
        }
        res.json({ success: true, data: rows });
    });
});


// Get a single employee
app.get('/api/employees/:mastCode', authMiddleware, (req, res) => {
    const { mastCode } = req.params;
    const sql = `
        SELECT m.*, d.* FROM TblEmployeeMaster m
        LEFT JOIN TblEmployeeDetail d ON m.mastCode = d.mastCode
        WHERE m.mastCode = ?
    `;

    db.get(sql, [mastCode], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching employee.' });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }
        res.json({ success: true, data: row });
    });
});


// Add a new employee
app.post('/api/employees', authMiddleware, (req, res) => {
    const {
        empID, empName, designation, department, joinedDate, salary,
        addressLine1, addressLine2, city, state, country
    } = req.body;
    const userID = req.user.id;

    db.serialize(() => {
        const masterSql = 'INSERT INTO TblEmployeeMaster (userID, empID, empName, designation, department, joinedDate, salary) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(masterSql, [userID, empID, empName, designation, department, joinedDate, salary], function(err) {
            if (err) {
                return res.status(400).json({ success: false, message: 'Failed to add employee. Employee ID may already exist.' });
            }
            
            const mastCode = this.lastID;
            const detailSql = 'INSERT INTO TblEmployeeDetail (mastCode, addressLine1, addressLine2, city, state, country) VALUES (?, ?, ?, ?, ?, ?)';
            db.run(detailSql, [mastCode, addressLine1, addressLine2, city, state, country], (err) => {
                if (err) {
                    // Rollback master insert if detail fails
                    db.run('DELETE FROM TblEmployeeMaster WHERE mastCode = ?', [mastCode]);
                    return res.status(500).json({ success: false, message: 'Failed to add employee details.' });
                }
                res.status(201).json({ success: true, message: 'Employee added successfully.', data: { mastCode } });
            });
        });
    });
});


// Update an employee
app.put('/api/employees/:mastCode', authMiddleware, (req, res) => {
    const { mastCode } = req.params;
    const {
        empID, empName, designation, department, joinedDate, salary,
        addressLine1, addressLine2, city, state, country
    } = req.body;

    db.serialize(() => {
        const masterSql = 'UPDATE TblEmployeeMaster SET empID = ?, empName = ?, designation = ?, department = ?, joinedDate = ?, salary = ? WHERE mastCode = ?';
        db.run(masterSql, [empID, empName, designation, department, joinedDate, salary, mastCode], function(err) {
            if (err) {
                return res.status(400).json({ success: false, message: 'Failed to update employee master data.' });
            }

            const detailSql = 'UPDATE TblEmployeeDetail SET addressLine1 = ?, addressLine2 = ?, city = ?, state = ?, country = ? WHERE mastCode = ?';
            db.run(detailSql, [addressLine1, addressLine2, city, state, country, mastCode], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to update employee details.' });
                }
                if (this.changes === 0) {
                    // If no detail record existed, create one
                    const insertDetailSql = 'INSERT INTO TblEmployeeDetail (mastCode, addressLine1, addressLine2, city, state, country) VALUES (?, ?, ?, ?, ?, ?)';
                    db.run(insertDetailSql, [mastCode, addressLine1, addressLine2, city, state, country]);
                }
                res.json({ success: true, message: 'Employee updated successfully.' });
            });
        });
    });
});


// Delete an employee
app.delete('/api/employees/:mastCode', authMiddleware, (req, res) => {
    const { mastCode } = req.params;
    const sql = 'DELETE FROM TblEmployeeMaster WHERE mastCode = ?';

    db.run(sql, [mastCode], function(err) {
        if (err || this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found or could not be deleted.' });
        }
        res.json({ success: true, message: 'Employee deleted successfully.' });
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});