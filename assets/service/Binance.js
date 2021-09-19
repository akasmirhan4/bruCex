import { API_KEY, SECRET_KEY } from "@env";
import * as CryptoJS from "crypto-js";
const baseURL = "https://api.binance.com";

async function getResponse(endPointURL, queries, method = "GET", withHeader = true) {
	let queriesURL = Object.entries(queries)
		.map((e) => e.join("="))
		.join("&");

	const signature = CryptoJS.HmacSHA256(queriesURL, SECRET_KEY).toString(CryptoJS.enc.Hex);

	let url = baseURL + endPointURL + "?" + queriesURL;
	url = withHeader ? url + "&signature=" + signature : url;
	console.log(url);
	return new Promise(async (resolve, reject) => {
		await fetch(url, {
			method: method,
			...(withHeader && {
				headers: {
					"X-MBX-APIKEY": API_KEY,
				},
			}),
		})
			.then(async (response) => {
				let result = await response.json();
				resolve(result);
			})
			.catch(reject);
	});
}

const getExchangeRate = (fromsymbol, tosymbol = "USDT") => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/ticker/price";
		console.log(fromsymbol + tosymbol);
		const queries = {
			symbol: fromsymbol + tosymbol,
		};
		let response = await getResponse(endPointURL, queries, "GET", false);
		resolve(response);
	});
};

const getBalance = (symbol) => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/account";
		const queries = {
			timestamp: Date.now(),
		};
		let response = await getResponse(endPointURL, queries);
		result = response.balances.find((balance) => balance.asset == symbol);
		resolve(result);
	});
};

const UserDeposit = (amount, account) => {};

const UserDepositCoins = (amount, account, toCoin) => {};

const UserWithdraw = (amount, account) => {};

const UserWithdrawExternal = (amount, account, address) => {};

const UserBuy = (amount, toCoin) => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/order";
		const queries = {
			timestamp: Date.now(),
			symbol: `${toCoin}USDT`,
			type: "MARKET",
			side: "BUY",
			quantity: amount,
		};
		let response = await getResponse(endPointURL, queries, "POST");
		console.log(response);
		resolve(response);
	});
};
const UserSell = (amount, toCoin) => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/order";
		const queries = {
			timestamp: Date.now(),
			symbol: `${toCoin}USDT`,
			type: "MARKET",
			side: "SELL",
			quantity: amount,
		};
		let response = await getResponse(endPointURL, queries, "POST");
		console.log(response);
		resolve(response);
	});
};

const UserTradeCoins = (amount, account, fromCoin, toCoin) => {};

export { getBalance, UserBuy, getExchangeRate, UserSell };
