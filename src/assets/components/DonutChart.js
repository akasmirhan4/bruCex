import React from "react";
import { Dimensions, View } from "react-native";
import { Caption, Text, Title, useTheme } from "react-native-paper";
import Svg, { Circle, Defs, G, Marker, Path } from "react-native-svg";

export default function DonutChart(props) {
	const data = !!props.data && props.data.length ? props.data.sort((a, b) => b.worth > a.worth) : null;
	let labels = [];
	const nData = data ? data.length : 0;
	const totalValue = data
		? data.reduce((x1, x2) => {
				return {
					worth: Number(x1.worth) + Number(x2.worth),
				};
		  }).worth
		: 0;
	let percentages = [];
	let offsetPercentages = [0];
	if (data)
		data.forEach((_data, index) => {
			percentages.push(Number(_data.worth) / totalValue);
			offsetPercentages.push(offsetPercentages[offsetPercentages.length - 1] + (Number(_data.worth) / totalValue) * 360);
			labels.push(_data.coin);
		});
	console.log(data);
	console.log(totalValue);
	console.log(percentages);
	console.log(offsetPercentages);
	console.log(labels);
	const colors = useTheme().colors;
	const radius = Dimensions.get("window").width * 0.25;
	const strokeWidth = 24;
	const duration = 500;
	const donutColors = ["#3C9D4E", "#7031AC", "#C94D6D", "#E4BF58", "#4174C9"];
	const delay = 0;
	const halfCircle = radius + strokeWidth;
	const lastArc = nData >= 2 ? describeArc(halfCircle, halfCircle, radius, offsetPercentages[0], offsetPercentages[1]) : null;

	let percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });

	if (nData > 5) {
		console.warn("Only enter 5 data or less");
		return null;
	} else {
		return (
			<View style={{ ...props.containerStyle }}>
				<Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
					<G>
						<Circle cx="50%" cy="50%" stroke={colors.primary} strokeWidth={strokeWidth} r={radius} strokeOpacity={0.2} fill="transparent" />
						{nData > 1
							? data.map((i, index) => {
									const { d, end } = describeArc(halfCircle, halfCircle, radius, offsetPercentages[index], offsetPercentages[index + 1]);
									return (
										<G key={index}>
											<Circle cx={end.x} cy={end.y} r={strokeWidth / 2} fill={donutColors[index]} />
											<Path fill="none" stroke={donutColors[index]} strokeWidth={strokeWidth} d={d} />
										</G>
									);
							  })
							: nData > 0 ?? <Circle cx="50%" cy="50%" stroke={donutColors[0]} strokeWidth={strokeWidth} r={radius} fill="transparent" />}
						{!!lastArc && <Circle cx={lastArc.end.x} cy={lastArc.end.y} r={strokeWidth / 2} fill={donutColors[0]} />}
					</G>
				</Svg>
				<View style={{ flex: 1, justifyContent: "center" }}>
					{labels.length >= 1 ? (
						labels.map((label, index) => (
							<View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 4 }} key={index}>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<View style={{ width: 12, height: 12, backgroundColor: donutColors[index], borderRadius: 4, marginRight: 8 }} />
									<Caption>{label}</Caption>
								</View>
								<Caption style={{ fontFamily: "Roboto-Medium", color: colors.text }}>{percentFormatter.format(percentages[index])}</Caption>
							</View>
						))
					) : (
						<View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 4 }}>
							<View style={{ alignItems: "center" }}>
								<Caption>You have no assets to show.</Caption>
							</View>
						</View>
					)}
				</View>
			</View>
		);
	}
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
}

function describeArc(x, y, radius, startAngle, endAngle) {
	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

	var d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");

	return { d, end };
}
