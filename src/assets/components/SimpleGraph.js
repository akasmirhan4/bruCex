import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import Expo2DContext from "expo-2d-context";
import { GLView } from "expo-gl";

export default function SimpleGraph(props) {
	const colors = useTheme().colors;
	const dayPrices = props.dayPrices.map((dayPrice) => Number(dayPrice));
	const maxPrice = Math.max(...dayPrices);
	const minPrice = Math.min(...dayPrices);
	const priceRange = maxPrice - minPrice;
	const HEIGHT = 100;
	const WIDTH = 500;
	console.log("dayPrices");
	const interPolatedY = dayPrices.map((hourPrice) => (1 - (hourPrice - minPrice) / priceRange) * HEIGHT);
	console.log(interPolatedY);
	const color = dayPrices[0] < dayPrices[dayPrices.length - 1] ? "green" : "red";
	console.log(dayPrices[0], dayPrices[dayPrices.length - 1], dayPrices[0] < dayPrices[dayPrices.length - 1]);
	const dx = WIDTH / (interPolatedY.length - 1);

	const _onGLContextCreate = (gl) => {
		let x = 0;
		var ctx = new Expo2DContext(gl);
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x, interPolatedY[0]);
		ctx.strokeStyle = color;
		x = x + dx;
		for (let i = 1; i < interPolatedY.length; i++) {
			ctx.lineTo(x, interPolatedY[i]);
			x = x + dx;
		}
		ctx.stroke();
		ctx.flush();
	};
	return <GLView {...props} onContextCreate={_onGLContextCreate} />;
}
