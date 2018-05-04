import { h, Component } from "preact";
import { route } from "preact-router";
import { connect } from "preact-redux";
import { storeSecret, storeTeamstatus } from "../../actions";
import linkState from "linkstate";
import axios from "axios";
import style from "./style.less";

@connect(null, { storeSecret, storeTeamstatus })
export default class Login extends Component {
	state = {
		secret: "",
		error: ""
	};

	componentDidMount() {
		const secret = localStorage.getItem("secret");
		if (secret) {
			this.setState({ secret }, () => this.handleSubmit());
		}
	}

	handleSubmit = () => {
		const { secret } = this.state;
		const { code } = this.props;
		axios
			.post("login/", { secret })
			.then(teamstatus => {
				this.props.storeSecret(secret);
				this.props.storeTeamstatus(teamstatus.data[0]);
				localStorage.setItem("secret", secret);
				route(code ? `/s/${code}` : "/s/", true);
			})
			.catch(() => {
				this.setState({ error: "Zlé heslo" });
			});
	};

	render({}, { secret, error }) {
		return (
			<div class={style.home}>
				<h1>Login</h1>
				Tajná fráza:
				<input type="text" value={secret} onInput={linkState(this, "secret")} />
				<button onClick={this.handleSubmit}>Submit</button>
				<br />
				<a>{error}</a>
			</div>
		);
	}
}
