import React from "react";
import firebase from "firebase";
import "firebase/functions";
import "firebase/firestore";

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

export { firebaseConfig, functions, firestore, auth };