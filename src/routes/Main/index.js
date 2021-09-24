import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MarketsScreen from "./markets";
import BalancesScreen from "./balances";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, TouchableWithoutFeedback, View, Animated, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import Appbar from "../../assets/components/Appbar";
import * as Haptics from "expo-haptics";
import { Fragment } from "react";
import { useState } from "react";
import ExchangeModal from "./Exchange/ExchangeModal";

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const Tab = createBottomTabNavigator();
const PlaceHolder = (props) => {
	return <View style={{ flex: 1, backgroundColor: "blue" }} />;
};

export default function MainTabNavigators() {
	const ICON_SIZE = 24;
	const colors = useTheme().colors;
	const [modalVisible, setModalVisible] = useState(false);

	const opacityAnim = useRef(new Animated.Value(1)).current;
	const rotateAnim = useRef(new Animated.Value(1)).current;
	const sizeAnim = useRef(new Animated.Value(1)).current;
	const opacityAnim2 = useRef(new Animated.Value(1)).current;
	const opacityAnim3 = useRef(new Animated.Value(0)).current;

	const AnimateIcon = () => {
		// Animated.sequence([])
		if (!modalVisible) {
			Animated.parallel(
				[
					Animated.spring(rotateAnim, {
						useNativeDriver: true,
						easing: Easing.ease,
						toValue: 0,
						damping: 8,
					}),
					Animated.timing(opacityAnim2, {
						delay: 100,
						useNativeDriver: true,
						toValue: 0,
						duration: 200,
					}),
					Animated.timing(opacityAnim3, {
						delay: 100,
						useNativeDriver: true,
						toValue: 1,
						duration: 200,
					}),
					Animated.sequence([
						Animated.timing(opacityAnim, {
							useNativeDriver: true,
							toValue: 0,
							duration: 100,
						}),
						Animated.timing(opacityAnim, {
							delay: 200,
							useNativeDriver: true,
							toValue: 1,
							duration: 100,
						}),
					]),
					Animated.sequence([
						Animated.timing(sizeAnim, {
							useNativeDriver: true,
							toValue: 0.8,
							duration: 100,
						}),
						Animated.timing(sizeAnim, {
							useNativeDriver: true,
							toValue: 1,
							duration: 100,
						}),
					]),
				],
				{ stopTogether: true }
			).start();
		} else {
			Animated.parallel(
				[
					Animated.spring(rotateAnim, {
						useNativeDriver: true,
						easing: Easing.ease,
						toValue: 1,
						damping: 8,
					}),
					Animated.timing(opacityAnim2, {
						delay: 200,
						useNativeDriver: true,
						toValue: 1,
						duration: 200,
					}),
					Animated.timing(opacityAnim3, {
						delay: 300,
						useNativeDriver: true,
						toValue: 0,
						duration: 200,
					}),
					Animated.sequence([
						Animated.timing(opacityAnim, {
							useNativeDriver: true,
							toValue: 0,
							duration: 100,
						}),
						Animated.timing(opacityAnim, {
							delay: 100,
							useNativeDriver: true,
							toValue: 1,
							duration: 200,
						}),
					]),
					Animated.sequence([
						Animated.timing(sizeAnim, {
							useNativeDriver: true,
							toValue: 0.8,
							duration: 100,
						}),
						Animated.timing(sizeAnim, {
							useNativeDriver: true,
							toValue: 1,
							duration: 100,
						}),
					]),
				],
				{ stopTogether: true }
			).start();
		}
	};

	return (
		<Fragment>
			<SafeAreaView style={{ flex: 0, backgroundColor: colors.card, marginBottom: 0 }} />
			<SafeAreaView style={{ flex: 1 }}>
				<Tab.Navigator
					screenOptions={{
						tabBarShowLabel: false,
						tabBarActiveTintColor: "#FF0000",
						header: ({ layout, navigation, options, route }) => {
							return <Appbar />;
						},
						tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.background },
					}}
				>
					<Tab.Screen
						name="Markets"
						component={MarketsScreen}
						options={{
							tabBarIcon: ({ focused, color, size }) => {
								return <AnimatedIcon name="stats-chart" color={focused ? colors.active : colors.inactive} size={ICON_SIZE} style={{ opacity: opacityAnim2 }} />;
							},
						}}
						listeners={({ navigation }) => ({
							tabPress: (e) => {
								e.preventDefault();
								if (!modalVisible) {
									navigation.navigate("Markets");
								}
							},
						})}
					/>
					<Tab.Screen
						name="Exchange"
						component={PlaceHolder}
						options={{
							tabBarIcon: ({ focused, color, size }) => {
								return (
									<TouchableWithoutFeedback
										onPress={() => {
											setTimeout(() => {
												setModalVisible(!modalVisible);
											}, 200);
											AnimateIcon();
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
										}}
									>
										<View style={{ justifyContent: "center", alignItems: "center" }}>
											<Animated.View
												style={{
													backgroundColor: colors.primary,
													width: 30,
													height: 30,
													transform: [{ rotate: rotateAnim }, { scale: sizeAnim }],
													borderRadius: useTheme().roundness,
													position: "absolute",
													shadowColor: "#000000",
													shadowOpacity: 0.5,
													shadowOffset: { height: 2, width: 2 },
													shadowRadius: 4,
												}}
											/>
											<AnimatedIcon
												name={modalVisible ? "close" : "swap-horizontal"}
												size={ICON_SIZE}
												color={colors.background}
												style={{ opacity: opacityAnim }}
											/>
										</View>
									</TouchableWithoutFeedback>
								);
							},
						}}
						listeners={({ navigation }) => ({
							tabPress: (e) => {
								e.preventDefault();
							},
						})}
					/>
					<Tab.Screen
						name="Balances"
						component={BalancesScreen}
						options={{
							tabBarIcon: ({ focused, color, size }) => {
								return <AnimatedIcon name="wallet" color={focused ? colors.active : colors.inactive} size={ICON_SIZE} style={{ opacity: opacityAnim2 }} />;
							},
						}}
						listeners={({ navigation }) => ({
							tabPress: (e) => {
								e.preventDefault();
								if (!modalVisible) {
									navigation.navigate("Balances");
								}
							},
						})}
					/>
				</Tab.Navigator>
			</SafeAreaView>
			<ExchangeModal visible={modalVisible} opacityAnim={opacityAnim3}/>
			<SafeAreaView style={{ flex: 0, backgroundColor: colors.background, marginTop: -55 }} />
		</Fragment>
	);
}
