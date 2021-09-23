import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { getBalance, UserBuy, getExchangeRate, getExchangeInfo, getCoinsInfo } from "./src/assets/service/Binance";
import { Picker } from "@react-native-picker/picker";

export default function App() {
	const [BNDT, setBNDT] = useState("10.00");
	const [symbol, setSymbol] = useState("ETH");
	const [exRate, setExRate] = useState(null);
	const [amount, setAmount] = useState("");
	const [exchangeSymbols, setExchangeSymbols] = useState([]);
	const [selectedExSymbol, setSelectedExSymbol] = useState("BTCUSDT");
	const [balances, setBalances] = useState([]);
	const [balance, setBalance] = useState(null);
	const [appLoaded, setAppLoaded] = useState(false);
	useEffect(() => {
		(async () => {
			const coinsInfo = await getCoinsInfo();
			const exchangeInfo = await getExchangeInfo();
			setExchangeSymbols(exchangeInfo.symbols.map((symbol) => symbol.symbol));
			let response = await getBalance(symbol);
			setBalances(response.balances);
			setBalance(balances.find((balance) => balance.asset == symbol));
			let exchangeRate = await getExchangeRate(symbol);
			setExRate(exchangeRate);
			setAppLoaded(true);
		})();
	}, []);
	useEffect(() => {
		(async () => {
			let exchangeRate = await getExchangeRate(symbol);
			setExRate(exchangeRate);
			setBalance(balances.find((balance) => balance.asset == symbol));
		})();
	}, [symbol]);
	if (appLoaded) {
		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.container}>
					<StatusBar style="auto" />
					<View style={{ width: "100%" }}>
						<Picker selectedValue={symbol} onValueChange={(symbol) => setSymbol(symbol)}>
							{balances.map((balance, index) => {
								return <Picker.Item key={index} label={balance.asset} value={balance.asset} />;
							})}
						</Picker>
					</View>
					{/* <Text>{`BNDT: ${BNDT}`}</Text> */}
					<Text>{`${symbol}: ${balance?.free}`}</Text>
					{exRate.symbol && (
						<>
							<Text>{`${exRate.symbol} : ${exRate.price}`}</Text>
							<Text>{`USDT : ${Number(exRate?.price) * Number(balance?.free)}`}</Text>
						</>
					)}
					{!exRate.symbol && <Text style={{ color: "red" }}>{`${symbol} does not have any USDT exchange`}</Text>}

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
	} else {
		return null;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
