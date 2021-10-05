import axios from "./axios";
import react from "react";

const GetKlineTrade = async (coin, interval = "1h", startTime = null, endTime = null) => {
	const endPointURL = "/api/v3/klines";
	const currentDate = Date.now();
	const queries = {
		symbol: `${coin}BUSD`,
		startTime: startTime ?? currentDate - 24 * 60 * 60 * 1000,
		interval,
		endTime: endTime ?? currentDate,
	};
	let response = await axios({ method: "GET", url: endPointURL, params: queries });
	return response;
};
const GetAvgRecentPrice = async (coin) => {
	const endPointURL = "/api/v3/avgPrice";
	const queries = {
		symbol: `${coin}BUSD`,
	};
	let response = await axios({ method: "GET", url: endPointURL, params: queries });
	return response;
};

export { GetKlineTrade, GetAvgRecentPrice };