import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigators from "./Main";
import { createStackNavigator } from "@react-navigation/stack";
import BuyScreen from "./Main/Exchange/buy"
import SellScreen from "./Main/Exchange/sell";
import ConvertScreen from "./Main/Exchange/convert";

let AppDrawer = createDrawerNavigator();
let RootStack = createStackNavigator();

function IndexDrawerNavigation(props) {
	return (
		<AppDrawer.Navigator {...props}>
			<AppDrawer.Screen name="MainTab" component={MainTabNavigators} options={{ headerShown: false }} />
		</AppDrawer.Navigator>
	);
}

export default function RootStackNavigation(props) {
	return (
		<RootStack.Navigator {...props}>
			<RootStack.Screen name="AppDrawer" component={IndexDrawerNavigation} options={{ headerShown: false }} />
			<RootStack.Screen name="Buy" component={BuyScreen} options={{ headerShown: true }} />
			<RootStack.Screen name="Sell" component={SellScreen} options={{ headerShown: true }} />
			<RootStack.Screen name="Convert" component={ConvertScreen} options={{ headerShown: true }} />
		</RootStack.Navigator>
	);
}
