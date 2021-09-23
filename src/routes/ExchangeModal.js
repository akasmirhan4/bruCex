import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useTheme } from "@react-navigation/native";

export default function ExchangeModal(props) {
	const [visible, setVisible] = useState(true);
	const colors = useTheme().colors;
	useEffect(() => {
		setVisible(props.visible);
	}, [props.visible]);
	return (
		<Portal>
			<Modal visible={visible} style={{ position: "relative", shadowOpacity: 0 }}>
				<View
					style={{
						height: 200,
						justifyContent: "center",
						alignItems: "center",
						position: "absolute",
						bottom: 57,
						width: "100%",
						backgroundColor: colors.background,
						shadowOpacity: 0,
					}}
				>
					<Text>Exchange Modal!</Text>
				</View>
			</Modal>
		</Portal>
	);
}
