import { useTheme } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function Appbar() {
	const colors = useTheme().colors;
	return (
		<View style={{ width: "100%", height: 45, backgroundColor: colors.card, justifyContent: "center", alignItems: "center" }}>
			<Text>App bar</Text>
		</View>
	);
}
