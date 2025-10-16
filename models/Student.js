import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // Separated name fields only
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  suffix: { type: String, default: '' },
  
  studentID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course: { type: String, required: true },
  section: { type: String, required: true }, 
  yearLevel: { type: String, required: true },
  
  // OTP fields
  otpCode: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Virtual for full name (computed property)
studentSchema.virtual('fullName').get(function() {
  let fullName = `${this.lastName}, ${this.firstName} ${this.middleName}`.trim();
  if (this.suffix) {
    fullName += ` ${this.suffix}`;
  }
  return fullName;
});

export default mongoose.model("Student", studentSchema);