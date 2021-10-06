import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme, useNavigation } from "@react-navigation/native";
import BottomSheet from "reanimated-bottom-sheet";
import { Animated, StyleSheet, View, TouchableHighlight } from "react-native";
import { Button, Caption, Divider, Modal, Portal, Subheading, Text, Title } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExchangeModal(props) {
	const colors = useTheme().colors;
	const roundness = useTheme().roundness;
	const [display, setDisplay] = useState("none");
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const renderContent = () => (
		<View
			style={{
				borderRadius: roundness,
				backgroundColor: colors.background,
			}}
		>
			<TouchableHighlight
				underlayColor="#FFFFFF33"
				onPress={() => {
					navigation.navigate("Buy");
				}}
			>
				<View style={{ flexDirection: "row", padding: 16 }}>
					<MaterialCommunityIcons name="cash-plus" size={50} color={colors.primary} style={{ paddingHorizontal: 8, marginRight: 8 }} />
					<View>
						<Title>Buy</Title>
						<Caption>Buy crypto with your local currency</Caption>
					</View>
				</View>
			</TouchableHighlight>
			<Divider />
			<TouchableHighlight
				underlayColor="#FFFFFF33"
				onPress={() => {
					navigation.navigate("Sell");
				}}
			>
				<View style={{ flexDirection: "row", padding: 16 }}>
					<MaterialCommunityIcons name="cash-minus" size={50} color={colors.primary} style={{ paddingHorizontal: 8, marginRight: 8 }} />
					<View>
						<Title>Sell</Title>
						<Caption>Sell crypto with your local currency</Caption>
					</View>
				</View>
			</TouchableHighlight>
			<Divider />
			<TouchableHighlight
				underlayColor="#FFFFFF33"
				onPress={() => {
					navigation.navigate("Convert");
				}}
			>
				<View style={{ flexDirection: "row", padding: 16 }}>
					<MaterialCommunityIcons name="swap-horizontal-variant" size={50} color={colors.primary} style={{ paddingHorizontal: 8, marginRight: 8 }} />
					<View>
						<Title>Convert</Title>
						<Caption>Support fast conversion between coins</Caption>
					</View>
				</View>
			</TouchableHighlight>
			<Divider />
		</View>
	);

	const sheetRef = useRef(null);

	useEffect(() => {
		if (props.visible) {
			sheetRef.current.snapTo(0);
			setTimeout(() => {
				setDisplay("flex");
			}, 0);
		} else {
			sheetRef.current.snapTo(1);
			setTimeout(() => {
				setDisplay("none");
			}, 100);
		}
	}, [props.visible]);

	return (
		<Animated.View
			style={{
				width: "100%",
				position: "absolute",
				height: "100%",
				zIndex: 0,
				backgroundColor: "#00000055",
				opacity: props.opacityAnim,
				display: display,
				bottom: insets.bottom + 52,
				overflow: "hidden",
			}}
		>
			<BottomSheet
				ref={sheetRef}
				initialSnap={0}
				snapPoints={[270, 0]}
				borderRadius={100}
				renderContent={renderContent}
				enabledGestureInteraction={false}
				enabledInnerScrolling={false}
				enabledBottomInitialAnimation={true}
			/>
		</Animated.View>
	);
}
