import React, { useEffect, useState } from "react";
import { Keyboard, SafeAreaView, View, TouchableWithoutFeedback } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Caption, IconButton, Subheading, TextInput, Title, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { loginWithEmailAndPassword } from "../../assets/service/Firebase";

export default function Login({ navigation }) {
	const colors = useTheme().colors;
	const [email, setEmail] = useState("");
	const [pwd, setPwd] = useState("");
	const [phoneNo, setPhoneNo] = useState("+673 ");
	const [logInPhone, setLogInPhone] = useState(false);
	const [pwdVisible, setPwdVisible] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		setError("");
	}, [pwd, email, phoneNo]);

	return (
		<TouchableWithoutFeedback
			onPress={() => {
				Keyboard.dismiss();
			}}
			accessible={false}
		>
			<SafeAreaView style={{ flex: 1, margin: 16 }}>
				{/* Appbar */}
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<IconButton
						icon="close"
						color={colors.caption}
						onPress={() => {
							navigation.navigate("MainTab");
						}}
						style={{ marginLeft: -8 }}
					/>
					<TouchableOpacity
						onPress={() => {
							navigation.navigate("Register");
						}}
						style={{ paddingHorizontal: 4 }}
					>
						<Subheading style={{ color: colors.primary }}>Register</Subheading>
					</TouchableOpacity>
				</View>
				<Title style={{ fontSize: 24, marginTop: 24, marginLeft: 4 }}>Log In</Title>
				<View style={{ alignItems: "flex-end" }}>
					<TouchableOpacity
						labelStyle={{ fontSize: 12 }}
						onPress={() => {
							setLogInPhone(!logInPhone);
						}}
					>
						<Caption style={{ color: colors.primary, marginRight: 4 }}>{logInPhone ? "Login With Email" : "Login With Mobile"}</Caption>
					</TouchableOpacity>
				</View>
				{!logInPhone && (
					<TextInput
						label="Email"
						keyboardAppearance="dark"
						keyboardType="email-address"
						autoCompleteType="email"
						textContentType="emailAddress"
						style={{ marginVertical: 8 }}
						value={email}
						onChangeText={(email) => {
							setEmail(email);
						}}
						right={email && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setEmail("")} />}
					/>
				)}
				{logInPhone && (
					<TextInput
						label="Phone No"
						keyboardAppearance="dark"
						keyboardType="number-pad"
						autoCompleteType="tel"
						textContentType="telephoneNumber"
						style={{ marginVertical: 8 }}
						value={phoneNo}
						onChangeText={(phoneNo) => {
							if (phoneNo.length > 4) {
								setPhoneNo(phoneNo);
							}
						}}
						right={phoneNo.length > 5 && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setPhoneNo("+673 ")} />}
					/>
				)}
				<TextInput
					label="Password"
					keyboardAppearance="dark"
					keyboardType="ascii-capable"
					autoCompleteType="password"
					textContentType="password"
					style={{ marginVertical: 8 }}
					value={pwd}
					onChangeText={(pwd) => {
						setPwd(pwd);
					}}
					secureTextEntry={!pwdVisible}
					right={
						// <View>
						pwd && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setPwd("")} />
						// <TextInput.Icon name={pwdVisible ? "eye-outline" : "eye-off-outline"} color={colors.caption} onPress={() => setPwdVisible(!pwdVisible)} />
						// </View>
					}
				/>
				<View style={{ flexDirection: "row", justifyContent: "flex-start", marginTop: 12 }}>
					<TouchableOpacity>
						<Caption style={{ color: colors.primary, marginLeft: 4 }}>Forgot password?</Caption>
					</TouchableOpacity>
				</View>
				<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
					<IconButton
						style={{ backgroundColor: colors.primary, borderRadius: useTheme().roundness }}
						size={36}
						icon="arrow-right"
						color={colors.background}
						onPress={async() => {
							await loginWithEmailAndPassword(email, pwd)
								.then((result) => {
                                    navigation.navigate("MainTab", { successMsg: "User registered" });
                                })
								.catch(setError);
						}}
					/>
				</View>
				<View style={{ justifyContent: "center", alignItems: "center", marginTop: 24 }}>
					<Caption style={{ color: colors.error }}>{error}</Caption>
				</View>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}
