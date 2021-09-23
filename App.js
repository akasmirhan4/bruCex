import { StatusBar } from "expo-status-bar";
import React from "react";
import RootStackNavigation from "./src/routes";
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from "@react-navigation/native";
import AppLoading from "expo-app-loading";
import { loadFonts } from "./src/assets/fonts";
import { theme } from "./src/theme/index";
import { Provider as PaperProvider } from 'react-native-paper';
import merge from 'deepmerge';

export default function App() {
	let [fontsLoaded] = loadFonts();

	const CombinedTheme = merge(NavigationDarkTheme, theme)

	if (!fontsLoaded) {
		return <AppLoading />;
	} else {
		return (
			<PaperProvider theme={CombinedTheme}>
				<StatusBar />
				<NavigationContainer theme={CombinedTheme}>
					<RootStackNavigation />
				</NavigationContainer>
			</PaperProvider>
		);
	}
}
