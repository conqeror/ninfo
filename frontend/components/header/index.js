import { h, Component } from "preact";
import { Link } from "preact-router";
import style from "./style.less";

export default class Header extends Component {
	render() {
		return (
			<header class={style.header}>
				<h1>Ninfo</h1>
				<nav>
					<Link href="/s">Submit</Link>
					<Link href="/r">Results</Link>
				</nav>
			</header>
		);
	}
}
