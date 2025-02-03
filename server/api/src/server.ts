import express, { Request, Response } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import bcrypt from 'bcrypt'

const PORT = process.env.PORT || 9000;
const SERVER_NAME = process.env.SERVER_NAME || '';
const ALLOWED_ORIGINS = ['http://localhost:9475', 'https://app.tryzisk.com', 'http://192.168.68.68:9475'];

// New
const COUCHDB_URL = process.env.COUCHDB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h";
const REFRESH_EXPIRATION = "7d";
const ADMIN_ROLE_NAME = "_admin"

// const initializationContext = new InitializationContext()

const app = express();

// Allow requests from specific origins

app.use(cors({
	origin: (origin, callback) => {
		callback(null, true); // For now, allow all origins.
		
		// if (!origin || ALLOWED_ORIGINS.includes(origin)) {
		// 	callback(null, true);
		// } else {
		// 	callback(new Error('Not allowed by CORS'));
		// }
	},
	credentials: true, // Allow cookies and other credentials
}));


// Health check endpoint
app.get('/', (req, res) => {
	res.json({
		zisk: 'Welcome',
		version: '0.3.0',
		serverName: SERVER_NAME,
		status: 'ok',
		initialized: true,
	});
});

// // Middleware to check admin role
// function verifyAdmin(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

//     const token = authHeader.split(" ")[1];
//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         if (decoded.role !== ADMIN_ROLE_NAME) return res.status(403).json({ error: "Forbidden" });
//         next();
//     } catch (err) {
//         res.status(401).json({ error: "Invalid token" });
//     }
// }

// // Add a new user (admin only)
// app.post("/add-user", verifyAdmin, async (req, res) => {
//     const { name, password, role } = req.body;

//     if (!name || !password || !role) return res.status(400).json({ error: "Invalid input" });

//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const userDoc = {
//             _id: `org.couchdb.user:${name}`,
//             name: name,
//             roles: [],
//             type: "user",
//             password: hashedPassword,
//             salt,
//         };

//         await axios.put(`${COUCHDB_URL}/_users/org.couchdb.user:${name}`, userDoc, {
//             auth: {
//                 name: ADMIN_ROLE_NAME,
//                 password: "admin_password",
//             },
//         });

//         res.status(201).json({ message: "User created" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// Login endpoint
app.post("/login", async (req: Request, res: Response) => {
    const { name, password } = req.body;

    if (!name || !password) return res.status(400).json({ error: "Invalid input" });

    try {
        const { data: userDoc } = await axios.get(`${COUCHDB_URL}/_users/org.couchdb.user:${name}`, {
            auth: {
                name: ADMIN_ROLE_NAME,
                password: "admin_password",
            },
        });

        const isValid = await bcrypt.compare(password, userDoc.password);
        if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: userDoc._id, role: userDoc.roles[0] }, JWT_SECRET, {
            expiresIn: JWT_EXPIRATION,
        });

        const refreshToken = jwt.sign({ id: userDoc._id }, JWT_SECRET, {
            expiresIn: REFRESH_EXPIRATION,
        });

        res.cookie("auth_token", token, { httpOnly: true });
        res.cookie("refresh_token", refreshToken, { httpOnly: true });

        res.json({ message: "Logged in" });
    } catch (err) {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Logout endpoint
app.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.clearCookie("refresh_token");
    res.json({ message: "Logged out" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
