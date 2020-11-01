const getTimeDeltaStringFromMs = (time) => {
	let delta = (new Date(time) - new Date()) / 1e3;
	if (delta < 0) {
		return "Token has expired";
	}
	const hrs = Math.floor(delta / 3600);
	delta = delta % 3600;
	const mins = Math.floor(delta / 60);
	const secs = Math.floor(delta % 60);
	let output = "";
	if (hrs == 1) output += `${hrs}hr `;
	else output += `${hrs}hrs `;
	if (mins == 1) output += `${mins}min `;
	else output += `${mins}mins`;
	return "Token expires in " + output;
};

const formatClassTimestamp = (timestamp) => {
	const datetime = new Date(timestamp);
	const date =
		datetime.getDate() +
		"." +
		(datetime.getMonth() + 1) +
		"." +
		datetime.getFullYear();
	const time =
		("0" + datetime.getHours()).slice(-2) +
		":" +
		("0" + datetime.getMinutes()).slice(-2);
	return {
		date,
		time,
	};
};

const formatTimeRemaining = (timestamp) => {
	let delta = (new Date(timestamp) - new Date()) / 1e3;
	if (delta < 0) {
		return `${delta}`;
	}
	const hrs = Math.floor(delta / 3600);
	delta = delta % 3600;
	if (hrs > 0) return `${hrs}h`;
	const mins = Math.floor(delta / 60);
	if (mins > 0) return `${mins}m`;
	const secs = Math.floor(delta % 60);
	return `${secs}s`;
};

async function postData(url = "", data = {}) {
	return await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
}

/*
const settings_panel = document.querySelector(".settings");
document.querySelector("#btn_settings").addEventListener("click", () => {
	settings_panel.style = "height:100vh;";
	document.querySelector("body").setAttribute("style", "height:170px");
});

document.querySelector(".settings .close").addEventListener("click", () => {
	settings_panel.style = "";
	document.querySelector("body").removeAttribute("style", "");
});
*/
