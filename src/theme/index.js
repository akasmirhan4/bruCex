import * as React from "react";
import { configureFonts, DefaultTheme, DarkTheme, Provider as PaperProvider } from "react-native-paper";

const defaultFonts = {
	regular: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
	},
	medium: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
	},
	light: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
	},
	thin: {
		fontFamily: "Roboto-Thin",
		fontWeight: "100",
	},
};

const fontConfig = {
	default: defaultFonts,
	ios: defaultFonts,
	android: defaultFonts,
	web: defaultFonts,
};

const theme = {
	...DarkTheme,
	// Specify custom property
	dark: true,
	mode: "exact",
	roundness: 6,
	myOwnProperty: true,
	// Specify custom property in nested object
	colors: {
		primary: "#FCD535",
		// accent: "",
		background: "#1f2630",
		card: "#171e26",
		// surface: "",
		text: "#eeeff8",
		active: "#e9ecf1",
		inactive: "#424c5b",
		// disabled: "",
		// placeholder: "",
		// backdrop: "",
		// onSurface: "",
		border: "#424c5b", 
		// notification: "",
	},
	fonts: configureFonts(fontConfig),
};

export { theme };
