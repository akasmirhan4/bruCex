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

const getExchangeInfo = () => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/exchangeInfo";
		const queries = {};
		let response = await getResponse(endPointURL, queries, "GET", false);
		resolve(response);
	});
};

const getCoinsInfo = () => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/sapi/v1/capital/config/getall";
		const queries = {
			timestamp: Date.now(),
		};
		let response = await getResponse(endPointURL, queries, "GET", true);
		resolve(response);
	});
};

const getExchangeRate = (fromsymbol, tosymbol = "USDT") => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/ticker/price";
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
		resolve(response);
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
		resolve(response);
	});
};

const UserTradeCoins = (amount, account, fromCoin, toCoin) => {};

const getLast24HoursTrade = (coin) => {
	return new Promise(async (resolve, reject) => {
		const endPointURL = "/api/v3/klines";
		const currentDate = Date.now();
		const queries = {
			symbol: `${coin}BUSD`,
			startTime: currentDate - 24 * 60 * 60 * 1000,
			interval: "1h",
			endTime: currentDate,
		};
		let response = await getResponse(endPointURL, queries, "GET", false);
		resolve(response);
	});
};

export { getBalance, UserBuy, getExchangeRate, UserSell, getExchangeInfo, getCoinsInfo, getLast24HoursTrade };
