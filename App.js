import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomePage from "./screens/HomePage";
import RegisterAccountPage from "./screens/RegisterAccountPage";
import ProfPage from "./screens/ProfPage";
import TemporaryPage from "./screens/TemporaryPage";
import StudentPage from "./screens/StudentPage";
import RegisterStudentPage from "./screens/RegisterStudentPage"
import VerifyOtpPage from "./screens/VerifyOtpPage"
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="RegisterAccountPage" component={RegisterAccountPage} />
        <Stack.Screen name="ProfPage" component={ProfPage} />
        <Stack.Screen name="TemporaryPage" component={TemporaryPage} />
        <Stack.Screen name="StudentPage" component={StudentPage} />
        <Stack.Screen name="RegisterStudentPage" component={RegisterStudentPage} />
        <Stack.Screen name="VerifyOtpPage" component={VerifyOtpPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
