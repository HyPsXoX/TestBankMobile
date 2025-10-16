import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Student from './models/Student.js';  
import { sendOTPEmail, verifyOTP } from './utils/emailService.js';  


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'QuizBank API is running!' });
});

// Start registration - send OTP
app.post('/api/register/start', async (req, res) => {
  try {
    const { 
      lastName, 
      firstName, 
      middleName, 
      suffix, 
      studentID, 
      email, 
      password, 
      confirmPassword,
      course, 
      section, 
      yearLevel 
    } = req.body;

    // Validation
    if (!lastName || !firstName || !middleName || !studentID || !email || !password || !course || !section || !yearLevel) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if studentID or email already exists
    const existingStudent = await Student.findOne({
      $or: [{ studentID }, { email }]
    });

    if (existingStudent) {
      if (existingStudent.studentID === studentID) {
        return res.status(400).json({ message: 'Student ID already registered' });
      }
      if (existingStudent.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Validate studentID format (12-3456-789012)
    const studentIDRegex = /^\d{2}-\d{4}-\d{6}$/;
    if (!studentIDRegex.test(studentID)) {
      return res.status(400).json({ message: 'Student ID must be in format: 12-3456-789012' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store temporary registration data (in production, use Redis or temporary collection)
    const tempRegistration = {
      lastName,
      firstName,
      middleName,
      suffix: suffix || '',
      studentID,
      email,
      password, // In production, hash this
      course,
      section,
      yearLevel,
      otpCode,
      otpExpires
    };

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode);
      
      // Store temp data (in production, use proper temporary storage)
      // For now, we'll store it in memory (not production-safe)
      global.tempRegistrations = global.tempRegistrations || {};
      global.tempRegistrations[email] = tempRegistration;

      res.json({ 
        message: 'OTP sent to your email',
        email: email
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

  } catch (error) {
    console.error('Registration start error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP and complete registration
app.post('/api/register/verify', async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    // Get temporary registration data
    const tempRegistration = global.tempRegistrations?.[email];
    
    if (!tempRegistration) {
      return res.status(400).json({ message: 'Registration session expired or not found' });
    }

    // Check if OTP expired
    if (new Date() > new Date(tempRegistration.otpExpires)) {
      delete global.tempRegistrations[email];
      return res.status(400).json({ message: 'OTP has expired. Please start registration again.' });
    }

    // Verify OTP
    if (tempRegistration.otpCode !== otpCode) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Create student account
    const student = new Student({
      lastName: tempRegistration.lastName,
      firstName: tempRegistration.firstName,
      middleName: tempRegistration.middleName,
      suffix: tempRegistration.suffix,
      studentID: tempRegistration.studentID,
      email: tempRegistration.email,
      password: tempRegistration.password, // In production, hash this
      course: tempRegistration.course,
      section: tempRegistration.section,
      yearLevel: tempRegistration.yearLevel,
      isVerified: true
    });

    await student.save();

    // Clean up temporary data
    delete global.tempRegistrations[email];

    res.status(201).json({ 
      message: 'Registration completed successfully',
      student: { 
        id: student._id, 
        studentID: student.studentID,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        section: student.section,
        yearLevel: student.yearLevel
      }
    });

  } catch (error) {
    console.error('Registration verify error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resend OTP
app.post('/api/register/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get temporary registration data
    const tempRegistration = global.tempRegistrations?.[email];
    
    if (!tempRegistration) {
      return res.status(400).json({ message: 'Registration session expired. Please start over.' });
    }

    // Generate new OTP
    const newOtpCode = generateOTP();
    const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update temporary data
    tempRegistration.otpCode = newOtpCode;
    tempRegistration.otpExpires = newOtpExpires;
    global.tempRegistrations[email] = tempRegistration;

    // Send new OTP email
    try {
      await sendOTPEmail(email, newOtpCode);
      res.json({ message: 'New OTP sent to your email' });
    } catch (emailError) {
      console.error('Email error:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint (using studentID instead of email)
app.post('/api/login', async (req, res) => {
  try {
    const { studentID, password } = req.body;
    
    if (!studentID || !password) {
      return res.status(400).json({ message: 'Student ID and password are required' });
    }

    // Find student by studentID
    const student = await Student.findOne({ studentID });
    if (!student) {
      return res.status(400).json({ message: 'Invalid Student ID or password' });
    }

    // Check if student is verified
    if (!student.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Check password (in production, use bcrypt to compare hashed passwords)
    if (student.password !== password) {
      return res.status(400).json({ message: 'Invalid Student ID or password' });
    }

    res.json({ 
      message: 'Login successful',
      student: { 
        id: student._id, 
        studentID: student.studentID,
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        section: student.section,
        yearLevel: student.yearLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students (for testing)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().select('-password -otpCode');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Configured' : 'Missing'}`);
  console.log(`Email User: ${process.env.EMAIL_USER ? 'Configured' : 'Missing'}`);
});