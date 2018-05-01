import { createStore } from "redux";

let ACTIONS = {
	STORE_TEAMSTATUS: (state, { teamstatus }) => ({
		...state,
		teamstatus
	}),

	STORE_RESULTS: (state, { results }) => ({
		...state,
		results
	}),

	STORE_SECRET: (state, { secret }) => ({
		...state,
		secret
	})
};

const INITIAL = {
	teamstatus: {},
	results: {},
	secret: ""
};

export default createStore(
	(state, action) =>
		action && ACTIONS[action.type]
			? ACTIONS[action.type](state, action)
			: state,
	INITIAL,
	typeof devToolsExtension === "function" ? devToolsExtension() : undefined
);
