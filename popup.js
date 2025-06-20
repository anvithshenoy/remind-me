const reminderList = document.getElementById("reminderList");
const addForm = document.getElementById("addForm");
const messageInput = document.getElementById("messageInput");
const intervalInput = document.getElementById("intervalInput");
const soundInput = document.getElementById("soundInput");
const muteInput = document.getElementById("muteInput");
const globalMuteCheckbox = document.getElementById("globalMuteCheckbox");

globalMuteCheckbox.onchange = () => {
  chrome.storage.local.set(
    { globalMuted: globalMuteCheckbox.checked },
    loadReminders
  );
};

function loadReminders() {
  chrome.storage.local.get(["reminders", "globalMuted"], (res) => {
    const reminders = res.reminders || [];
    const isMuted = res.globalMuted || false;

    // Badge
    if (!isMuted) {
      chrome.action.setBadgeText({
        text: reminders.length ? `${reminders.length}` : "",
      });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }

    reminderList.innerHTML = "";
    reminders.forEach((reminder, index) => {
      const li = document.createElement("li");
      li.textContent = `${reminder.message} (every ${reminder.interval} min)`;
      if (reminder.muted) li.textContent += " 🔇";

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => deleteReminder(index);

      li.appendChild(delBtn);
      reminderList.appendChild(li);
    });

    globalMuteCheckbox.checked = isMuted;
  });
}

function deleteReminder(index) {
  chrome.storage.local.get("reminders", (res) => {
    const reminders = res.reminders || [];
    reminders.splice(index, 1);
    chrome.storage.local.set({ reminders }, () => {
      chrome.alarms.clearAll(() => {
        reminders.forEach((r, i) =>
          chrome.alarms.create(`reminder-${i}`, { periodInMinutes: r.interval })
        );
      });
      loadReminders();
    });
  });
}

addForm.onsubmit = (e) => {
  e.preventDefault();
  const newReminder = {
    message: messageInput.value.trim(),
    interval: parseInt(intervalInput.value),
    sound: soundInput.value || null,
    muted: muteInput.checked,
  };
  chrome.storage.local.get("reminders", (res) => {
    const reminders = res.reminders || [];
    reminders.push(newReminder);
    chrome.storage.local.set({ reminders }, () => {
      const index = reminders.length - 1;
      chrome.alarms.create(`reminder-${index}`, {
        periodInMinutes: newReminder.interval,
      });
      loadReminders();
    });
  });
  addForm.reset();
};

loadReminders();

// popup.js or background.js
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("playBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "PLAY_SOUND", file: "alert.mp3" });
  });
});
