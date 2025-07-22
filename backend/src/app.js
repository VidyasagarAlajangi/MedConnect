const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const authrouter = require('./routes/auth');
const doctorrouter = require('./routes/doctor');
const adminrouter = require('./routes/admin');
const userRouter = require("./routes/user");
const appointmentRoutes = require("./routes/appointment");
const videoRoutes = require("./routes/video");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });



app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authrouter);
app.use('/api/doctors', doctorrouter);
app.use('/api/admin', adminrouter);
app.use("/api/user", userRouter);
app.use("/api/appointment", appointmentRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start the server
connectDB().then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});







