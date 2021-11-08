import { useFonts } from "expo-font";

const loadFonts = () => {
	return useFonts({
		"Roboto-Regular": require("./Roboto-Regular.ttf"),
		"Roboto-Medium": require("./Roboto-Medium.ttf"),
		"Roboto-Light": require("./Roboto-Light.ttf"),
		"Roboto-Thin": require("./Roboto-Thin.ttf"),
	});
};

export { loadFonts };
