import * as React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
export default function MarketsScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Market Screen!</Text>
			<Button mode={"contained"}>Test</Button>
		</View>
	);
}
