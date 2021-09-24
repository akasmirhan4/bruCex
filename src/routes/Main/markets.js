import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, Button, Caption, Subheading, Title, useTheme } from "react-native-paper";
import SimpleGraph from "../../assets/components/SimpleGraph";
import { getCoinsInfo, getLast24HoursTrade } from "../../assets/service/Binance";
import CoinSymbolIcon from "../../assets/svgs";
export default function MarketsScreen() {
	const roundness = useTheme().roundness;
	const colors = useTheme().colors;

	let selectedCoins = ["BTC", "ETH", "LTC", "BNB", "XRP", "ADA"];
	const [coinsInfo, setCoinsInfo] = useState([]);
	let formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

	useEffect(() => {
		(async () => {
			await getCoinsInfo().then(async (coinsInfo) => {
				let _coinsInfo = [];
				let batchPromises = [];
				selectedCoins.forEach((coin) => {
					let result = coinsInfo.find((coinInfo) => coinInfo.coin == coin);
					_coinsInfo.push({ coin, name: result.name });
					batchPromises.push(getLast24HoursTrade(coin));
				});
				await Promise.all(batchPromises).then((dayHistories) => {
					dayHistories.forEach((dayHistory, index) => {
						console.log(_coinsInfo[index].name);
						let dayPrices = [dayHistory[0][1]];
						dayHistory.forEach((hourHistory) => {
							dayPrices.push(hourHistory[4]);
						});
						_coinsInfo[index].dayPrices = dayPrices;
						_coinsInfo[index].lastPrice = dayPrices[dayPrices.length - 1];
						_coinsInfo[index].dayPriceChange = (dayPrices[dayPrices.length - 1] - dayPrices[0]) / dayPrices[0];
					});
					console.log(_coinsInfo);
				});
				setCoinsInfo(_coinsInfo);
			});
		})();
	}, []);

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.card }}>
			<View
				style={{
					backgroundColor: colors.background,
					flex: 1,
					width: "100%",
					borderTopRightRadius: roundness,
					borderTopLeftRadius: roundness,
					minHeight: "100%",
					padding: 16,
				}}
			>
				<Title style={{ marginVertical: 16 }}>Markets</Title>
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<View style={{ flexDirection: "row" }}>
						<Button
							mode="contained"
							style={{ borderRadius: 18, backgroundColor: colors.border }}
							labelStyle={{ color: colors.inactive }}
							uppercase={false}
							dark={true}
						>
							All
						</Button>
						<Button
							mode="contained"
							style={{ marginLeft: 16, borderRadius: 18, backgroundColor: colors.border }}
							labelStyle={{ color: colors.active }}
							dark={true}
						>
							<Ionicons name="star" size={16} />
						</Button>
					</View>
					<Button
						mode="contained"
						style={{ borderRadius: 18, backgroundColor: colors.border }}
						contentStyle={{ flexDirection: "row-reverse" }}
						labelStyle={{ color: colors.active }}
						uppercase={false}
						dark={true}
						icon={({ color }) => <Ionicons name="arrow-down" color={color} size={16} />}
					>
						Hot
					</Button>
				</View>
				<View>
					{/* Loop coins */}
					{coinsInfo.map((coinInfo, index) => {
						const coinSymbol = coinInfo.coin;
						const priceChange = (coinInfo.dayPriceChange * 100).toFixed(2);
						return (
							<View style={{ flexDirection: "row", paddingVertical: 16, alignContent: "center" }} key={index}>
								{/* Coin Logo */}
								<View style={{ justifyContent: "center" }}>
									<CoinSymbolIcon symbol={coinSymbol} width={24} height={24} />
								</View>
								<View style={{ marginLeft: 16, minWidth: 64 }}>
									{/* Coin SYMBOL */}
									<Subheading>{coinSymbol}</Subheading>
									{/* Coin Name */}
									<Caption>{coinInfo.name}</Caption>
								</View>
								{/* Coin Graph */}
								<View style={{ flex: 1 }}>
									<SimpleGraph style={{ flex: 1 }} dayPrices={coinInfo.dayPrices} />
								</View>
								<View style={{ marginLeft: 16, minWidth: 90, alignItems: "flex-end" }}>
									{/* Coin Recent Price */}
									<Subheading>{formatter.format(coinInfo.lastPrice)}</Subheading>
									{/* Coin Recent %Gain/Loss */}
									<Caption style={{ color: priceChange < 0 ? "red" : "green" }}>{`${priceChange}%`}</Caption>
								</View>
							</View>
						);
					})}
				</View>
			</View>
		</ScrollView>
	);
}
