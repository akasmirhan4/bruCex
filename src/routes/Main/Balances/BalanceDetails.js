import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, RefreshControl, SafeAreaView, ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Caption, IconButton, Text, Title, useTheme } from "react-native-paper";
import PopUpBottomModal from "../../../assets/components/PopUpBottomModal";
import { GetAvgRecentPrice, GetKlineTrade } from "../../../assets/service/Binance";
import { auth } from "../../../assets/service/Firebase";

const Appbar = (props) => {
	const navigation = useNavigation();
	const colors = useTheme().colors;
	return (
		<SafeAreaView style={{ flexDirection: "row", backgroundColor: colors.card }}>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
				<IconButton
					icon={({ color, size }) => <MaterialIcons name="arrow-back" color={colors.inactive} size={size} />}
					onPress={() => {
						navigation.goBack();
					}}
				/>
			</View>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Title>{props.title}</Title>
			</View>
			<View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }} />
		</SafeAreaView>
	);
};

const Bottombar = (props) => {
	const navigation = useNavigation();
	const colors = useTheme().colors;
	const [coinBalance, setCoinBalance] = useState(0);
	const [currentPrice, setCurrentPrice] = useState(props.currentPrice ?? 0);
	const [loggedIn, setLoggedIn] = useState(false);
	let currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

	useEffect(() => {
		setLoggedIn(!!auth().currentUser);
		setCurrentPrice(props.currentPrice ?? 0);
	}, [props.currentPrice]);

	if (loggedIn) {
		return (
			<SafeAreaView style={{ backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" }}>
				<View style={{ flexDirection: "row" }}>
					<View style={{ justifyContent: "center", flex: 1, padding: 16 }}>
						<Button
							mode="contained"
							contentStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
							color={colors.altBackground}
							onPress={() => {
								navigation.navigate("Withdraw", { coin: props.coin });
							}}
						>
							Withdraw
						</Button>
					</View>
					<View style={{ justifyContent: "center", flex: 1, paddingRight: 16 }}>
						<Button
							mode="contained"
							contentStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
							onPress={() => {
								navigation.navigate("Deposit", { coin: props.coin });
							}}
						>
							Deposit
						</Button>
					</View>
				</View>
			</SafeAreaView>
		);
	} else {
		return (
			<SafeAreaView style={{ backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" }}>
				<View style={{ padding: 16, width: "100%" }}>
					<Button
						mode="contained"
						contentStyle={{ padding: 8 }}
						onPress={() => {
							navigation.navigate("AuthStack");
						}}
					>
						Sign Up / Log In
					</Button>
				</View>
			</SafeAreaView>
		);
	}
};

export default function BalanceDetailsScreen({ navigation, route }) {
	const { coinInfo } = route.params;
	const coin = coinInfo.coin;
	const roundness = useTheme().roundness;
	const colors = useTheme().colors;
	const { height } = Dimensions.get("window");

	const [intervalTime, setIntervalTime] = useState("1m");
	const [tradeTimespanOption, setTradeTimespanOption] = useState("1H"); //1hour = 1000 * 60 * 60
	const [tradeTimespan, setTradeTimespan] = useState(3600000); //1hour = 1000 * 60 * 60
	const [priceIntervalID, setPriceIntervalID] = useState(null);
	const [graphIntervalID, setGraphIntervalID] = useState(null);
	const [recentPrice, setRecentPrice] = useState(0);
	const [rendered, setRendered] = useState(false);
	const [priceChange, setPriceChange] = useState(0);
	const [priceLoaded, setPriceLoaded] = useState(false);
	const [initPrice, setInitPrice] = useState(null);
	const [readMore, setReadMore] = useState(false);
	const [filterHistory, setFilterHistory] = useState("All");
	const [showFilterHistory, setShowFilterHistory] = useState(false);
	const [info, setInfo] = useState([]);

	const tradeTimespanOptions = ["1H", "1D", "1W", "1M", "1Y"];

	let currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	let percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always" });

	const isFocused = useIsFocused();

	const LIVE_INTERVAL = 1000;
	const GRAPH_INTERVAL = 10000;

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadInfo();
		setRendered(false);
	}, []);

	const loadInfo = async () => {
		setPriceLoaded(false);
		const currentTime = new Date().getTime();
		const startingTime = currentTime - tradeTimespan;
		await GetKlineTrade(coin, intervalTime, startingTime, currentTime).then((result) => {
			setInfo(result.data);
			setInitPrice(result.data[0][3]);
			setPriceLoaded(true);
		});
	};

	const getCurrentPrice = async () => {
		await GetAvgRecentPrice(coin)
			.then((result) => {
				let price = result.data.price;
				setRecentPrice(price);
			})
			.catch(console.error);
	};

	useEffect(() => {
		getCurrentPrice();
		setPriceIntervalID(setInterval(getCurrentPrice, LIVE_INTERVAL));
		return () => {
			clearInterval(priceIntervalID);
			clearInterval(graphIntervalID);
		};
	}, []);

	useEffect(() => {
		const change = (recentPrice - initPrice) / initPrice;
		setPriceChange(change);
	}, [recentPrice, initPrice]);

	useEffect(() => {
		if (coin) {
			let _timeInterval = null;
			let _tradeTimespan = null;
			switch (tradeTimespanOption) {
				case "1H":
					_timeInterval = "1m";
					_tradeTimespan = 3600000;
					break;

				case "1D":
					_timeInterval = "15m";
					_tradeTimespan = 86400000;
					break;

				case "1W":
					_timeInterval = "2h";
					_tradeTimespan = 604800000;
					break;

				case "1M":
					_timeInterval = "4h";
					_tradeTimespan = 2592000000;
					break;

				case "1Y":
					_timeInterval = "1w";
					_tradeTimespan = 31536000000;
					break;

				default:
					break;
			}
			setIntervalTime(_timeInterval);
			setTradeTimespan(_tradeTimespan);
		}
	}, [tradeTimespanOption]);

	useEffect(() => {
		setRendered(false);
	}, [info]);

	useEffect(() => {
		if (graphIntervalID) {
			clearInterval(graphIntervalID);
		}
		setGraphIntervalID(setInterval(loadInfo, GRAPH_INTERVAL));
		loadInfo();
	}, [intervalTime, tradeTimespan]);

	useEffect(() => {
		if (!isFocused) {
			clearInterval(priceIntervalID);
			clearInterval(graphIntervalID);
		} else {
			if (coin && !graphIntervalID) {
				loadInfo();
			}
		}
	}, [isFocused]);

	return (
		<View style={{ flex: 1 }}>
			<PopUpBottomModal
				title="History Category"
				visible={showFilterHistory}
				label={["All", "Deposit & Withdraw", "Convert", "Buy & Sell", "Earn", "Distribution"]}
				// label={["All"]}
				onCloseEnd={() => {
					setShowFilterHistory(false);
				}}
				onLabelChange={(selectedLabel) => {
					setFilterHistory(selectedLabel);
					// sortBy(selectedLabel);
				}}
			/>
			<Appbar title={coin} />
			<ScrollView
				style={{ backgroundColor: colors.card }}
				contentContainerStyle={{ paddingBottom: 0 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{/* Balance */}
				<View style={{ padding: 16, flex: 1 }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Text style={{ fontSize: 48, fontFamily: "Roboto-Light" }}>{Number(priceChange).toFixed(8)}</Text>
					</View>
					<View style={{ flexDirection: "row", alignItems: "flex-start" }}>
						<Caption style={{ fontSize: 16 }}>{currencyFormatter.format(recentPrice)}</Caption>
					</View>
				</View>
				{/* Available or In Orders */}
				<View
					style={{
						backgroundColor: "#29313C",
						paddingVertical: 32,
						flexDirection: "row",
						paddingHorizontal: 16,
						marginBottom: 16,
					}}
				>
					<View style={{ flex: 1 }}>
						<Caption>Available</Caption>
						<Text style={{ fontSize: 24, fontFamily: "Roboto-Light" }}>{Number(priceChange).toFixed(8)}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Caption>In Orders</Caption>
						<Text style={{ fontSize: 24, fontFamily: "Roboto-Light" }}>{Number(priceChange).toFixed(8)}</Text>
					</View>
				</View>
				{/* History Headers */}
				<View style={{ paddingVetical: 16, flex: 1 }}>
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
						<Title style={{ marginHorizontal: 16, marginBottom: 20, marginTop: 10 }}>History</Title>
						<View style={{ marginHorizontal: 16 }}>
							<Button
								mode="contained"
								style={{ borderRadius: 18, backgroundColor: colors.border }}
								contentStyle={{ flexDirection: "row-reverse" }}
								labelStyle={{ color: colors.active }}
								uppercase={false}
								dark={true}
								icon={({ color }) => <Ionicons name="arrow-down" color={color} size={16} />}
								onPress={() => {
									setShowFilterHistory(true);
								}}
							>
								{filterHistory}
							</Button>
						</View>
					</View>
				</View>
				{/* History Lists */}
				<View>
					<TouchableHighlight>
						<View style={{flexDirection: "row"}}>
							
						</View>
					</TouchableHighlight>
				</View>
			</ScrollView>
			<Bottombar coin={coin} currentPrice={recentPrice} />
		</View>
	);
}

// Please note that this price is for reference only. It is not the final transaction price.
