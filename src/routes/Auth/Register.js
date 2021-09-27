import React, { useEffect, useState } from "react";
import { Keyboard, SafeAreaView, View, TouchableWithoutFeedback, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Caption, Divider, HelperText, IconButton, Subheading, TextInput, Title, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { auth, loginWithEmailAndPassword, registerNewUser } from "../../assets/service/Firebase";
import { setUserData } from "../../assets/service/UserData";

export default function Register({ navigation }) {
	const colors = useTheme().colors;
	const [email, setEmail] = useState("");
	const [pwd, setPwd] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [checkPwd, setCheckPwd] = useState("");
	const [phoneNo, setPhoneNo] = useState("+673 ");
	const [logInPhone, setLogInPhone] = useState(false);
	const [pwdVisible, setPwdVisible] = useState(false);
	const [errors, setErrors] = useState(null);

	useEffect(() => {
		setErrors(null);
	}, [pwd, email, checkPwd, phoneNo]);

	return (
		<TouchableWithoutFeedback
			onPress={() => {
				Keyboard.dismiss();
			}}
		>
			<ScrollView contentContainerStyle={{ paddingBottom: 300 }}>
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
								navigation.navigate("Login");
							}}
							style={{ paddingHorizontal: 4 }}
						>
							<Subheading style={{ color: colors.primary }}>Login</Subheading>
						</TouchableOpacity>
					</View>
					<Title style={{ fontSize: 24, marginTop: 24, marginLeft: 4, marginBottom: 24 }}>Register</Title>
					<View style={{ flexDirection: "row", marginVertical: 8 }}>
						<View style={{ flex: 1, marginRight: 16 }}>
							<TextInput
								label="First Name"
								keyboardAppearance="dark"
								keyboardType="ascii-capable"
								autoCompleteType="name"
								textContentType="givenName"
								value={firstName}
								onChangeText={setFirstName}
								error={errors?.firstName.length}
								right={firstName && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setFirstName("")} />}
							/>
							{!!errors?.firstName?.length &&
								errors?.firstName?.map((error, index) => {
									return <HelperText type="error" key={index} children={error} />;
								})}
						</View>
						<View style={{ flex: 1 }}>
							<TextInput
								label="Last Name"
								keyboardAppearance="dark"
								keyboardType="ascii-capable"
								autoCompleteType="name"
								textContentType="familyName"
								value={lastName}
								onChangeText={setLastName}
								error={errors?.lastName.length}
								right={lastName && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setLastName("")} />}
							/>
							{!!errors?.lastName?.length &&
								errors?.lastName?.map((error, index) => {
									return <HelperText type="error" key={index} children={error} />;
								})}
						</View>
					</View>
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
						error={errors?.email.length}
						right={email && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setEmail("")} />}
					/>
					{!!errors?.email?.length &&
						errors?.email?.map((error, index) => {
							return <HelperText type="error" key={index} children={error} />;
						})}
					<TextInput
						label="Password"
						keyboardAppearance="dark"
						keyboardType="ascii-capable"
						autoCompleteType="password"
						textContentType="newPassword"
						style={{ marginVertical: 8 }}
						value={pwd}
						onChangeText={(pwd) => {
							setPwd(pwd);
						}}
						error={errors?.password.length}
						secureTextEntry={!pwdVisible}
						right={pwd && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setPwd("")} />}
					/>
					{!!errors?.password?.length &&
						errors?.password?.map((error, index) => {
							return <HelperText type="error" key={index} children={error} />;
						})}
					<TextInput
						label="Check Password"
						keyboardAppearance="dark"
						keyboardType="ascii-capable"
						autoCompleteType="password"
						textContentType="newPassword"
						style={{ marginVertical: 8 }}
						value={checkPwd}
						onChangeText={(pwd) => {
							setCheckPwd(pwd);
						}}
						error={errors?.checkPassword.length}
						secureTextEntry={!pwdVisible}
						right={checkPwd && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setCheckPwd("")} />}
					/>
					{!!errors?.checkPassword?.length &&
						errors?.checkPassword?.map((error, index) => {
							return <HelperText type="error" key={index} children={error} />;
						})}
					<Divider style={{ marginVertical: 16 }} />
					<TextInput
						label="Phone No"
						keyboardAppearance="dark"
						keyboardType="number-pad"
						autoCompleteType="tel"
						textContentType="telephoneNumber"
						style={{ marginVertical: 8 }}
						value={phoneNo}
						error={errors?.phoneNo.length}
						onChangeText={(phoneNo) => {
							if (phoneNo.length > 4) {
								setPhoneNo(phoneNo);
							}
						}}
						right={phoneNo.length > 5 && <TextInput.Icon name="close-circle" color={colors.caption} onPress={() => setPhoneNo("+673 ")} />}
					/>
					{!!errors?.phoneNo?.length &&
						errors?.phoneNo?.map((error, index) => {
							console.log("index", index);
							console.log(errors?.phoneNo.length);
							return <HelperText type="error" key={index} children={error} />;
						})}
					<View style={{ flexDirection: "row", justifyContent: "flex-start", marginTop: 12 }}></View>
					<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
						<IconButton
							style={{ backgroundColor: colors.primary, borderRadius: useTheme().roundness }}
							size={36}
							icon="arrow-right"
							color={colors.background}
							onPress={async () => {
								setErrors(null);
								await registerNewUser(firstName, lastName, email, pwd, checkPwd, phoneNo)
									.then((result) => {
										console.log("uid: ", auth().currentUser.uid);
										setUserData(email, phoneNo, firstName, lastName);
										navigation.navigate("MainTab", { successMsg: "User registered" });
									})
									.catch((errors) => {
										console.log(errors);
										setErrors(errors);
										// setError;
									});
							}}
						/>
					</View>

					{!!errors?.register?.length}
					<View style={{ justifyContent: "center", alignItems: "center", marginTop: 24 }}>
						{!!errors?.register?.length && errors?.register?.map((error, index) => <Caption style={{ color: colors.error }} key={index} children={error} />)}
					</View>
				</SafeAreaView>
			</ScrollView>
		</TouchableWithoutFeedback>
	);
}
