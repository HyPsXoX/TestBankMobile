import React, { useState } from "react"
import { View, Text, TextInput, Button, Alert, TouchableOpacity, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import styles from "./styles"

export default function RegisterStudentPage({ navigation }) {
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [studentID, setStudentID] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [course, setCourse] = useState("")
  const [section, setSection] = useState("")
  const [yearLevel, setYearLevel] = useState("")

  const handleRegister = async () => {
    if (!lastName || !firstName || !middleName || !studentID || !email || !password || !confirmPassword || !course || !section || !yearLevel) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    try {
      const response = await fetch("http://10.0.2.2:7000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName,
          firstName,
          middleName,
          suffix,
          studentID,
          email,
          password,
          course,
          section,
          yearLevel,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Success", "Check your email for the OTP code")
        navigation.navigate("VerifyOtpPage", { studentID })
      } else {
        Alert.alert("Error", data.message || "Registration failed")
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong")
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.LoginContainer}>
        <Text style={styles.title}>Student Registration</Text>

        <View style={styles.PersonalInfo}>
          <Text style={styles.subtitle}>Personal Information</Text>
          <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Middle Name" value={middleName} onChangeText={setMiddleName} />
          <View style={styles.SelectContainer}>
            <Text style={styles.label}>Suffix (Optional)</Text>
            <Picker selectedValue={suffix} onValueChange={setSuffix} style={styles.dropdown}>
              <Picker.Item label="None" value="" />
              <Picker.Item label="Jr." value="Jr." />
              <Picker.Item label="Sr." value="Sr." />
              <Picker.Item label="II" value="II" />
              <Picker.Item label="III" value="III" />
              <Picker.Item label="IV" value="IV" />
            </Picker>
          </View>
        </View>

        <View style={styles.AccountInfo}>
          <Text style={styles.subtitle}>Account Information</Text>
          <TextInput style={styles.input} placeholder="Student ID (12-3456-789012)" value={studentID} onChangeText={setStudentID} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <View style={styles.ProfessionalInfo}>
          <Text style={styles.subtitle}>Academic Information</Text>

          <View style={styles.SelectContainer}>
            <Text style={styles.label}>Course</Text>
            <Picker selectedValue={course} onValueChange={setCourse} style={styles.dropdown}>
              <Picker.Item label="Select Course" value="" />
              <Picker.Item label="BSIT" value="BSIT" />
              <Picker.Item label="BSCS" value="BSCS" />
              <Picker.Item label="BSIS" value="BSIS" />
              <Picker.Item label="BSCE" value="BSCE" />
              <Picker.Item label="BSME" value="BSME" />
              <Picker.Item label="BSEE" value="BSEE" />
            </Picker>
          </View>

          <TextInput style={styles.input} placeholder="Section" value={section} onChangeText={setSection} />

          <View style={styles.SelectContainer}>
            <Text style={styles.label}>Year Level</Text>
            <Picker selectedValue={yearLevel} onValueChange={setYearLevel} style={styles.dropdown}>
              <Picker.Item label="Select Year" value="" />
              <Picker.Item label="1st Year" value="1st Year" />
              <Picker.Item label="2nd Year" value="2nd Year" />
              <Picker.Item label="3rd Year" value="3rd Year" />
              <Picker.Item label="4th Year" value="4th Year" />
            </Picker>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Register" onPress={handleRegister} />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
