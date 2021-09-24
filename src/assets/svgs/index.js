import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import ADA from "./ADA.svg";
import BNB from "./BNB.svg";
import BTC from "./BTC.svg";
import ETH from "./ETH.svg";
import LTC from "./LTC.svg";
import XRP from "./XRP.svg";

const coinSymbols = {
	ADA: ADA,
	BNB: BNB,
	BTC: BTC,
	ETH: ETH,
	LTC: LTC,
	XRP: XRP,
};

const CoinSymbolIcon = (props) => {
	const colors = useTheme().colors;
	let Icon = coinSymbols[props.symbol];
	return (
		<View style={{ borderRadius: "50%", backgroundColor: colors.border, padding: 4 }}>
			<Icon {...props} />
		</View>
	);
};

export default CoinSymbolIcon;
