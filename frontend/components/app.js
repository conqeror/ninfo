import { h, Component } from "preact";
import { Provider } from "preact-redux";
import { Router } from "preact-router";

import store from "../store";
import Header from "./header";
import Submit from "./submit";
import Results from "./results";
import Login from "./login";

export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */

	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<Provider store={store}>
				<div id="app">
					<Header />
					<Router onChange={this.handleRoute}>
						<Login path="/" />
						<Login path="/:code" />
						<Submit path="/s" />
						<Submit path="/s/:code" />
						<Results path="/r/" />
					</Router>
				</div>
			</Provider>
		);
	}
}
