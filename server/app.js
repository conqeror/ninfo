const cors = require("cors");
const express = require("express");
const moment = require("moment");
const isEmpty = require("lodash/isEmpty");
const mysql = require("promise-mysql");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
	host: process.env.HOST,
	user: process.env.DBUSER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	connectionLimit: 10
});

app.post("/login", async (req, res) => {
	let secret;
	try {
		secret = req.body.secret;
	} catch (e) {
		return res.status(500).send("bad request");
	}
	let team;
	try {
		team = await pool.query("SELECT * FROM `teamstatus` WHERE `secret` = ?", [
			secret
		]);
	} catch (e) {
		console.log("team query failed");
		res.status(500).send("server error");
	}
	if (isEmpty(team)) res.status(403).send("bad secret");
	res.json(team);
});

app.post("/level", async (req, res) => {
	let code, secret, team, level;
	try {
		code = req.body.code;
		secret = req.body.secret;
	} catch (e) {
		return res.status(500).send("bad request");
	}
	try {
		team = await pool.query("SELECT * FROM `teamstatus` WHERE `secret` = ?", [
			secret
		]);
		level = await pool.query("SELECT * FROM `levels` WHERE `code` = ?", [code]);
	} catch (e) {
		console.log("solve query failed");
		return res.status(500).send("server error");
	}
	if (isEmpty(level)) return res.status(403).send("bad code");
	const { levelnum, hint_time, dead_time, leave_time } = level[0];
	if (team[0].level + 1 !== levelnum) res.status(403).send("wrong level");
	const newLevelnum = level[0].levelnum;
	const newTime = moment().unix();
	const newHintTime = Math.min(
		moment()
			.add(hint_time, "m")
			.unix(),
		Math.max(Math.floor((moment().unix() + leave_time) / 2), moment().unix())
	);
	pool
		.query(
			"UPDATE `teamstatus` SET `level` = ?, `arrival_time` = ?, `hint_time` = ?, `leave_time` = ?, `dead_time` = ?, hint = '', dead = '' WHERE `secret` = ?",
			[newLevelnum, newTime, newHintTime, leave_time, dead_time, secret]
		)
		.catch(e => {
			console.log(e);
			return res.status(500).send("server error");
		});
	const query = {
		timestamp: newTime,
		team_id: team[0].team_id,
		level: newLevelnum,
		action_type: "LEVEL"
	};
	pool.query("INSERT INTO `actions` SET ?", query).catch(e => console.log(e));
	return res.json({
		...team[0],
		level: newLevelnum,
		arrival_time: newTime,
		hint_time: newHintTime,
		leave_time,
		dead_time,
		hint: "",
		dead: ""
	});
});

app.put("/hint", async (req, res) => {
	let team, level, secret;
	try {
		secret = req.body.secret;
	} catch (e) {
		return res.status(500).send("bad request");
	}
	try {
		team = await pool.query("SELECT * FROM `teamstatus` WHERE `secret` = ?", [
			secret
		]);
		level = await pool.query("SELECT * FROM `levels` WHERE `levelnum` = ?", [
			team[0].level
		]);
	} catch (e) {
		console.log("hint query failed");
		console.log(secret, team, level);
		return res.status(500).send("server error");
	}
	if (isEmpty(level)) return res.status(403).send("bad secret");
	level = level[0];
	team = team[0];
	if (moment().isBefore(moment.unix(team.hint_time)))
		return res.status(403).send("too early");
	pool.query("UPDATE `teamstatus` SET `hint` = ? WHERE `secret` = ?", [
		level.hint,
		secret
	]);
	const query = {
		timestamp: moment().unix(),
		team_id: team[0].team_id,
		level: team[0].level,
		action_type: "HINT"
	};
	pool.query("INSERT INTO `actions` SET ?", query).catch(e => console.log(e));
	return res.json({ ...team, hint: level.hint });
});

app.put("/dead", async (req, res) => {
	let team, level, secret;
	try {
		secret = req.body.secret;
	} catch (e) {
		return res.status(500).send("bad request");
	}
	try {
		team = await pool.query("SELECT * FROM `teamstatus` WHERE `secret` = ?", [
			secret
		]);
		level = await pool.query("SELECT * FROM `levels` WHERE `levelnum` = ?", [
			team[0].level
		]);
	} catch (e) {
		console.log("dead query failed");
		res.status(500).send("server error");
	}
	if (isEmpty(level)) return res.status(403).send("bad secret");
	level = level[0];
	team = team[0];
	if (moment().isBefore(moment.unix(team.hint_time)))
		return res.status(403).send("too early");
	pool.query("UPDATE `teamstatus` SET `dead` = ? WHERE `secret` = ?", [
		level.dead,
		secret
	]);
	const query = {
		timestamp: moment().unix(),
		team_id: team[0].team_id,
		level: team[0].level,
		action_type: "DEAD"
	};
	pool.query("INSERT INTO `actions` SET ?", query).catch(e => console.log(e));
	return res.json({ ...team, dead: level.dead });
});

app.listen(3000, () => console.log("Ninfo listening on port 3000!"));
