import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Appbar from "../../../assets/components/Appbar";
import BalancesScreen from "./Balances";

let BalanceStack = createStackNavigator();

export default function BalanceStackNavigation(props) {
	return (
		<BalanceStack.Navigator
			{...props}
			initialRouteName="Balances"
			screenOptions={{
				header: () => {
					return <Appbar />;
				},
			}}
		>
			<BalanceStack.Screen name="Balances" component={BalancesScreen} options={{ headerShown: true }} />
		</BalanceStack.Navigator>
	);
}
