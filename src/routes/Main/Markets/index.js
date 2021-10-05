import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MarketsScreen from "./Markets";
import CoinDetails from "./CoinDetails";
import Appbar from "../../../assets/components/Appbar";

let MarketStack = createStackNavigator();

export default function MarketStackNavigation(props) {
	return (
		<MarketStack.Navigator
			{...props}
			initialRouteName="Markets"
			screenOptions={{
				header: () => {
					return <Appbar />;
				},
			}}
		>
			<MarketStack.Screen name="Markets" component={MarketsScreen} options={{ headerShown: true }} />
		</MarketStack.Navigator>
	);
}
