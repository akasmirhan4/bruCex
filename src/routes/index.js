import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigators from "./Main";
import { createStackNavigator } from "@react-navigation/stack";
import BuyScreen from "./Main/Exchange/buy";
import SellScreen from "./Main/Exchange/sell";
import ConvertScreen from "./Main/Exchange/convert";
import { Dimensions } from "react-native";
import { useTheme, useNavigationContainerRef } from "@react-navigation/native";
import DrawerContent from "./DrawerContent";
import AuthStackNavigation from "./Auth";
import Authenticate from "./Auth/Authenticate";
import CoinDetailsScreen from "./Main/Markets/CoinDetails";

let AppDrawer = createDrawerNavigator();
let RootStack = createStackNavigator();

function IndexDrawerNavigation(props) {
	const { width } = Dimensions.get("window");
	return (
		<AppDrawer.Navigator
			{...props}
			drawerContent={() => {
				return <DrawerContent />;
			}}
			screenOptions={{ drawerStyle: { width: width } }}
		>
			<AppDrawer.Screen name="MainTab" component={MainTabNavigators} options={{ headerShown: false }} />
			<AppDrawer.Screen name="AuthStack" component={AuthStackNavigation} options={{ headerShown: false }} />
			<AppDrawer.Screen name="Authenticate" component={Authenticate} options={{ headerShown: false }} />
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
			<RootStack.Screen name="Coin Details" component={CoinDetailsScreen} options={{ headerShown: false }} />
		</RootStack.Navigator>
	);
}
