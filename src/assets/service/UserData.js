import React from "react";

let userData = {
	email: "",
	phoneNo: "",
	firstName: "",
	lastName: "",
};
const setUserData = (email, phoneNo, firstName, lastName) => {
	userData.email = email;
	userData.phoneNo = phoneNo;
	userData.firstName = firstName;
	userData.lastName = lastName;
};

export { userData, setUserData };
