import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://cold-toes-wink.loca.lt/api';

export default function Register({ navigation }) {
  // Form fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [studentID, setStudentID] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [yearLevel, setYearLevel] = useState('');

  // OTP and loading states
  const [loading, setLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  const courses = ['BSIT', 'BSCS', 'BSIS', 'BSCE', 'BSME', 'BSEE'];
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

  const validateForm = () => {
    if (!lastName || !firstName || !middleName || !studentID || !email || !password || !confirmPassword || !course || !section || !yearLevel) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Validate studentID format
    const studentIDRegex = /^\d{2}-\d{4}-\d{6}$/;
    if (!studentIDRegex.test(studentID)) {
      Alert.alert('Error', 'Student ID must be in format: 12-3456-789012');
      return false;
    }

    return true;
  };

  const handleStartRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Sending registration data to:', `${API_BASE_URL}/register/start`);
      console.log('Registration data:', {
        lastName, firstName, middleName, suffix, studentID, email, 
        course, section, yearLevel
      });

      const response = await axios.post(`${API_BASE_URL}/register/start`, {
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
      });

      console.log('Registration response:', response.data);

      if (response.data.message === 'OTP sent to your email') {
        setCurrentEmail(email);
        setOtpModalVisible(true);
        Alert.alert('Success', 'OTP sent to your email. Please check your inbox.');
      }
    } catch (error) {
      console.log('Registration error details:', error);
      console.log('Error response:', error.response);
      
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        console.log('Server error details:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Check if backend is running.';
        console.log('No response error:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying OTP for email:', currentEmail);
      const response = await axios.post(`${API_BASE_URL}/register/verify`, {
        email: currentEmail,
        otpCode
      });

      console.log('OTP verification response:', response.data);

      if (response.data.message === 'Registration completed successfully') {
        Alert.alert('Success', 'Registration completed successfully!');
        setOtpModalVisible(false);
        navigation.navigate('Login');
      }
    } catch (error) {
      console.log('OTP verification error:', error);
      console.log('Error response:', error.response);
      
      let errorMessage = 'OTP verification failed';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check if backend is running.';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      console.log('Resending OTP to:', currentEmail);
      const response = await axios.post(`${API_BASE_URL}/register/resend-otp`, {
        email: currentEmail
      });

      console.log('Resend OTP response:', response.data);

      if (response.data.message === 'New OTP sent to your email') {
        Alert.alert('Success', 'New OTP sent to your email');
      }
    } catch (error) {
      console.log('Resend OTP error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Student Registration</Text>

      {/* Name Fields */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Middle Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Middle Name"
            value={middleName}
            onChangeText={setMiddleName}
          />
        </View>
      </View>

      {/* Suffix */}
      <Text style={styles.label}>Suffix (Optional)</Text>
      <View style={styles.pickerContainer}>
        {suffixes.map((suff) => (
          <TouchableOpacity
            key={suff}
            style={[styles.suffixOption, suffix === suff && styles.suffixSelected]}
            onPress={() => setSuffix(suff)}
          >
            <Text style={suffix === suff ? styles.suffixTextSelected : styles.suffixText}>
              {suff || 'None'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Student ID */}
      <Text style={styles.label}>Student ID *</Text>
      <TextInput
        style={styles.input}
        placeholder="12-3456-789012"
        value={studentID}
        onChangeText={setStudentID}
      />
      <Text style={styles.helperText}>Format: 12-3456-789012</Text>

      {/* Email */}
      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
      </View>

      {/* Course, Section, Year Level */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Course *</Text>
          <View style={styles.pickerContainer}>
            {courses.map((crs) => (
              <TouchableOpacity
                key={crs}
                style={[styles.courseOption, course === crs && styles.courseSelected]}
                onPress={() => setCourse(crs)}
              >
                <Text style={course === crs ? styles.courseTextSelected : styles.courseText}>
                  {crs}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Section *</Text>
          <TextInput
            style={styles.input}
            placeholder="Section"
            value={section}
            onChangeText={setSection}
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Year Level *</Text>
          <View style={styles.pickerContainer}>
            {yearLevels.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.yearOption, yearLevel === year && styles.yearSelected]}
                onPress={() => setYearLevel(year)}
              >
                <Text style={yearLevel === year ? styles.yearTextSelected : styles.yearText}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Register Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleStartRegistration}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login here</Text>
      </TouchableOpacity>

      {/* OTP Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Email</Text>
            <Text style={styles.modalText}>
              We've sent a 6-digit OTP code to your email. Please enter it below:
            </Text>
            
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="numeric"
              maxLength={6}
            />
            
            <TouchableOpacity 
              style={styles.verifyButton} 
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendText}>
                Didn't receive the code? Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  suffixOption: {
    padding: 8,
    margin: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suffixSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  suffixText: {
    fontSize: 12,
  },
  suffixTextSelected: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  courseOption: {
    padding: 8,
    margin: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  courseSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  courseText: {
    fontSize: 12,
  },
  courseTextSelected: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  yearOption: {
    padding: 8,
    margin: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  yearSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  yearText: {
    fontSize: 12,
  },
  yearTextSelected: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  verifyButton: {
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#007AFF',
    textAlign: 'center',
  },
});