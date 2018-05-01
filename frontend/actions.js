export function storeTeamstatus(teamstatus) {
	return {
		type: "STORE_TEAMSTATUS",
		teamstatus
	};
}

export function storeResults(results) {
	return {
		type: "STORE_RESULTS",
		results
	};
}

export function storeSecret(secret) {
	return {
		type: "STORE_SECRET",
		secret
	};
}
