import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, RefreshControl, SafeAreaView, TouchableHighlight, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Button, Caption, Divider, Headline, IconButton, Paragraph, Portal, Subheading, Text, Title, useTheme } from "react-native-paper";
import Graph from "../../../assets/components/Graph";
import { GetAvgRecentPrice, GetKlineTrade } from "../../../assets/service/Binance";
import { auth } from "../../../assets/service/Firebase";

const Appbar = (props) => {
	const navigation = useNavigation();
	const colors = useTheme().colors;
	const [isFavorite, setIsFavorite] = useState(false);
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
			<View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
				<IconButton
					icon={({ color, size }) => (
						<MaterialIcons name={isFavorite ? "favorite" : "favorite-outline"} color={isFavorite ? color : colors.inactive} size={size} />
					)}
					onPress={() => {
						setIsFavorite(!isFavorite);
					}}
				/>
			</View>
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
				<View style={{ flexDirection: "row", padding: 16 }}>
					<View style={{ flex: 1 }}>
						<Title>{`${Number(coinBalance).toFixed(8)} ${props.coin}`}</Title>
						<Caption style={{ color: colors.altText }}>{`≈${currencyFormatter.format(coinBalance * currentPrice)}`}</Caption>
					</View>
					<View style={{ justifyContent: "center" }}>
						<Button
							mode="contained"
							contentStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
							onPress={() => {
								navigation.navigate("Buy", { coin: props.coin });
							}}
						>
							Buy
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

export default function CoinDetailsScreen({ navigation, route }) {
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
			<Appbar title={coin} />
			<ScrollView
				style={{ backgroundColor: colors.card }}
				contentContainerStyle={{ paddingBottom: 0 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{/* Prices */}
				<View style={{ backgroundColor: colors.card, padding: 16, flex: 1 }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Text style={{ fontSize: 48, fontFamily: "Roboto-Light" }}>{currencyFormatter.format(recentPrice)}</Text>
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
					<View style={{ flexDirection: "row", alignItems: "flex-start" }}>
						<Caption style={{ color: priceChange < 0 ? "red" : "green", fontSize: 16 }}>{percentFormatter.format(priceChange)}</Caption>
						<Ionicons
							style={{ marginVertical: 2, marginLeft: 4 }}
							name={priceChange < 0 ? "caret-down" : "caret-up"}
							size={16}
							color={priceChange < 0 ? "red" : "green"}
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
						paddingVertical: 32,
					}}
				>
					{/* Graph */}
					{info.length > 0 && (
						<View style={{ marginBottom: 16, marginHorizontal: 8 }}>
							<Graph
								style={{ width: "100%", height: 0.4 * height, maxHeight: 1000, marginVertical: 16 }}
								info={info}
								onRendered={() => {
									setRendered(true);
									setRefreshing(false);
								}}
								rendered={rendered}
							/>
						</View>
					)}
					{/* Options */}
					<View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 32 }}>
						{tradeTimespanOptions.map((option, index) => (
							<Button
								mode="contained"
								style={{ borderRadius: 18, backgroundColor: tradeTimespanOption == option ? colors.border : null }}
								labelStyle={{ color: tradeTimespanOption == option ? colors.active : colors.inactive }}
								uppercase={false}
								dark={true}
								onPress={() => {
									setTradeTimespanOption(option);
								}}
								children={option}
								key={index}
							/>
						))}
					</View>
					{/* Convert Button */}
					<TouchableOpacity
						style={{ backgroundColor: colors.altBackground, paddingVertical: 16, paddingLeft: 16, flexDirection: "row", alignItems: "center" }}
						onPress={() => {
							navigation.navigate("Convert", { fromCoin: coin });
						}}
					>
						<View style={{ flex: 1 }}>
							<Title style={{ fontFamily: "Roboto-Regular" }}>Convert</Title>
							<Caption style={{ color: colors.altText }}>Support fast conversion between coins</Caption>
						</View>
						<MaterialCommunityIcons name="swap-horizontal-variant" size={50} color={colors.primary} style={{ paddingHorizontal: 8, marginRight: 8 }} />
						<View
							style={{
								backgroundColor: "#38424E",
								paddingRight: 12,
								paddingLeft: 16,
								borderTopLeftRadius: "50%",
								borderBottomLeftRadius: "50%",
								paddingVertical: 4,
							}}
						>
							<Ionicons name="arrow-forward" size={24} color={colors.text} />
						</View>
					</TouchableOpacity>
					{/* About */}
					<View style={{ padding: 16 }}>
						<Title>About {coin}</Title>
						<Caption style={{ color: colors.altText }} numberOfLines={readMore ? null : 3}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Diam ut venenatis
							tellus in metus vulputate. Egestas integer eget aliquet nibh praesent tristique magna sit. Scelerisque fermentum dui faucibus in ornare quam.
							Pellentesque habitant morbi tristique senectus et. Ut porttitor leo a diam sollicitudin. Massa sapien faucibus et molestie ac. Viverra adipiscing
							at in tellus integer feugiat. Malesuada pellentesque elit eget gravida cum sociis natoque. Quis vel eros donec ac. Congue nisi vitae suscipit
							tellus mauris a diam maecenas sed. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Eu facilisis sed odio morbi quis commodo
							odio aenean sed. Pharetra magna ac placerat vestibulum lectus. Orci porta non pulvinar neque laoreet. Tristique nulla aliquet enim tortor at.
							Consequat interdum varius sit amet mattis vulputate enim. Sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus. Pellentesque eu
							tincidunt tortor aliquam nulla facilisi. Tortor dignissim convallis aenean et tortor at risus viverra. Augue interdum velit euismod in
							pellentesque. Ipsum suspendisse ultrices gravida dictum. Viverra suspendisse potenti nullam ac tortor vitae purus. Sagittis id consectetur purus
							ut faucibus. Lobortis feugiat vivamus at augue eget arcu dictum varius. Morbi tristique senectus et netus et malesuada. Tincidunt augue interdum
							velit euismod in pellentesque massa. Cursus vitae congue mauris rhoncus aenean. Sed libero enim sed faucibus turpis. Gravida quis blandit turpis
							cursus in hac habitasse platea. Aenean euismod elementum nisi quis eleifend quam adipiscing. Et netus et malesuada fames ac turpis. In nulla
							posuere sollicitudin aliquam ultrices. Congue nisi vitae suscipit tellus mauris a diam maecenas. Eros in cursus turpis massa. Eu scelerisque felis
							imperdiet proin fermentum leo. Ut sem viverra aliquet eget sit amet tellus cras. Enim nec dui nunc mattis enim ut. Lectus proin nibh nisl
							condimentum id. Justo laoreet sit amet cursus sit. Elementum eu facilisis sed odio morbi quis commodo odio. Habitant morbi tristique senectus et
							netus. Blandit aliquam etiam erat velit scelerisque. Purus gravida quis blandit turpis cursus in hac habitasse. Morbi tristique senectus et netus
							et. Aenean sed adipiscing diam donec adipiscing. Nunc id cursus metus aliquam eleifend mi in nulla. Tortor condimentum lacinia quis vel eros
							donec. Aliquam sem et tortor consequat id porta nibh venenatis cras. Nisi quis eleifend quam adipiscing vitae. Interdum posuere lorem ipsum dolor
							sit amet. Id cursus metus aliquam eleifend mi in nulla. Viverra ipsum nunc aliquet bibendum enim facilisis. Quis ipsum suspendisse ultrices
							gravida dictum fusce. Et netus et malesuada fames ac turpis egestas. Sollicitudin tempor id eu nisl nunc. Ullamcorper sit amet risus nullam eget
							felis eget. Gravida quis blandit turpis cursus in. Eget magna fermentum iaculis eu non diam phasellus. Euismod lacinia at quis risus sed vulputate
							odio. Sed tempus urna et pharetra pharetra massa. Nulla facilisi nullam vehicula ipsum a. Diam volutpat commodo sed egestas egestas fringilla
							phasellus. Sagittis id consectetur purus ut faucibus pulvinar. Amet nisl suscipit adipiscing bibendum est ultricies integer quis auctor. Diam ut
							venenatis tellus in metus vulputate eu. Vel elit scelerisque mauris pellentesque. Feugiat in ante metus dictum at tempor commodo ullamcorper a.
							Sed id semper risus in hendrerit gravida. Cursus mattis molestie a iaculis at erat pellentesque adipiscing commodo. Mattis rhoncus urna neque
							viverra justo nec. Ac placerat vestibulum lectus mauris ultrices. Nunc scelerisque viverra mauris in aliquam.
						</Caption>
						<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
							<Button
								uppercase={false}
								style={{ marginTop: 8 }}
								onPress={() => {
									setReadMore(!readMore);
								}}
							>
								{readMore ? "Collapse" : "Read More"}
							</Button>
						</View>
					</View>
					{/* News */}
					<View style={{ padding: 16 }}>
						<Title>News</Title>
					</View>
					<Divider style={{ height: 1, backgroundColor: colors.altText }} />
					{[0, 1, 2].map((news, index) => {
						const time = new Date().toLocaleString();
						return (
							<TouchableHighlight key={index} underlayColor="#FFFFFF11" onPress={() => {}}>
								<View>
									<View style={{ padding: 16 }}>
										<Title style={{ fontFamily: "Roboto-Light" }}>Empty 🕸</Title>
										<Caption>{time}</Caption>
									</View>
									<Divider />
								</View>
							</TouchableHighlight>
						);
					})}
				</View>
			</ScrollView>
			<Bottombar coin={coin} currentPrice={recentPrice} />
		</View>
	);
}

// Please note that this price is for reference only. It is not the final transaction price.
