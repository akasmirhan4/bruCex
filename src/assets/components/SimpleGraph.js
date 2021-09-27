import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
	const WIDTH = 200;
	const interPolatedY = dayPrices.map((hourPrice) => (1 - (hourPrice - minPrice) / priceRange) * HEIGHT);
	const color = dayPrices[0] < dayPrices[dayPrices.length - 1] ? "green" : "red";
	const dx = WIDTH / (interPolatedY.length - 1);
    const [gl, setGl] = useState(null)
	const [rendered, setRendered] = useState(props.rendered);

	useEffect(() => {
		setRendered(props.rendered);
		if (gl && !props.rendered) {
			_onGLContextCreate(gl);
		}
	}, [props.rendered]);

	const _onGLContextCreate = (gl) => {
		let x = 0;
		var ctx = new Expo2DContext(gl);
		ctx.lineWidth = 4;
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
		props.onRendered();
		setRendered(true);
	};
	return (
		<GLView
			style={props.style}
			onContextCreate={(_gl) => {
				_onGLContextCreate(_gl);
                setGl(_gl);
			}}
		/>
	);
}
