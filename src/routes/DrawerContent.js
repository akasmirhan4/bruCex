import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, useNavigation, DrawerActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Caption, Divider, IconButton, Subheading, Title } from "react-native-paper";
import SuccessModal from "../assets/components/SuccessModal";
import * as Clipboard from "expo-clipboard";
import { TouchableOpacity } from "react-native-gesture-handler";
import { auth, firestore } from "../assets/service/Firebase";
import * as Haptics from "expo-haptics";

export default function DrawerContent(props) {
	const [lightMode, setLightMode] = useState(false);
	const [viewProfile, setViewProfile] = useState(false);
	const [modalMsg, setModalMsg] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [userData, setUserData] = useState(null);
	const colors = useTheme().colors;
	const { width, height } = Dimensions.get("window");
	const navigation = useNavigation();
	const menuDetails = [
		{ label: "Notifications", icon: "bell-ring-outline", authNeeded: true },
		{ label: "Payment Methods", icon: "currency-usd-circle-outline", authNeeded: true },
		{ label: "Security", icon: "security", authNeeded: true },
		{ label: "Settings", icon: "tune" },
		{},
		{ label: "Referral", icon: "account-multiple-plus-outline", authNeeded: true },
		{ label: "Help & Support", icon: "help-rhombus-outline" },
		{ label: "Share BruCex App", icon: "share-outline" },
	];

	useEffect(() => {
		auth().onAuthStateChanged(async (user) => {
			if (user) {
				setUserLoggedIn(true);
				await firestore
					.collection("users")
					.doc(user.uid)
					.get()
					.then((user) => {
						setUserData(user.data());
					});
			} else {
				setUserLoggedIn(false);
			}
		});
	}, []);

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
				<ScrollView>
					<View style={{ minHeight: height - 100 }}>
						<View style={{ flex: 1 }}>
							{/* Top Icons */}
							<View style={{ flexDirection: "row" }}>
								<View style={{ flex: 1 }}>
									<IconButton
										icon="arrow-left"
										color={colors.caption}
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
											navigation.dispatch(DrawerActions.closeDrawer());
										}}
									/>
								</View>
								<View style={{ flex: 1, alignItems: "flex-end" }}>
									<IconButton
										icon={lightMode ? "lightbulb-on" : "lightbulb-on-outline"}
										color={colors.caption}
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
											setLightMode(!lightMode);
										}}
									/>
								</View>
							</View>
							{/* User details */}
							{userLoggedIn && (
								<TouchableHighlight
									onPress={() => {
										navigation.navigate("Authenticate");
									}}
									underlayColor="#FFFFFF11"
									style={{ paddingVertical: 16 }}
								>
									<View style={{ marginLeft: 16, flexDirection: "row" }}>
										<View>
											<View style={{ flexDirection: "row", alignItems: "center" }}>
												<Title style={{ width: 140 }}>
													{viewProfile ? userData?.phoneNo : `+673 *** ***${userData?.phoneNo[userData?.phoneNo.length - 1]}`}
												</Title>
												<IconButton
													icon={viewProfile ? "eye-off-outline" : "eye-outline"}
													color={colors.caption}
													onPress={() => {
														Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
														setViewProfile(!viewProfile);
													}}
													size={16}
												/>
											</View>
											<View style={{ flexDirection: "row", alignItems: "center" }}>
												<Caption>{`ID: ${userData?.userID}`}</Caption>
												<IconButton
													icon="content-copy"
													color={colors.caption}
													onPress={() => {
														if (userData?.userID) {
															Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
															Clipboard.setString(userData?.userID.toString());
															setModalMsg("userID Copied");
															setModalVisible(true);
														}
													}}
													size={16}
												/>
											</View>
										</View>
										<View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
											<View
												style={{
													alignItems: "center",
													width: 160,
													backgroundColor: auth().currentUser.emailVerified && !!auth().currentUser.phoneNumber ? "green" : colors.error,
													borderTopLeftRadius: "50%",
													borderBottomLeftRadius: "50%",
													justifyContent: "center",
													padding: 16,
												}}
											>
												{auth().currentUser.emailVerified && !!auth().currentUser.phoneNumber ? (
													<Caption style={{ marginRight: -16, textAlign: "right", color: colors.text }} children={"Verified Account"} />
												) : (
													<Caption style={{ marginRight: -16, textAlign: "right", color: colors.text }} children={"Unverified Account"} />
												)}
											</View>
										</View>
									</View>
								</TouchableHighlight>
							)}
							{!userLoggedIn && (
								<TouchableOpacity
									style={{ backgroundColor: colors.background, padding: 16 }}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
										navigation.navigate("AuthStack");
									}}
								>
									<Title>Login or Register</Title>
								</TouchableOpacity>
							)}
							{/* Start Menu */}
							<View style={{ marginBottom: 16 }}>
								{menuDetails.map((menuDetail, index) => {
									if (!!menuDetail.label) {
										if (!menuDetail.authNeeded || userLoggedIn) {
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
														<View style={{ flexDirection: "row", alignItems: "center" }}>
															{menuDetail.label == "Notifications" && (
																<View style={{ borderRadius: "50%", width: 10, height: 10, backgroundColor: colors.error, marginRight: 12 }} />
															)}
															<MaterialCommunityIcons name="chevron-right" color={colors.caption} size={24} />
														</View>
													</View>
												</TouchableHighlight>
											);
										}
									} else {
										return <Divider key={index} />;
									}
								})}
							</View>
							{/* End Menu */}
							{userLoggedIn && (
								<Button
									mode="contained"
									style={{ marginHorizontal: 16 }}
									onPress={async () => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
										await auth().signOut();
									}}
								>
									Log Out
								</Button>
							)}
						</View>
						<View style={{ flex: 0 }}>
							<Caption style={{ marginHorizontal: 16, textAlign: "center", marginTop: 16 }}>
								Please do not disclose SMS and Google Authentication codes to anyone, including BruCex Customer Support
							</Caption>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}
