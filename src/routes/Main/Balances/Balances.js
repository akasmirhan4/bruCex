import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { Dimensions, RefreshControl, ScrollView, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Button, Caption, Divider, IconButton, Subheading, Text, Title, useTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";
import DonutChart from "../../../assets/components/DonutChart";
import { useEffect } from "react";
import { auth, functions } from "../../../assets/service/Firebase";
import { GetAvgRecentPrice } from "../../../assets/service/Binance";
import { CoinSymbolIcon, getAvailableCoinSymbols } from "../../../assets/svgs";

export default function BalancesScreen({ navigation }) {
	const colors = useTheme().colors;
	const [totalBalance, setTotalBalance] = useState(0);
	const roundness = useTheme().roundness;
	const [data, setData] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [viewBalance, setViewBalance] = useState(false);
	const [recentPrices, setRecentPrices] = useState(null);
	const [loading, setLoading] = useState(true);
	const COINS_IGNORE = ["BUSD", "USDT", "USDC"];
	const [coinsInfo, setCoinsInfo] = useState([]);
	const [loggedIn, setLoggedIn] = useState(false);
	const { width, height } = Dimensions.get("window");
	let currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const PRICEUPDATE_INTERVAL = 10000;

	// TODO: remove
	let selectedCoins = getAvailableCoinSymbols();

	const loadBalance = async () => {
		await functions
			.httpsCallable("GetCoinsInfo")()
			.then(async (response) => {
				const coinsInfo = response.data.response;
				let _coinsInfo = [];
				selectedCoins.forEach((coin) => {
					let result = coinsInfo.find((coinInfo) => coinInfo.coin == coin);
					_coinsInfo.push({ coin, name: result.name, free: result.free, locked: result.locked });
				});
				setCoinsInfo(_coinsInfo);
			});
	};

	const getPrices = () => {
		return new Promise(async (resolve, reject) => {
			let _prices = {};
			let batchPromises = [];
			let queuedCoins = [];
			selectedCoins.forEach((coin) => {
				if (!COINS_IGNORE.includes(coin)) {
					queuedCoins.push(coin);
					batchPromises.push(GetAvgRecentPrice(coin));
				} else {
					_prices[coin] = null;
				}
			});
			await Promise.all(batchPromises)
				.then((results) => {
					results.forEach((result, index) => {
						_prices[queuedCoins[index]] = result.data.price;
					});
					setRecentPrices(_prices);
					resolve({ success: true });
				})
				.catch(reject);
		});
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadBalance();
		setRefreshing(false);
	}, []);

	useEffect(() => {
		if (!!coinsInfo && !!recentPrices && coinsInfo.length > 0) {
			let _data = [];
			let _totalBalance = 0;
			coinsInfo.forEach((coinInfo, index) => {
				if (coinInfo.free > 0) {
					let worth = null;
					worth = coinInfo.free * (recentPrices[coinInfo.coin] ?? 1);

					coinInfo.worth = worth;
					_totalBalance += worth;
					_data.push(coinInfo);
				}
			});
			setTotalBalance(_totalBalance);
			setData(_data);
		}
	}, [coinsInfo, recentPrices]);

	useEffect(() => {
		(async () => {
			setLoading(true);
			setLoggedIn(!!auth().currentUser);
			if (!!auth().currentUser) await Promise.all([getPrices(), loadBalance()]);
			setLoading(false);
		})();
	}, []);

	if (loggedIn) {
		return (
			<ScrollView
				style={{ backgroundColor: colors.card }}
				contentContainerStyle={{ paddingBottom: 0 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{/* Total Balance */}
				<View style={{ backgroundColor: colors.card, padding: 16, flex: 1 }}>
					<View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
						<TouchableOpacity
							style={{ flexDirection: "row", alignItems: "center" }}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								setViewBalance(!viewBalance);
							}}
						>
							<Caption style={{ marginRight: 8 }}>Total Balance</Caption>
							<MaterialCommunityIcons name={viewBalance ? "eye-off-outline" : "eye-outline"} color={colors.caption} size={16} />
						</TouchableOpacity>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Text style={{ fontSize: 48, fontFamily: "Roboto-Light" }}>{viewBalance ? currencyFormatter.format(totalBalance) : "******"}</Text>
						<IconButton
							icon={({ color, size }) => (
								<View style={{ backgroundColor: color, width: size, height: size, justifyContent: "center", alignItems: "center", borderRadius: "50%" }}>
									<Ionicons name="md-information" color={colors.text} size={size - 8} />
								</View>
							)}
							color={colors.background}
							onPress={() => {}}
						/>
					</View>
				</View>
				{/* Inside the card */}
				<View
					style={{
						backgroundColor: colors.background,
						flex: 1,
						width: "100%",
						borderTopRightRadius: roundness,
						borderTopLeftRadius: roundness,
						minHeight: "100%",
					}}
				>
					<View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginTop: 8, marginBottom: 16 }}>
						<View style={{ alignItems: "center" }}>
							<IconButton
								icon={({ color, size }) => <MaterialCommunityIcons name="database-import" color={color} size={size} />}
								color={colors.primary}
								size={32}
								style={{ backgroundColor: "#2A303C", marginBottom: 8 }}
								onPress={() => {
									navigation.navigate("Deposit");
								}}
							/>
							<Text>Deposit</Text>
						</View>
						<View style={{ alignItems: "center" }}>
							<IconButton
								icon={({ color, size }) => <MaterialCommunityIcons name="database-export" color={color} size={size} />}
								color={colors.primary}
								size={32}
								style={{ backgroundColor: "#2A303C", marginBottom: 8 }}
								onPress={() => {
									navigation.navigate("Withdraw");
								}}
							/>
							<Text>Withdraw</Text>
						</View>
					</View>
					<Divider />
					<View style={{ padding: 16 }}>
						<Title>Asset Allocation</Title>
					</View>
					{!loading && <DonutChart data={data} containerStyle={{ marginHorizontal: 8, marginBottom: 16, flexDirection: "row" }} />}
					<Divider />
					<View style={{ padding: 16 }}>
						<Title>Assets</Title>
					</View>
					{/* Loop coins */}
					{!loading &&
						coinsInfo.map((coinInfo, index) => {
							const coinSymbol = coinInfo.coin;
							const coinBalance = Number(coinInfo.free).toFixed(8);
							const recentPrice = recentPrices[coinSymbol] ?? 1;
							const coinWorth = currencyFormatter.format(Number(coinInfo.free) * recentPrice);
							return (
								<TouchableHighlight
									key={index}
									onPress={() => {
										navigation.navigate("Balance Details", { coinInfo });
									}}
									underlayColor="#FFFFFF11"
								>
									<View style={{ flexDirection: "row", padding: 16, alignContent: "center", justifyContent: "space-between" }}>
										{/* Coin Logo */}
										<View style={{ justifyContent: "center", flexDirection: "row" }}>
											<View style={{ justifyContent: "center" }}>
												<CoinSymbolIcon symbol={coinSymbol} width={24} height={24} />
											</View>
											<View style={{ marginLeft: 16, minWidth: 64 }}>
												{/* Coin SYMBOL */}
												<Subheading>{coinSymbol}</Subheading>
												{/* Coin Name */}
												<Caption>{coinInfo.name}</Caption>
											</View>
										</View>
										<View style={{ marginLeft: 16, minWidth: 90, alignItems: "flex-end" }}>
											{/* Coin Balance */}
											<Subheading>{coinBalance}</Subheading>
											{/* Coin Worth */}
											<Caption>{coinWorth}</Caption>
										</View>
									</View>
								</TouchableHighlight>
							);
						})}
				</View>
			</ScrollView>
		);
	} else {
		return (
			<View style={{ paddingBottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, flex: 1 }}>
				<View style={{ backgroundColor: colors.altBackground, height: 128, width: 128, borderRadius: 100, marginBottom: 64 }}>
					<Ionicons name="phone-portrait-outline" size={86} color={colors.primary} style={{ position: "absolute", left: 24, top: 16 }} />
					<Ionicons name="ios-chatbox-ellipses" size={48} color={`${colors.active}88`} style={{ position: "absolute", right: -12, top: 8 }} />
					<View
						style={{
							position: "absolute",
							left: 8,
							bottom: 0,
							backgroundColor: colors.background,
							opacity: 0.95,
							borderRadius: 24,
							height: 48,
							width: 48,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="checkmark" size={36} color={`${colors.primary}`} />
					</View>
					<View style={{ backgroundColor: colors.card, width: 5, height: 5, left: 24, top: 24, position: "absolute", transform: [{ rotate: "45deg" }] }}></View>
					<View
						style={{ backgroundColor: colors.card, width: 4, height: 4, left: 56, bottom: 8, position: "absolute", transform: [{ rotate: "45deg" }] }}
					></View>
					<View
						style={{ backgroundColor: colors.card, width: 6, height: 6, right: 12, bottom: 48, position: "absolute", transform: [{ rotate: "45deg" }] }}
					></View>
				</View>
				<Title style={{ fontFamily: "Roboto-Light", fontSize: 32 }}>Welcome to BruCex</Title>
				<Caption>Join Brunei largest crypto exchange</Caption>
				<View style={{ flexDirection: "row", marginVertical: 32, marginHorizontal: 16 }}>
					<Button
						mode="contained"
						style={{ flex: 1 }}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							navigation.navigate("AuthStack");
						}}
					>
						Sign Up / Log In
					</Button>
				</View>
			</View>
		);
	}
}
