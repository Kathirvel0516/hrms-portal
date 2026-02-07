const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require("multer");





const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "@@Nilaani#moorthy18",        // change ONLY if your MySQL has password
  database: "hrms_db"  // make sure this DB exists
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("MySQL Connected");
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'hrms-secret',       // keep this secret safe
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,           // prevents JS access to cookie
        maxAge: 60 * 60 * 1000,   // 1 hour session
        secure: false              // true if using HTTPS in production
    }
}));



// 🔐 CHECK USER ROLE
function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/'); // not logged in
        }
        if (!roles.includes(req.session.user.role)) {
            return res.redirect('/access-denied'); // unauthorized
        }
        next();
    };
}



function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

app.use(express.static(path.join(__dirname, 'public')));



// ✅ SINGLE users list (matches login UI)
const users = [
  { id: 1, username: 'superadmin', password: 'super123', role: 'SUPERADMIN' },
  { id: 2, username: 'admin', password: 'admin123', role: 'ADMIN' },
  { id: 3, username: 'employee', password: 'emp123', role: 'EMPLOYEE' }
];
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });


// Example: Onboarding submission
app.post('/submit-onboarding',
    ensureLoggedIn,              // check session exists
    allowRoles('ADMIN', 'SUPERADMIN'), // only Admin/SuperAdmin
    (req, res) => {
        // Your onboarding processing logic
        res.send('Onboarding submitted successfully!');
    }
);

// Example: Bank change page (SuperAdmin only)
app.post('/bank-change',
    ensureLoggedIn,
    allowRoles('SUPERADMIN'),
    (req, res) => {
        res.send('Bank details updated');
    }
);


app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    const user = users.find(
        u => u.username === userId && u.password === password
    );

    if (!user) {
        return res.send('<h3>Invalid login. <a href="/">Try again</a></h3>');
    }

    // Store user session
    req.session.user = user;

// 🔁 role-based redirect
if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
    return res.redirect('/admin-dashboard');
}

if (user.role === 'EMPLOYEE') {
    return res.redirect('/employee-dashboard');
}


});
app.get('/superadmin', (req, res) => {
    res.send('<h1>Super Admin Dashboard</h1>');
});

app.get('/admin', (req, res) => {
    res.send('<h1>Admin Dashboard</h1>');
});

app.get('/employee', (req, res) => {
    res.send('<h1>Employee Dashboard</h1>');
});


// 🔒 PROTECTED REFERRAL PAGE
app.get('/referral',
    ensureLoggedIn,
    allowRoles('ADMIN', 'SUPERADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'referral.html'));
    }
);

// 🔒 ADMIN DASHBOARD
app.get('/admin-dashboard',
    ensureLoggedIn,
    allowRoles('SUPERADMIN', 'ADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
    }
);
// 🔒 EMPLOYEE DASHBOARD
app.get('/employee-dashboard',
    ensureLoggedIn,
    allowRoles('EMPLOYEE'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'employee-dashboard.html'));
    }
);
// 🔒 LINEUP PAGE (Admin + Super Admin)
app.get('/lineup',
    ensureLoggedIn,
    allowRoles('ADMIN', 'SUPERADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'lineup.html'));
    }
);

// 🔒 ONBOARDING PAGE (Admin + Super Admin)
app.get('/onboardingsample',
    ensureLoggedIn,
    allowRoles('ADMIN', 'SUPERADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'onboardingsample.html'));
    }
);
app.get('/bank-change',
    ensureLoggedIn,
    allowRoles('SUPERADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public/bank-change.html'));
    }
);
app.get('/onboarded-list',
    ensureLoggedIn,
    allowRoles('ADMIN', 'SUPERADMIN'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public/onboarded-list.html'));
    }
);
// 🔒 PAYSLIP PAGE
app.get('/payslip',
    ensureLoggedIn,
    allowRoles('SUPERADMIN', 'EMPLOYEE'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'payslip.html'));
    }
);
// 🔒 OFFER LETTER PAGE
app.get('/offer-letter',
    ensureLoggedIn,
    allowRoles('SUPERADMIN', 'ADMIN', 'EMPLOYEE'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'offer-letter.html'));
    }
);
// 🔒 TICKET PAGE
app.get('/ticket',
    ensureLoggedIn,
    allowRoles('SUPERADMIN', 'ADMIN', 'EMPLOYEE'),
    (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'ticket.html'));
    }

);
app.get('/api/me', ensureLoggedIn, (req, res) => {
    res.json({
        role: req.session.user.role
    });
});




