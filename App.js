import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { getBalance, UserBuy, getExchangeRate } from "./assets/service/Binance";

export default function App() {
	const [BNDT, setBNDT] = useState("10.00");
	const [symbol, setSymbol] = useState("ETH");
	const [exRate, setExRate] = useState(null);
	const [amount, setAmount] = useState("");
	const [free, setFree] = useState(null);
	useEffect(() => {
		(async () => {
			let response = await getBalance(symbol);
			setFree(response.free);

			let exchangeRate = await getExchangeRate("ETH");
			setExRate(exchangeRate);
		})();
	}, []);
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				<StatusBar style="auto" />
				{/* <Text>{`BNDT: ${BNDT}`}</Text> */}
				<Text>{`${symbol}: ${free}`}</Text>
				<Text>{`${exRate?.symbol} : ${exRate?.price}`}</Text>
				<Text>{`USDT : ${Number(exRate?.price) * Number(free)}`}</Text>
				<TextInput
					placeholder="Enter Amount..."
					keyboardType="numeric"
					keyboardAppearance="dark"
					style={{
						borderColor: "grey",
						borderWidth: 2,
						paddingHorizontal: 16,
						paddingVertical: 8,
						fontSize: 16,
						marginVertical: 24,
						borderRadius: 12,
						width: "50%",
					}}
					onChangeText={setAmount}
					value={amount}
				/>
				<View style={{ flexDirection: "row" }}>
					<Button
						title={`Buy ${symbol}`}
						onPress={() => {
							UserBuy(amount, symbol);
						}}
					/>
					<Button
						title={`Sell ${symbol}`}
						onPress={() => {
							UserSell(amount, symbol);
						}}
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
