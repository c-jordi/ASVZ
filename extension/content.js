class ASVZTarget {
	async build() {
		const token = this.getToken();
		const lessonId = this.getLessonId();
		const lessonInfo = await this.getLessonInfo(lessonId);
		const lessonStatus = await this.getLessonStatus(token, lessonInfo);
		this.addRuntimeListener(token, lessonInfo, lessonStatus);
	}

	getToken() {
		const token_key = Object.keys(window.localStorage).find((k) =>
			k.includes("oidc.user")
		);
		const token_string = window.localStorage.getItem(token_key);
		return JSON.parse(token_string);
	}

	getLessonId() {
		return window.location.href.match(/[0-9]{1,}/g)[0];
	}

	async getLessonInfo(lessonId) {
		return new Promise(async (resolve) => {
			const request = await fetch(
				`https://schalter.asvz.ch/tn-api/api/Lessons/${lessonId}`
			);
			const data = await request.json();
			resolve(data.data);
		});
	}

	getLessonStatus(token, lessonInfo) {
		const current_time = new Date().getTime();
		const enrollment_from = new Date(lessonInfo.enrollmentFrom).getTime();
		const token_valid_until = token.expires_at * 1e3;

		if (current_time > enrollment_from) return [false, "closed"];
		if (current_time > token_valid_until) return [false, "token has expired"];
		if (token_valid_until < enrollment_from)
			return [false, "token will expire"];

		return [true, "open"];
	}

	getLessonStatus(token, lessonInfo) {
		const current_time = new Date().getTime();
		const enrollment_from = new Date(lessonInfo.enrollmentFrom).getTime();
		const token_valid_until = token.expires_at * 1e3;

		if (current_time > enrollment_from) return [false, "closed"];
		if (current_time > token_valid_until) return [false, "token has expired"];
		if (token_valid_until < enrollment_from)
			return [false, "token will expire"];

		return [true, "open"];
	}

	addRuntimeListener(token, lessonInfo, lessonStatus) {
		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			if (request.fn == "get_target_status") {
				sendResponse({ token, lessonInfo, lessonStatus });
			}
		});
	}
}

const asvz_target = new ASVZTarget();
asvz_target.build();
