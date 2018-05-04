import { h, Component } from "preact";
import { route } from "preact-router";
import { connect } from "preact-redux";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { storeTeamstatus } from "../../actions";
import axios from "axios";
import moment from "moment";
import linkState from "linkstate";
import style from "./style.less";

const defaultState = {
	pass: "",
	wrongCode: ""
};

@connect(state => ({ secret: state.secret, teamstatus: state.teamstatus }), {
	storeTeamstatus
})
export default class Submit extends Component {
	state = { ...defaultState, time: moment().unix() };

	componentDidMount() {
		const { secret, code } = this.props;
		if (!secret) {
			route(code ? `/${code}` : "/", true);
		}
		if (code) {
			this.handleSubmit(code);
		}
		this.interval = setInterval(
			() => this.setState({ time: moment().unix() }),
			1000
		);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	handleSubmit = code => {
		const { pass } = this.state;
		const { secret } = this.props;
		axios
			.post("level/", { secret, code: pass || code })
			.then(teamstatus => {
				this.props.storeTeamstatus(teamstatus.data);
				this.setState(defaultState);
				route("/s", true);
			})
			.catch(() => {
				this.setState({ wrongCode: pass || code });
			});
	};

	handleHint = () => {
		const { secret } = this.props;
		axios
			.put("hint/", { secret })
			.then(teamstatus => this.props.storeTeamstatus(teamstatus.data));
	};

	handleDead = () => {
		const { secret } = this.props;
		confirmAlert({
			title: "Zobrať dead",
			message: "Naozaj chcete zobrať dead?",
			buttons: [
				{
					label: "Áno",
					onClick: () => {
						axios
							.put("dead/", { secret })
							.then(teamstatus => this.props.storeTeamstatus(teamstatus.data));
					}
				},
				{ label: "Nie" }
			]
		});
	};

	render({ teamstatus }, { pass, wrongCode, time }) {
		const {
			hint,
			dead,
			arrival_time,
			hint_time,
			leave_time,
			level
		} = teamstatus;
		const canTakeHint = moment.unix(hint_time).isBefore(moment.unix(time));
		console.log(canTakeHint);
		return (
			<div class={style.home}>
				<h1>Stanovište {level}</h1>
				{arrival_time && (
					<p>Prišli ste o {moment.unix(arrival_time).format("HH:mm")}.</p>
				)}
				{hint && !dead && <p>Hint: {hint}</p>}
				{dead && <p>Dead: {dead}</p>}
				Kód stanovišťa {level + 1}:<br />
				<input type="text" value={pass} onInput={linkState(this, "pass")} />
				<button onClick={this.handleSubmit}>Submit</button>
				<br />
				{wrongCode && <p>{wrongCode} je nesprávny kód.</p>}
				<br />
				{!hint && (
					<div>
						<button onClick={this.handleHint} disabled={!canTakeHint}>
							Zobrať hint
						</button>
						{!canTakeHint && (
							<a> (od {moment.unix(hint_time).format("HH:mm")})</a>
						)}
					</div>
				)}
				<br />
				{!dead && (
					<div>
						<button onClick={this.handleDead} disabled={!canTakeHint}>
							Zobrať dead
						</button>
						{!canTakeHint && (
							<a> (od {moment.unix(hint_time).format("HH:mm")})</a>
						)}
					</div>
				)}
				<br />
				<a>
					Odporúčame odísť alebo zobrať dead do
					{` ${moment.unix(leave_time).format("HH:mm")}`}
				</a>
			</div>
		);
	}
}
