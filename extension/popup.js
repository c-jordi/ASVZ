const SERVER = "https://jordi.co/asvz/";

class ASVZPanel {
	constructor() {
		this.removeTarget = this.removeTarget.bind(this);
		this.removeTargetPanel = this.removeTargetPanel.bind(this);
		this.setASVZToken = this.setASVZToken.bind(this);
		this.loadTargets = this.loadTargets.bind(this);
		this.addTarget = this.addTarget.bind(this);
		this.addTargetPanel = this.addTargetPanel.bind(this);
		this.clearLessons = this.clearLessons.bind(this);
		this.token = null;
		this.build();
	}

	build() {
		this.initASVZPanel();
		this.addListeners();
	}

	initASVZPanel() {
		const setASVZToken = this.setASVZToken;
		chrome.storage.local.get(["token"], function ({ token }) {
			if (token) {
				setASVZToken(token);
			}
		});
	}

	setASVZToken(token) {
		this.token = token;
		const timeDelta = getTimeDeltaStringFromMs(token.expires_at * 1e3);
		document.querySelector(
			".token-info"
		).textContent = `${token.name} | ${timeDelta}`;
		document.querySelector(".user-info").textContent = `id: ${token.person_id}`;
		this.loadTargets();
	}

	async connect() {
		const target = await this.acquireTarget();
		this.processTarget(target);
	}

	async loadTargets() {
		if (this.token) {
			const resp = await postData(SERVER + "load", {
				name: this.token.name,
				user_id: this.token.person_id,
			});
			const data = await resp.json();
			this.clearLessons();
			this.processLoadResp(data);
		}
	}

	processLoadResp(resp) {
		if (!resp.is_auth) {
			return this.alertMessage("You are not whitelisted");
		}
		console.log(resp);
		resp.targets
			.map((target) => {
				const { date, time } = formatClassTimestamp(target.lesson_time);
				const timeRemaining = formatTimeRemaining(target.enrollment_time);
				target.date = date;
				target.time = time;
				target.timeRemaining = timeRemaining;

				return target;
			})
			.forEach(this.addTargetPanel);
	}

	alertMessage(message) {
		const lessons = document.querySelector(".lessons");
		lessons.innerHTML = "";
		const msg_container = document.createElement("div");
		msg_container.className = "alert";
		msg_container.innerText = message;
		lessons.append(msg_container);
	}

	clearLessons() {
		document.querySelector(".lessons").innerHTML = "";
	}

