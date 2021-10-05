import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { Dimensions, RefreshControl, ScrollView, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Caption, Divider, IconButton, Subheading, Text, Title, useTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";
import DonutChart from "../../assets/components/DonutChart";
import { useEffect } from "react";
import { functions } from "../../assets/service/Firebase";
import { GetAvgRecentPrice } from "../../assets/service/Binance";
import CoinSymbolIcon from "../../assets/svgs";

export default function BalancesScreen({ navigation }) {
	const colors = useTheme().colors;
	const [totalBalance, setTotalBalance] = useState(0);
	const roundness = useTheme().roundness;
	const [data, setData] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [viewBalance, setViewBalance] = useState(false);
	const [recentPrices, setRecentPrices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [coinsInfo, setCoinsInfo] = useState([]);
	let currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const PRICEUPDATE_INTERVAL = 10000;

	// TODO: remove
	let selectedCoins = ["BTC", "ETH", "LTC", "BNB", "XRP", "ADA"];

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

	const getPrices = async () => {
		let batchPromises = [];
		selectedCoins.forEach((coin) => {
			if (coin !== "BUSD" || coin !== "USDT") batchPromises.push(GetAvgRecentPrice(coin));
		});
		await Promise.all(batchPromises)
			.then((results) => {
				let prices = results.map((result) => result.data.price);
				setRecentPrices(prices);
			})
			.catch(console.error);
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadBalance();
		setRendered(false);
	}, []);

	useEffect(() => {
		if (coinsInfo && recentPrices && coinsInfo.length > 0) {
			let _data = [];
			let _totalBalance = 0;
			coinsInfo.forEach((coinInfo, index) => {
				if (coinInfo.free > 0) {
					const worth = coinInfo.free * recentPrices[index];
					coinInfo.worth = worth;
					_totalBalance += worth;
					_data.push(coinInfo);
				}
			});
			console.log(_data);
			setTotalBalance(_totalBalance);
			setData(_data);
		}
	}, [coinsInfo, recentPrices]);

	useEffect(() => {
		setLoading(true);
		Promise.all([getPrices(), loadBalance()]).then((results) => {
			setLoading(false);
		});
	}, []);

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
							onPress={() => {}}
						/>
						<Text>Deposit</Text>
					</View>
					<View style={{ alignItems: "center" }}>
						<IconButton
							icon={({ color, size }) => <MaterialCommunityIcons name="database-export" color={color} size={size} />}
							color={colors.primary}
							size={32}
							style={{ backgroundColor: "#2A303C", marginBottom: 8 }}
							onPress={() => {}}
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
						const coinWorth = currencyFormatter.format(Number(coinInfo.free) * recentPrices[index]);
						return (
							<TouchableHighlight
								key={index}
								onPress={() => {
									navigation.navigate("Coin Details", { coinInfo });
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
}
