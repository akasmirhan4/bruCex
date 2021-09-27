import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Login";
import Register from "./Register";

let AuthStack = createStackNavigator();

export default function AuthStackNavigation(props) {
	return (
		<AuthStack.Navigator {...props} initialRouteName="Login">
			<AuthStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
			<AuthStack.Screen name="Register" component={Register} options={{ headerShown: false }} />
		</AuthStack.Navigator>
	);
}
