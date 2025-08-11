export const FOREUP_API_CONFIG = {
	apiKey: "no_limits",
	baseUrl: "https://foreupsoftware.com/index.php/api",
	baseRequestHeaders: {
		"X-Requested-With": "XMLHttpRequest",
		"X-Fu-Golfer-Location": "foreup",
	},
} as const;

export const SUNKEN_MEADOW_CONFIG = {
	courseId: 19_766,
	name: "Sunken Meadow State Park",
	scheduleName: "Sunken Meadow 18",
	scheduleId: 2437,
	bookingClassId: 51_086,
	teesheetSideFrontId: 1338,
	teesheetSideBackId: 1339,
	greenFeeTax: 0,
	greenFees: {
		weekday: 28,
		weekdayTwilight: 20,
		weekend: 33,
		weekendTwilight: 23,
	},
	allowCarts: false,
	cartFee: 0,
	cartFeeTax: 0,
	duration: 1,
	foreUpDiscount: 0,
	foreUpTradeDiscountRate: 0,
	tradeMinPlayers: 0,
	totalHoles: 18,
	totalPlayersArray: [1, 2, 3, 4],
} as const;

export type GreenFee =
	(typeof SUNKEN_MEADOW_CONFIG.greenFees)[keyof typeof SUNKEN_MEADOW_CONFIG.greenFees];
export type GreenFeeString = `${GreenFee}`;

export type TotalPlayers = (typeof SUNKEN_MEADOW_CONFIG.totalPlayersArray)[number];
export type TotalPlayersString = `${TotalPlayers}`;
