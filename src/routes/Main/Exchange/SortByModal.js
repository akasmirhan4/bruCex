import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme, useNavigation } from "@react-navigation/native";
import BottomSheet from "reanimated-bottom-sheet";
import { Animated, StyleSheet, View, TouchableHighlight, TouchableWithoutFeedback } from "react-native";
import { Button, Caption, Divider, Modal, Portal, Subheading, Text, Title } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { color } from "react-native-reanimated";

export default function SortByModal(props) {
	const colors = useTheme().colors;
	const roundness = useTheme().roundness;
	const sheetRef = useRef(null);
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState("Hot");
	const sortLabels = ["Hot", "Market Cap", "Price", "24h Change"];
	const LABEL_HEIGHT = 10;
	const renderContent = () => (
		<View
			style={{
				backgroundColor: colors.background,
				height: 330,
				alignItems: "center",
			}}
		>
			<View style={{ width: "100%", alignItems: "center", paddingVertical: LABEL_HEIGHT }}>
				<Caption>Sort By</Caption>
			</View>
			{sortLabels.map((sortLabel, index) => {
				const color = sortLabel == selected ? colors.primary : colors.caption;
				return (
					<View key={index} style={{ width: "100%", alignItems: "center", marginLeft: 8 }}>
						<Divider style={{ width: "100%" }} />
						<TouchableHighlight
							onPress={() => {
								setSelected(sortLabel);
								sheetRef.current.snapTo(1);
								props.onLabelChange(sortLabel);
							}}
							style={{ width: "100%", alignItems: "center" }}
							underlayColor="#FFFFFF11"
						>
							<View style={{ flexDirection: "row", paddingVertical: LABEL_HEIGHT, alignItems: "center" }}>
								<Subheading style={{ color: color }}>{sortLabel}</Subheading>
								<Ionicons name="arrow-down" style={{ marginHorizontal: 2 }} size={16} color={color} />
							</View>
						</TouchableHighlight>
					</View>
				);
			})}
			<View style={{ width: "100%", backgroundColor: colors.card, height: 5 }} />
			<TouchableHighlight
				style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
				onPress={() => {
					sheetRef.current.snapTo(1);
				}}
				underlayColor="#FFFFFF11"
			>
				<Subheading style={{ marginTop: -24, color: colors.caption }}>Cancel</Subheading>
			</TouchableHighlight>
		</View>
	);
	useEffect(() => {
		setVisible(props.visible);
		if (sheetRef.current) {
			if (props.visible) {
				sheetRef.current.snapTo(0);
			} else {
				sheetRef.current.snapTo(1);
			}
		}
	}, [props.visible]);

	return (
		<Portal>
			<TouchableWithoutFeedback
				style={{ display: visible ? "flex" : "none" }}
				onPress={() => {
					sheetRef.current.snapTo(1);
				}}
			>
				<View style={{ flex: 1, display: visible ? "flex" : "none", backgroundColor: "#00000055" }}>
					<BottomSheet
						ref={sheetRef}
						initialSnap={1}
						snapPoints={[330, 0]}
						borderRadius={roundness}
						renderContent={renderContent}
						onCloseEnd={props.onCloseEnd}
					/>
				</View>
			</TouchableWithoutFeedback>
		</Portal>
	);
}
