import React from "react";
import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";
import * as Crypto from "expo-crypto";

const firebaseConfig = {
	apiKey: "AIzaSyBxE0432ZP7t0LzvKXTk08awGzO8im2Y94",
	authDomain: "brucex-app.firebaseapp.com",
	projectId: "brucex-app",
	storageBucket: "brucex-app.appspot.com",
	messagingSenderId: "521847589442",
	appId: "1:521847589442:web:982fb2269d9b2de4e23bdb",
	measurementId: "G-8SXTFBRHQ1",
	// databaseURL: "https://guru-planner-app-default-rtdb.asia-southeast1.firebasedatabase.app",
};

if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

// Initialize Cloud Functions through Firebase
var functions = firebase.app().functions("asia-southeast1");
let firestore = firebase.app().firestore();
let auth = firebase.auth;

const loginWithEmailAndPassword = async (email, password) => {
	return new Promise((resolve, reject) => {
		if (!email) {
			reject("Enter your email");
		}
		if (!password) {
			reject("Enter your password");
		}
		if (password.length < 8) {
			reject("The password is too short");
		}
		auth()
			.signInWithEmailAndPassword(email, password)
			.then(resolve)
			.catch((error) => {
				if (error.code == "auth/internal-error") {
					reject("Invalid login details");
				} else if (error.code == "auth/user-not-found") {
					reject("Invalid login details");
				} else if (error.code == "auth/wrong-password") {
					reject("Invalid login details");
				} else if (error.code == "auth/too-many-requests") {
					reject("Too many attempted requests. Please try again later.");
				} else {
					console.log(error.code);
					console.log("unsure error code");
					reject(error.code);
				}
			});
	});
};

const registerNewUser = (firstName, lastName, email, password, checkPassword, phoneNo) => {
	const EMAILREGEX =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return new Promise(async (resolve, reject) => {
		let errors = {
			firstName: [],
			lastName: [],
			email: [],
			password: [],
			checkPassword: [],
			phoneNo: [],
			register: [],
		};
		console.log(firstName, lastName, email, password, checkPassword, phoneNo);
		if (!firstName) {
			errors.firstName.push("Enter your first name");
		}
		if (!lastName) {
			errors.lastName.push("Enter your last name");
		}
		if (!email) {
			errors.email.push("Enter your email");
		} else {
			if (!EMAILREGEX.test(email)) {
				errors.email.push("Enter a valid email");
			}
		}
		if (!password) {
			errors.password.push("Enter your password");
		} else if (password.length < 8) {
			errors.password.push("The password is too short");
		} else if (password !== checkPassword) {
			errors.password.push("Password and check password not the same");
			errors.checkPassword.push("Password and check password not the same");
		}
		if (!checkPassword) {
			errors.checkPassword.push("Enter your check password");
		}
		if (phoneNo.length <= 5) {
			errors.phoneNo.push("Enter your phoneNo");
		} else {
			const cleanPhoneNumber = phoneNo.replace(/[^0-9]/g, "");
			if (cleanPhoneNumber.length !== 10) {
				errors.phoneNo.push("Invalid phone number");
			}
		}
		if (errors.email.length + errors.password.length + errors.checkPassword.length + errors.phoneNo.length) {
			reject(errors);
		} else {
			await auth()
				.createUserWithEmailAndPassword(email, password)
				.then(async (userCredential) => {
					console.log("im in!");
					const uid = userCredential.user.uid;
					const hashedPwd = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
					console.log(hashedPwd);
					await firestore
						.collection("users")
						.doc(uid)
						.set({
							firstName,
							lastName,
							userID: generateID(),
							email,
							phoneNo,
							dateRegistered: new Date(),
							emailTimeOut: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
						});
					console.log("register successful");
					resolve(userCredential);
					auth().currentUser.sendEmailVerification();
				})
				.catch((error) => {
					if (error.code == "auth/email-already-in-use") {
						errors.register.push("Email already registered");
						reject(errors);
					} else {
						console.warn(error);
					}
				});
		}
		// auth()
		// 	.signInWithEmailAndPassword(email, password)
		// 	.then(resolve)
		// 	.catch((error) => {
		// 		if (error.code == "auth/internal-error") {
		// 			reject("Invalid login details (Register if you are new)");
		// 		} else {
		// 			console.log("idk");
		// 		}
		// 	});
	});
};

const getPhoneNo = () => {
	return new Promise(async (resolve, reject) => {
		await firestore
			.collection("users")
			.doc(auth().currentUser.uid)
			.get()
			.then((user) => {
				resolve(user.data().phoneNo);
			})
			.catch(reject);
	});
};

const validateSendEmail = () => {
	return new Promise(async (resolve, reject) => {
		await firestore
			.collection("users")
			.doc(auth().currentUser.uid)
			.get()
			.then((user) => {
				resolve(new Date(user.data().emailTimeOut.seconds * 1000) < new Date());
			})
			.catch(reject);
	});
};

export { firebaseConfig, functions, firestore, auth, loginWithEmailAndPassword, registerNewUser, getPhoneNo, validateSendEmail };

const generateID = () => {
	let result = new Date().valueOf() - new Date("June 6, 1997 00:00:00").valueOf();
	let resultStr = result.toString();
	let result2Str = `${resultStr[0]}${resultStr[1]}${resultStr[2]}${resultStr[resultStr.length - 1]}${resultStr[resultStr[resultStr.length - 2]]}${
		resultStr[resultStr.length - 3]
	}${resultStr[resultStr.length - 4]}0`;

	return parseInt(result2Str);
};

