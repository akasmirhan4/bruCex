import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/core";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, TouchableHighlight, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Caption, Subheading, Title, useTheme } from "react-native-paper";
import SimpleGraph from "../../../assets/components/SimpleGraph";
import { GetAvgRecentPrice, GetKlineTrade } from "../../../assets/service/Binance";
import { functions } from "../../../assets/service/Firebase";
import { CoinSymbolIcon, getAvailableCoinSymbols } from "../../../assets/svgs";
import SortByModal from "../Exchange/SortByModal";

export default function MarketsScreen({ navigation }) {
	console.log("MARKET!!!");
	const roundness = useTheme().roundness;
	const colors = useTheme().colors;
	const [favoriteOn, setFavoriteOn] = useState(false);
	const [intervalID, setIntervalID] = useState(null);
	const [recentPrices, setRecentPrices] = useState([]);
	const [rendered, setRendered] = useState(false);
	const COINS_IGNORE = ["BUSD", "USDT", "USDC"];
	const [showSortBy, setShowSortBy] = useState(false);
	const [selectedLabel, setSelectedLabel] = useState("Hot");

	let selectedCoins = getAvailableCoinSymbols();
	const [coinsInfo, setCoinsInfo] = useState([]);
	let formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const isFocused = useIsFocused();
	const LIVE_INTERVAL = 7000;
	const [refreshing, setRefreshing] = useState(false);
	let percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always" });

	const getDayPrices = async () => {
		await functions
			.httpsCallable("GetCoinsInfo")()
			.then(async (response) => {
				const coinsInfo = response.data.response;
				let _coinsInfo = [];
				let batchPromises = [];
				selectedCoins.forEach((coin) => {
					if (!COINS_IGNORE.includes(coin)) {
						let result = coinsInfo.find((coinInfo) => coinInfo.coin == coin);
						_coinsInfo.push({ coin, name: result.name });
						batchPromises.push(GetKlineTrade(coin));
					}
				});
				await Promise.all(batchPromises).then((results) => {
					let _recentPrices = [];
					results.forEach((result, index) => {
						const dayHistory = result.data;
						let dayPrices = [dayHistory[0][1]];
						dayHistory.forEach((hourHistory) => {
							dayPrices.push(hourHistory[4]);
						});
						_coinsInfo[index].dayPrices = dayPrices;
						_recentPrices.push(dayPrices[dayPrices.length - 1]);
						_coinsInfo[index].initialDayPrice = dayPrices[0];
					});
					setRecentPrices(_recentPrices);
				});
				setCoinsInfo(_coinsInfo);
			});
	};

	const sortBy = (label) => {
		console.log(coinsInfo);
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await getDayPrices();
		setRendered(false);
	}, []);

	useEffect(() => {
		getDayPrices();
		return () => {
			clearInterval(intervalID);
		};
	}, []);

	useEffect(() => {
		if (!isFocused) {
			console.log("clearing interval");
			clearInterval(intervalID);
		} else {
			setIntervalID(
				setInterval(() => {
					let batchPromises = [];
					selectedCoins.forEach((coin) => {
						if (!COINS_IGNORE.includes(coin)) batchPromises.push(GetAvgRecentPrice(coin));
					});
					Promise.all(batchPromises)
						.then((results) => {
							let prices = results.map((result) => result.data.price);
							setRecentPrices(prices);
						})
						.catch(console.error);
				}, LIVE_INTERVAL)
			);
		}
	}, [isFocused]);

	return (
		<View style={{ flex: 1 }}>
			<SortByModal
				visible={showSortBy}
				onCloseEnd={() => {
					setShowSortBy(false);
				}}
				onLabelChange={(selectedLabel) => {
					setSelectedLabel(selectedLabel);
					sortBy(selectedLabel);
				}}
			/>
			<ScrollView
				style={{ flex: 1, backgroundColor: colors.card }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				<View
					style={{
						backgroundColor: colors.background,
						flex: 1,
						width: "100%",
						borderTopRightRadius: roundness,
						borderTopLeftRadius: roundness,
						minHeight: "100%",
						paddingVertical: 16,
					}}
				>
					<Title style={{ marginHorizontal: 16, marginBottom: 20, marginTop: 10 }}>Markets</Title>
					<View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, marginBottom: 16 }}>
						<View style={{ flexDirection: "row" }}>
							<Button
								mode="contained"
								style={{ borderRadius: 18, backgroundColor: colors.border }}
								labelStyle={{ color: favoriteOn ? colors.inactive : colors.active }}
								uppercase={false}
								dark={true}
								onPress={() => {
									setFavoriteOn(false);
								}}
							>
								All
							</Button>
							<Button
								mode="contained"
								style={{ marginLeft: 16, borderRadius: 18, backgroundColor: colors.border }}
								labelStyle={{ color: favoriteOn ? colors.active : colors.inactive }}
								dark={true}
								onPress={() => {
									setFavoriteOn(true);
								}}
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
							onPress={() => {
								setShowSortBy(true);
							}}
						>
							{selectedLabel}
						</Button>
					</View>
					{!favoriteOn && (
						<View style={{ flex: 1 }}>
							{/* Loop coins */}
							{coinsInfo.map((coinInfo, index) => {
								const coinSymbol = coinInfo.coin;
								const priceChange = (recentPrices[index] - coinInfo.initialDayPrice) / coinInfo.initialDayPrice;
								return (
									<TouchableHighlight
										key={index}
										onPress={() => {
											navigation.navigate("Coin Details", { coinInfo });
										}}
										underlayColor="#FFFFFF11"
									>
										<View style={{ flexDirection: "row", padding: 16, alignContent: "center" }}>
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
											<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
												<SimpleGraph
													style={{ width: 100, height: 50 }}
													dayPrices={coinInfo.dayPrices}
													onRendered={() => {
														setRendered(true);
														setRefreshing(false);
													}}
													rendered={rendered}
												/>
											</View>
											<View style={{ marginLeft: 16, minWidth: 90, alignItems: "flex-end" }}>
												{/* Coin Recent Price */}
												<Subheading>{formatter.format(recentPrices[index])}</Subheading>
												{/* Coin Recent %Gain/Loss */}
												<Caption style={{ color: priceChange < 0 ? "red" : "green" }}>{percentFormatter.format(priceChange)}</Caption>
											</View>
										</View>
									</TouchableHighlight>
								);
							})}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}