	acquireTarget() {
		return new Promise((resolve, reject) => {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				if (tabs[0].url && tabs[0].url.includes("schalter.asvz.ch/tn/")) {
					chrome.tabs.sendMessage(
						tabs[0].id,
						{ fn: "get_target_status" },
						resolve
					);
				} else {
					reject("No ASVZ target");
				}
			});
		});
	}

	processTarget(target) {
		this.target = target;
		if (this.target.lessonStatus[0]) this.addAddButton();
		this.storeToken(target.token);
	}

	storeToken(data) {
		const token = {
			name: data.profile.given_name,
			expires_at: data.expires_at,
			access_token: data.access_token,
			person_id: data.profile.name,
			auth_time: data.profile.auth_time,
		};
		chrome.storage.local.set({ token: token });

		return this.setASVZToken(token);
	}

	addAddButton() {
		const add_button = document.querySelector("#btn_add");
		if (add_button.disabled) {
			add_button.disabled = false;
		}
	}

	async addTarget() {
		const { lessonInfo } = this.target;
		const token = this.token;
		await postData(SERVER + "add", {
			target: {
				lesson_id: lessonInfo.id,
				lesson_name: lessonInfo.sportName,
				lesson_time: new Date(lessonInfo.starts).getTime(),
				enrollment_from: new Date(lessonInfo.enrollmentFrom).getTime(),
			},
			user_id: token.person_id,
			name: token.name,
			access_token: token.access_token,
		});
		window.location.reload();
	}

	async addTargetTest() {
		await postData(SERVER + "add", {
			target: {
				lesson_id: "323",
				lesson_name: "cycling",
				lesson_time: new Date() - 1 + 4e5,
				enrollment_from: new Date() - 1 + 3e5,
			},
			user_id: 439019,
			name: "Jordi",
			token: "rrr",
		});
		window.location.reload();
	}

	async removeTarget(data) {
		if (data.past) {
			await postData(SERVER + "hide", {
				lesson_id: data.lesson_id,
				user_id: data.user_id,
				job_id: data.job_id,
				name: data.name,
				lesson_time: data.lesson_time,
			});
		} else {
			await postData(SERVER + "remove", {
				lesson_id: data.lesson_id,
				user_id: data.user_id,
				job_id: data.job_id,
				name: data.name,
				lesson_time: data.lesson_time,
			});
		}

		window.location.reload();
	}

	addTargetPanel(data) {
		const template = document.querySelector("#tmp_target");
		const clone = template.content.cloneNode(true);
		return this.addTargetPanelProperties(clone, data);
	}

	addTargetPanelProperties(clone, data) {
		const lesson = clone.querySelector(".lesson");
		lesson.setAttribute("data-id", data.job_id);
		const title = clone.querySelector("h4");
		title.textContent = data.lesson_name;
		title.setAttribute(
			"href",
			`https://schalter.asvz.ch/tn/lessons/${data.lesson_id}`
		);
		const date = clone.querySelector(".date");
		date.textContent = data.date;
		const time = clone.querySelector(".time");
		time.textContent = data.time;
		return this.addTargetSymbol(clone, data);
	}

	addTargetSymbol(clone, data) {
		const timeRemaining = clone.querySelector(".status .symbol");
		timeRemaining.setAttribute("data-id", data.id);
		if (new Date() - data.enrollment_time > 0) {
			data.past = true;
			const is_regist = data.position != -1;
			timeRemaining.classList.add(is_regist ? "success" : "fail");
			timeRemaining.textContent = is_regist ? data.position : "×";
		} else {
			timeRemaining.textContent = data.timeRemaining;
		}
		console.log(data);
		return this.addTargetPanelListeners(clone, data);
	}

	addTargetPanelListeners(clone, data) {
		const removeTarget = this.removeTarget;
		clone.querySelector(".symbol").addEventListener("click", function () {
			removeTarget(data);
		});
		clone.querySelector("h4").addEventListener(
			"click",
			function () {
				chrome.tabs.create({
					url: `https://schalter.asvz.ch/tn/lessons/${data.lesson_id}`,
				});
			},
			false
		);
		return this.appendTargetPanel(clone, data);
	}

	appendTargetPanel(clone, data) {
		const lessons = document.querySelector(".lessons");
		lessons.prepend(clone);
		if (!data.past) return this.setTargetCountdown(data);
	}

	setTargetCountdown(data) {
		const target = document.querySelector(`.symbol[data-id='${data.id}']`);
		const delta = Math.floor(
			(new Date(data.enrollment_time) - new Date()) / 1e3
		);
		const countDuration = Math.min(delta, 60);
		const countdownStart = delta - countDuration;
		setTimeout(
			this.startCountdown(target, countDuration),
			countdownStart * 1e3
		);
	}

	startCountdown(clone, countDuration) {
		function decreaseCount(countdown) {
			if (document.body.contains(clone)) {
				if (countdown > 0) {
					clone.textContent = countdown + "s";
					setTimeout(() => decreaseCount(countdown - 1), 1000);
				} else {
					clone.textContent = "?";
					setTimeout(() => window.location.reload(), 2000);
				}
			}
		}
		return () => {
			decreaseCount(countDuration);
		};
	}

	removeTargetPanel(targetId) {
		return this.removeTargetPanel(targetId);
	}

	removeTargetPanel(targetId) {
		const lessons = document.querySelector(".lessons");
		const lesson = lessons.querySelector(`.lesson[data-id="${targetId}"]`);
		lessons.removeChild(lesson);
	}

	addListeners() {
		document
			.querySelector("#btn_add")
			.addEventListener("click", this.addTarget);
	}
}

const panel = new ASVZPanel();
panel.connect();
