import React, { useState } from "react"
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native"
import styles from "./styles"

export default function VerifyOtpPage({ route, navigation }) {
  const { studentID } = route.params
  const [otpCode, setOtpCode] = useState("")

  const handleVerify = async () => {
    if (!otpCode) {
      Alert.alert("Error", "Please enter OTP code")
      return
    }

    try {
      const response = await fetch("http://10.0.2.2:7000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentID, otpCode }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Success", "Registration successful! Redirecting to login...")
        navigation.navigate("LoginPage")
      } else {
        Alert.alert("Error", data.message || "OTP verification failed")
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong")
    }
  }

  const handleResendOtp = async () => {
    try {
      const response = await fetch("http://10.0.2.2:7000/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentID }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Success", "OTP has been resent to your email")
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP")
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.LoginContainer}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>We've sent a 6-digit OTP code to your email.</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit code"
          keyboardType="numeric"
          maxLength={6}
          value={otpCode}
          onChangeText={setOtpCode}
        />

        <View style={styles.buttonContainer}>
          <Button title="Verify OTP" onPress={handleVerify} />
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendText}>Didn’t receive the code? Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
