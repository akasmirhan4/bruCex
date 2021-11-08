import { Ionicons } from "@expo/vector-icons";
import { useTheme, useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, SafeAreaView, ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator, Button, Caption, Divider, IconButton, ProgressBar, Subheading, TextInput, Title } from "react-native-paper";
import { auth, firebaseConfig, getPhoneNo, validateSendEmail } from "../../assets/service/Firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

export default function Authenticate({ navigation }) {
	const colors = useTheme().colors;
	const [emailSent, setEmailSent] = useState(false);
	const [SMSSent, setSMSSent] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isPhoneVerified, setIsPhoneVerified] = useState(false);
	const [email, setEmail] = useState("");
	const [phoneNo, setPhoneNo] = useState("");
	const isFocus = useIsFocused();
	const recaptchaVerifier = useRef(null);
	const [verificationId, setVerificationId] = useState();
	const [verificationCode, setVerificationCode] = useState();
	const [processingSMS, setProcessingSMS] = useState(false);
	const SMSCodeInput = useRef(null);
	const [errorMsg, setErrorMsg] = useState("");
	const attemptInvisibleVerification = false;

	let checkEmailVerified = null;
	let SMSResend = null;

	const checkSMSCode = async (SMSCode) => {
		if (!!verificationId) {
			try {
				const credential = auth.PhoneAuthProvider.credential(verificationId, SMSCode);
				await auth()
					.currentUser.linkWithCredential(credential)
					.then(() => {
						setIsPhoneVerified(true);
					});
			} catch (err) {
				console.error(err.message);
			}
		} else {
			setVerificationCode("");
			setErrorMsg("Verification missing, please press the Send SMS Button");
		}
		setProcessingSMS(false);
	};

	useEffect(() => {
		setIsEmailVerified(auth().currentUser.emailVerified);
		setEmail(auth().currentUser.email);

		(async () => {
			setIsPhoneVerified(!!auth().currentUser.phoneNumber);
			await Promise.all([getPhoneNo(), validateSendEmail()]).then((results) => {
				setPhoneNo(results[0]);
				console.log(results);
				setEmailSent(!results[1]);
			});
		})();

		if (!isEmailVerified) {
			checkEmailVerified = setInterval(async () => {
				await auth()
					.currentUser.reload()
					.catch((error) => {
						if (error.code == "auth/network-request-failed") {
							console.log(error.code);
						} else {
							console.warn(error.code);
						}
					});
				const emailVerified = auth().currentUser.emailVerified;
				setIsEmailVerified(emailVerified);
				if (emailVerified) {
					clearInterval(checkEmailVerified);
				}
			}, 3000);
		}

		return () => {
			clearInterval(checkEmailVerified);
			clearInterval(SMSResend);
		};
	}, []);

	return (
		<TouchableWithoutFeedback
			onPress={() => {
				Keyboard.dismiss();
			}}
		>
			<ScrollView contentContainerStyle={{ paddingBottom: 300 }}>
				<SafeAreaView style={{ flex: 1, margin: 16 }}>
					<FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} attemptInvisibleVerification={true | false} />
					{/* App bar */}
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
						<IconButton
							icon="close"
							color={colors.caption}
							onPress={() => {
								navigation.navigate("MainTab");
							}}
							style={{ marginLeft: -8 }}
						/>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, marginLeft: 4, marginBottom: 8 }}>
						<Title style={{ fontSize: 24, marginRight: 16 }}>Identity Verification</Title>
						<Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
					</View>
					<ProgressBar style={{ marginBottom: 24 }} progress={(1 + isPhoneVerified + isEmailVerified) / 3} />
					{/* Main */}
					<View style={{ flexDirection: "row" }}>
						<Subheading children="Email Authentication " />
						<Subheading style={{ color: isEmailVerified ? "green" : colors.error }} children={isEmailVerified ? "(Verified)" : "(Unverified)"} />
					</View>
					<View style={{ flexDirection: "row", marginVertical: 8 }}>
						<View style={{ justifyContent: "flex-end", marginRight: 16 }}>
							<Button
								contentStyle={{ width: 256, height: 58 }}
								onPress={() => {
									auth().currentUser.sendEmailVerification();
									setEmailSent(true);
								}}
								mode="outlined"
								loading={emailSent && !isEmailVerified}
								disabled={isEmailVerified || emailSent}
								children={
									isEmailVerified ? <Ionicons name="checkmark-circle-outline" size={36} color="green" /> : emailSent ? "Check Your Email" : "Send Email"
								}
							/>
						</View>
					</View>
					<Divider style={{ marginVertical: 16 }} />
					<View style={{ flexDirection: "row" }}>
						<Subheading children="Phone No Authentication " />
						<Subheading style={{ color: isPhoneVerified ? "green" : colors.error }} children={isPhoneVerified ? "(Verified)" : "(Unverified)"} />
					</View>
					{!isPhoneVerified ? (
						<View style={{ flexDirection: "row", marginVertical: 8 }}>
							<View style={{ marginRight: 16, flex: 1, marginTop: -4 }}>
								<TextInput
									ref={SMSCodeInput}
									label="SMS Code"
									keyboardAppearance="dark"
									keyboardType="number-pad"
									autoCompleteType="cc-number"
									textContentType="oneTimeCode"
									value={verificationCode}
									onChangeText={(_SMSCode) => {
										if (_SMSCode.length < 6) {
											setVerificationCode(_SMSCode);
										} else if (_SMSCode.length == 6) {
											setProcessingSMS(true);
											setVerificationCode(_SMSCode);
											checkSMSCode(_SMSCode);
											Keyboard.dismiss();
										}
									}}
									style={{ width: 200, fontSize: 24 }}
									mode="outlined"
									disabled={processingSMS || isPhoneVerified}
									// error={errors?.firstName.length}
								/>
								{/* {!!errors?.firstName?.length &&
								errors?.firstName?.map((error, index) => {
									return <HelperText type="error" key={index} children={error} />;
								})} */}
							</View>
							<View style={{ justifyContent: "center", alignItems: "center", marginRight: 16 }}>
								<Button
									contentStyle={{ width: 124, height: 58, alignItems: "center", justifyContent: "center" }}
									onPress={async () => {
										// The FirebaseRecaptchaVerifierModal ref implements the
										// FirebaseAuthApplicationVerifier interface and can be
										// passed directly to `verifyPhoneNumber`.
										try {
											const phoneProvider = new auth.PhoneAuthProvider();
											const verificationId = await phoneProvider.verifyPhoneNumber(phoneNo, recaptchaVerifier.current);
											setVerificationId(verificationId);
											console.log("Verification code has been sent to your phone.");
											setSMSSent(true);
											SMSCodeInput.current.focus();
											SMSResend = setInterval(() => {
												setSMSSent(false);
											}, 30000);
										} catch (err) {
											setErrorMsg(err.code);
										}
									}}
									mode="outlined"
									disabled={isPhoneVerified || SMSSent || processingSMS}
									children={
										isPhoneVerified ? (
											<Ionicons name="checkmark-circle-outline" size={36} color="green" />
										) : SMSSent ? (
											<ActivityIndicator size={24} color={colors.caption} />
										) : (
											"Send SMS"
										)
									}
								/>
							</View>
						</View>
					) : (
						<View>
							<Button
								mode="outlined"
								style={{ width: 256, height: 58, marginTop: 12 }}
								disabled={true}
								children={<Ionicons name="checkmark-circle-outline" size={36} color="green" />}
							/>
						</View>
					)}

					<View style={{ marginTop: 24, alignItems: "center" }}>
						<Caption style={{ color: colors.error }}>{errorMsg}</Caption>
					</View>
				</SafeAreaView>
			</ScrollView>
		</TouchableWithoutFeedback>
	);
}