app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});
app.get('/api/payslip/:employeeId',
    ensureLoggedIn,
    (req, res) => {

        const user = req.session.user;
        const requestedId = req.params.employeeId;

        // ❌ Admin never allowed
        if (user.role === 'ADMIN') {
            return res.status(403).send('Access denied');
        }

        // ❌ Employee accessing others
        if (user.role === 'EMPLOYEE' && user.id != requestedId) {
            return res.status(403).send('Access denied');
        }

        // ✅ Allowed
        res.json({
            employeeId: requestedId,
            salary: "₹18,000",
            month: "January"
        });
    }
);
app.get('/api/offer-letter/:employeeId',
    ensureLoggedIn,
    (req, res) => {

        const user = req.session.user;
        const requestedId = req.params.employeeId;

        if (user.role === 'EMPLOYEE' && user.id != requestedId) {
            return res.status(403).send('Access denied');
        }

        res.send(`Offer letter for employee ${requestedId}`);
    }
);
app.get('/api/ticket/:employeeId',
    ensureLoggedIn,
    (req, res) => {

        const user = req.session.user;
        const requestedId = req.params.employeeId;

        if (user.role === 'EMPLOYEE' && user.id != requestedId) {
            return res.status(403).send('Access denied');
        }

        res.send(`Ticket info for employee ${requestedId}`);
    }
);
app.use(express.json());

app.post("/api/referral", (req, res) => {
    const {
        sourcedBy,
        recruiter,
        client,
        state,
        city,
        candidateName,
        mobile,
        designation,
        expectedDoj,
        status
    } = req.body;

    const sql = `
        INSERT INTO referrals_master
        (sourced_by, recruiter, client, state, city,
         candidate_name, mobile, designation, expected_doj, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        sourcedBy,
        recruiter,
        client,
        state,
        city,
        candidateName,
        mobile,
        designation,
        expectedDoj,
        status
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});
app.post("/save-referral", (req, res) => {
    console.log("Referral request received");
    console.log(req.body);

    res.send("Referral saved successfully");
});
app.post("/save-lineup", (req, res) => {

  console.log(req.body); // 👈 VERY IMPORTANT (keep this)

  const {
    candidate_name,
    mobile,
    designation,
    client,
    state,
    city,
    interview_date,
    interview_time,
    interview_mode,
    interview_status
  } = req.body;

  const sql = `
    INSERT INTO lineup_master
    (candidate_name, mobile, designation, client, state, city,
     interview_date, interview_time, interview_mode, interview_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      candidate_name,
      mobile,
      designation,
      client,
      state,
      city,
      interview_date,
      interview_time,
      interview_mode,
      interview_status
    ],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send("Database error");
      }
      res.send("Lineup saved successfully");
    }
  );
});
app.post(
  "/submit-onboarding",
  upload.fields([
    { name: "passportPhoto" },
    { name: "passbook" }
  ]),
  (req, res) => {

    const data = req.body;

    const passportPhoto = req.files.passportPhoto
        ? req.files.passportPhoto[0].filename
        : null;

    const passbook = req.files.passbook
        ? req.files.passbook[0].filename
        : null;

    const sql = `
      INSERT INTO onboarding_master (
        email, date_of_upload, sourced_by, recruiter, client, state, city,
        working_location, payroll, designation,
        employee_name, mobile, emergency_mobile, alternate_email,
        dob, gender, marital_status, doj,
        father_name, permanent_address, present_address,
        aadhar_number, bank_name, account_number, ifsc,
        passport_photo, passbook
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
        data.email,
        data.dateOfUpload,
        data.sourcedBy,
        data.recruiter,
        data.client,
        data.state,
        data.city,

        data.workingLocation,
        data.payroll,
        data.designation,

        data.employeeName,
        data.mobile,
        data.emergencyMobile,
        data.alternateEmail,

        data.dob,
        data.gender,
        data.maritalStatus,
        data.doj,

        data.fatherName,
        data.permanentAddress,
        data.presentAddress,

        data.aadharNumber,
        data.bankName,
        data.accountNumber,
        data.ifsc,

        passportPhoto,
        passbook
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.error("Onboarding DB Error:", err);
            return res.status(500).send("Database error");
        }

        res.send("Onboarding saved successfully");
    });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/login');
});
