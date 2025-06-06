const MESSAGE = "⏰ Time to take a break or check your reminder!";
const INTERVAL_MINUTES = 1; // change as needed

// Show the notification
function showReminder() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Reminder",
    message: MESSAGE,
    priority: 2,
  });
}

// On startup or browser open
chrome.runtime.onStartup.addListener(() => {
  showReminder();
});

// When extension is installed (for first-time setup)
chrome.runtime.onInstalled.addListener(() => {
  showReminder();
  chrome.alarms.create("intervalReminder", {
    periodInMinutes: INTERVAL_MINUTES,
  });
});

// At interval
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "intervalReminder") {
    showReminder();
  }
});
