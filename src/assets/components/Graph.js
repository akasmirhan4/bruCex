import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Caption, Text, Title } from "react-native-paper";
import Expo2DContext from "expo-2d-context";
import { GLView } from "expo-gl";

export default function Graph(props) {
	const colors = useTheme().colors;
	const [prices, setPrices] = useState(
		props.info.map((i) => {
			return Number(i[3]);
		})
	);
	const [maxIndex, setMaxIndex] = useState(0);
	const [minIndex, setMinIndex] = useState(0);
	const [maxPrice, setMaxPrice] = useState(props.info[0][2]);
	const [minPrice, setMinPrice] = useState(props.info[0][3]);

	const priceRange = Math.max(...prices) - Math.min(...prices);
	const [lowPrice, setLowPrice] = useState([]);
	const [highPrice, setHighPrice] = useState([]);
	const [gl, setGl] = useState(null);
	const [rendered, setRendered] = useState(props.rendered);
	let currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const TEXTCLIP_RIGHT = 0.95;
	const DIGIT_WIDTH = 0.02;

	useEffect(() => {
		setRendered(false);
		setPrices(
			props.info.map((i) => {
				return Number(i[3]);
			})
		);
		let closePrices = [];
		let _maxPrice = props.info[0][2];
		let _minPrice = props.info[0][3];
		let _maxIndex = 0;
		let _minIndex = 0;

		props.info.forEach((info, index) => {
			closePrices.push(Number(info[4]));
			if (Number(info[2]) > _maxPrice) {
				_maxPrice = Number(info[2]);
				_maxIndex = index;
			}
			if (Number(info[3]) < _minPrice) {
				_minPrice = Number(info[3]);
				_minIndex = index;
			}
		});

		setMaxIndex(_maxIndex);
		setMinIndex(_minIndex);
		setMaxPrice(_maxPrice);
		setMinPrice(_minPrice);

		if (gl) {
			onContextCreate(gl);
		}
	}, [props.info]);

	useEffect(() => {
		setRendered(props.rendered);
		if (gl && !props.rendered) {
			onContextCreate(gl);
		}
	}, [props.rendered]);

	const onContextCreate = (gl) => {
		const HEIGHT = gl.drawingBufferHeight;
		const WIDTH = gl.drawingBufferWidth;
		const interPolatedY = prices.map((price) => (1 - (price - minPrice) / priceRange) * HEIGHT);
		const color = prices[0] < prices[prices.length - 1] ? "green" : "red";
		const dx = WIDTH / (interPolatedY.length - 1);
		gl.viewport(0, 0, WIDTH, HEIGHT);
		gl.clearColor(0, 1, 1, 1);
		let x = 0;
		var ctx = new Expo2DContext(gl);
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.strokeStyle = color;
		x = x + dx;
		for (let i = 0; i < interPolatedY.length; i++) {
			if (i == minIndex) {
				let relX = x / WIDTH;
				let charLength = String(minPrice).split(".")[0].length;
				if (relX >= TEXTCLIP_RIGHT - charLength * DIGIT_WIDTH) {
					relX = TEXTCLIP_RIGHT - charLength * DIGIT_WIDTH;
				}
				setLowPrice([relX, 1, minPrice]);
			} else if (i == maxIndex) {
				let relX = x / WIDTH;
				let charLength = String(maxPrice).split(".")[0].length;
				if (relX >= TEXTCLIP_RIGHT - charLength * DIGIT_WIDTH) {
					relX = TEXTCLIP_RIGHT - charLength * DIGIT_WIDTH;
				}
				setHighPrice([relX, 0, maxPrice]);
			}
			ctx.lineTo(x, interPolatedY[i]);
			x = x + dx;
		}
		ctx.stroke();
		ctx.flush();
		gl.endFrameEXP();
		props.onRendered();
		setRendered(true);
	};
	return (
		<View style={{ position: "relative" }}>
			<GLView
				style={props.style}
				onContextCreate={(_gl) => {
					onContextCreate(_gl);
					setGl(_gl);
				}}
			/>
			{lowPrice.length > 0 && (
				<Caption
					style={{ position: "absolute", left: `${lowPrice[0] * 100}%`, top: `${lowPrice[1] * 100 - 3}%` }}
					children={currencyFormatter.format(lowPrice[2])}
				/>
			)}
			{highPrice.length > 0 && (
				<Caption
					style={{ position: "absolute", left: `${highPrice[0] * 100}%`, top: `${highPrice[1] * 100 - 3}%` }}
					children={currencyFormatter.format(highPrice[2])}
				/>
			)}
		</View>
	);
}
