import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

const coinSymbols = {
	ADA: require("./ADA.svg").default,
	BNB: require("./BNB.svg").default,
	BTC: require("./BTC.svg").default,
	ETH: require("./ETH.svg").default,
	LTC: require("./LTC.svg").default,
	XRP: require("./XRP.svg").default,
	BUSD: require("./BUSD.svg").default,
	DOGE: require("./DOGE.svg").default,
	SOL: require("./SOL.svg").default,
	DOT: require("./DOT.svg").default,
	USDT: require("./USDT.svg").default,
	USDC: require("./USDC.svg").default,
	UNI: require("./UNI.svg").default,
	LUNA: require("./LUNA.svg").default,
	RUNE: require("./RUNE.svg").default,
};

const CoinSymbolIcon = (props) => {
	const colors = useTheme().colors;
	let Icon = coinSymbols[props.symbol];
	return (
		<View style={{ borderRadius: "50%", backgroundColor: "#FFFFFF88", padding: 4 }}>
			<Icon {...props} />
		</View>
	);
};

const getAvailableCoinSymbols = () => Object.keys(coinSymbols);

export { CoinSymbolIcon, getAvailableCoinSymbols };
