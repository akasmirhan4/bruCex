import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Caption, Modal, Portal, Subheading, Text } from "react-native-paper";

export default function SuccessModal(props) {
	const roundness = useTheme().roundness;
	const colors = useTheme().colors;
	const [visible, setVisible] = useState(false);
	const DURATION = 1000;
	let fadeTimeOut = null;

	const start = () => {
		setVisible(true);
		clearTimeout(fadeTimeOut);
		fadeTimeOut = setTimeout(() => {
			setVisible(false);
			props.onEnd();
		}, DURATION);
	};

	useEffect(() => {
		return () => {
			clearTimeout(fadeTimeOut);
		};
	}, []);

	useEffect(() => {
		console.log(props.msg);
		if (!!props.msg && props.visible) {
			start();
		}
	}, [props.visible]);

	return (
		<Portal>
			<Modal visible={visible} style={{ justifyContent: "center", alignItems: "center" }}>
				<View style={{ backgroundColor: colors.caption, width: 120, height: 120, justifyContent: "center", alignItems: "center", borderRadius: roundness }}>
					<Ionicons name="checkmark-circle-outline" size={76} color={colors.text} />
					<Caption>{props.msg}</Caption>
				</View>
			</Modal>
		</Portal>
	);
}
