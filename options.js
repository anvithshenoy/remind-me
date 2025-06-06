document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get(["settings"], (res) => {
		const settings = res.settings || {}
		document.getElementById("sound").value = settings.sound || "default.mp3"
		document.getElementById("badgeEnabled").checked =
			settings.badgeEnabled || false
	})

	document.getElementById("save").onclick = () => {
		const settings = {
			sound: document.getElementById("sound").value,
			badgeEnabled: document.getElementById("badgeEnabled").checked,
		}
		chrome.storage.local.set({ settings }, () => alert("Settings saved!"))
	}
})
