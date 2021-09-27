import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigators from "./Main";
import { createStackNavigator } from "@react-navigation/stack";
import BuyScreen from "./Main/Exchange/buy";
import SellScreen from "./Main/Exchange/sell";
import ConvertScreen from "./Main/Exchange/convert";
import { Dimensions, SafeAreaView, ScrollView, View } from "react-native";
import { Button, Caption, Divider, IconButton, Modal, Portal, Subheading, Title } from "react-native-paper";
import { useTheme, useNavigation, DrawerActions } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableHighlight } from "react-native-gesture-handler";
import SuccessModal from "../assets/components/SuccessModal";

let AppDrawer = createDrawerNavigator();
let RootStack = createStackNavigator();

function IndexDrawerNavigation(props) {
	const { width } = Dimensions.get("window");
	const [lightMode, setLightMode] = useState(false);
	const [viewProfile, setViewProfile] = useState(false);
	const [phoneNo, setPhoneNo] = useState("+673 123 4567");
	const [userID, setUserID] = useState("12345678");
	const [modalMsg, setModalMsg] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const colors = useTheme().colors;
	const navigation = useNavigation();
	const menuDetails = [
		{ label: "Notifications", icon: "bell-ring-outline" },
		{ label: "Payment Methods", icon: "currency-usd-circle-outline" },
		{ label: "Security", icon: "security" },
		{ label: "Settings", icon: "tune" },
		{},
		{ label: "Referral", icon: "account-multiple-plus-outline" },
		{ label: "Help & Support", icon: "help-rhombus-outline" },
		{ label: "Share BruCex App", icon: "share-outline" },
	];

	return (
		<AppDrawer.Navigator
			{...props}
			drawerContent={() => {
				return (
					<View>
						<SuccessModal
							msg={modalMsg}
							visible={modalVisible}
							onEnd={() => {
								setModalVisible(false);
							}}
						/>
						<SafeAreaView>
							<ScrollView style={{ minHeight: "100%" }}>
								{/* Top Icons */}
								<View style={{ flexDirection: "row" }}>
									<View style={{ flex: 1 }}>
										<IconButton
											icon="arrow-left"
											color={colors.caption}
											onPress={() => {
												navigation.dispatch(DrawerActions.closeDrawer());
											}}
										/>
									</View>
									<View style={{ flex: 1, alignItems: "flex-end" }}>
										<IconButton icon={lightMode ? "lightbulb-on" : "lightbulb-on-outline"} color={colors.caption} onPress={() => setLightMode(!lightMode)} />
									</View>
								</View>
								{/* User details */}
								<View style={{ marginHorizontal: 16 }}>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Title style={{ width: 140 }}>{viewProfile ? phoneNo : `+673 *** ***${phoneNo[phoneNo.length - 1]}`}</Title>
										<IconButton
											icon={viewProfile ? "eye-off-outline" : "eye-outline"}
											color={colors.caption}
											onPress={() => setViewProfile(!viewProfile)}
											size={16}
										/>
									</View>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Caption>{`ID: ${userID}`}</Caption>
										<IconButton
											icon="content-copy"
											color={colors.caption}
											onPress={() => {
												Clipboard.setString(userID);
												setModalMsg("userID Copied");
												setModalVisible(true);
											}}
											size={16}
										/>
									</View>
								</View>
								{/* Start Menu */}
								<View style={{ marginVertical: 16 }}>
									{menuDetails.map((menuDetail, index) => {
										if (!!menuDetail.label) {
											return (
												<TouchableHighlight
													key={index}
													onPress={() => {
														console.log(menuDetail.label);
													}}
													style={{ padding: 16 }}
													underlayColor="#FFFFFF11"
												>
													<View style={{ flexDirection: "row", alignItems: "center" }}>
														<View style={{ width: 40, justifyContent: "center", alignItems: "flex-start" }}>
															<MaterialCommunityIcons name={menuDetail.icon} color={colors.caption} size={24} />
														</View>
														<Subheading style={{ flex: 1 }}>{menuDetail.label}</Subheading>
														<View>
															<MaterialCommunityIcons name="chevron-right" color={colors.caption} size={24} />
														</View>
													</View>
												</TouchableHighlight>
											);
										} else {
											return <Divider key={index} />;
										}
									})}
								</View>
								{/* End Menu */}
								<Button
									mode="contained"
									style={{ marginHorizontal: 16 }}
									onPress={() => {
										console.log("Log Out");
									}}
								>
									Log Out
								</Button>
								<Caption style={{ marginHorizontal: 16, textAlign: "center", marginTop: 16 }}>
									Please do not disclose SMS and Google Authentication codes to anyone, including BruCex Customer Support
								</Caption>
							</ScrollView>
						</SafeAreaView>
					</View>
				);
			}}
			screenOptions={{ drawerStyle: { width: width } }}
		>
			<AppDrawer.Screen name="MainTab" component={MainTabNavigators} options={{ headerShown: false }} />
		</AppDrawer.Navigator>
	);
}

export default function RootStackNavigation(props) {
	return (
		<RootStack.Navigator {...props}>
			<RootStack.Screen name="AppDrawer" component={IndexDrawerNavigation} options={{ headerShown: false }} />
			<RootStack.Screen name="Buy" component={BuyScreen} options={{ headerShown: true }} />
			<RootStack.Screen name="Sell" component={SellScreen} options={{ headerShown: true }} />
			<RootStack.Screen name="Convert" component={ConvertScreen} options={{ headerShown: true }} />
		</RootStack.Navigator>
	);
}
