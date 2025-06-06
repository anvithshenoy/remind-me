const reminderList = document.getElementById("reminderList")
const addForm = document.getElementById("addForm")
const messageInput = document.getElementById("messageInput")
const intervalInput = document.getElementById("intervalInput")
const soundInput = document.getElementById("soundInput")
const muteInput = document.getElementById("muteInput")
const globalMuteCheckbox = document.getElementById("globalMuteCheckbox")

function loadGlobalMute() {
	chrome.storage.local.get("globalMuted", (res) => {
		globalMuteCheckbox.checked = res.globalMuted || false
	})
}

globalMuteCheckbox.onchange = () => {
	chrome.storage.local.set(
		{ globalMuted: globalMuteCheckbox.checked },
		loadReminders
	)
}

function loadReminders() {
	loadGlobalMute()
	chrome.storage.local.get("reminders", (res) => {
		const reminders = res.reminders || []
		reminderList.innerHTML = ""
		reminders.forEach((reminder, index) => {
			const li = document.createElement("li")
			li.textContent = `${reminder.message} (every ${reminder.interval} min)`
			if (reminder.muted) li.textContent += " 🔇"

			const delBtn = document.createElement("button")
			delBtn.textContent = "Delete"
			delBtn.onclick = () => deleteReminder(index)

			li.appendChild(delBtn)
			reminderList.appendChild(li)
		})
	})
}

function deleteReminder(index) {
	chrome.storage.local.get("reminders", (res) => {
		const reminders = res.reminders || []
		reminders.splice(index, 1)
		chrome.storage.local.set({ reminders }, () => {
			chrome.alarms.clearAll(() => {
				reminders.forEach((r, i) =>
					chrome.alarms.create(`reminder-${i}`, { periodInMinutes: r.interval })
				)
			})
			loadReminders()
		})
	})
}

addForm.onsubmit = (e) => {
	e.preventDefault()
	const newReminder = {
		message: messageInput.value.trim(),
		interval: parseInt(intervalInput.value),
		sound: soundInput.value || null,
		muted: muteInput.checked,
	}
	chrome.storage.local.get("reminders", (res) => {
		const reminders = res.reminders || []
		reminders.push(newReminder)
		chrome.storage.local.set({ reminders }, () => {
			const index = reminders.length - 1
			chrome.alarms.create(`reminder-${index}`, {
				periodInMinutes: newReminder.interval,
			})
			loadReminders()
		})
	})
	addForm.reset()
}

loadReminders()
