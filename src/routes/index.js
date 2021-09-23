import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigators from "./Main";
import { createStackNavigator } from "@react-navigation/stack";
import ExchangeModal from "./ExchangeModal";

let AppDrawer = createDrawerNavigator();
let RootStack = createStackNavigator();

function IndexDrawerNavigation(props) {
	return (
		<AppDrawer.Navigator {...props}>
			<AppDrawer.Screen name="MainTab" component={MainTabNavigators} options={{headerShown: false}}/>
		</AppDrawer.Navigator>
	);
}

export default function RootStackNavigation(props) {
	return (
		<RootStack.Navigator {...props}>
			<RootStack.Screen name="AppDrawer" component={IndexDrawerNavigation} options={{headerShown: false}}/>
			<RootStack.Screen
				name="Exchange Modal"
				component={ExchangeModal}
				options={{
					headerShown: false,
					animationEnabled: true,
					cardStyle: { backgroundColor: "rgba(0, 0, 0, 0.15)" },
					cardOverlayEnabled: true,
					cardStyleInterpolator: ({ current: { progress } }) => {
						return {
							cardStyle: {
								opacity: progress.interpolate({
									inputRange: [0, 0.5, 0.9, 1],
									outputRange: [0, 0.25, 0.7, 1],
								}),
							},
							overlayStyle: {
								opacity: progress.interpolate({
									inputRange: [0, 1],
									outputRange: [0, 0.5],
									extrapolate: "clamp",
								}),
							},
						};
					},
				}}
			/>
		</RootStack.Navigator>
	);
}
