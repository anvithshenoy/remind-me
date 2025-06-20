chrome.runtime.onStartup.addListener(showAllReminders);
chrome.runtime.onInstalled.addListener(showAllReminders);

function showAllReminders() {
  chrome.storage.local.get(["reminders", "globalMuted"], (res) => {
    const reminders = res.reminders || [];
    const isMuted = res.globalMuted || false;

    reminders.forEach((reminder, index) => {
      chrome.alarms.create(`reminder-${index}`, {
        periodInMinutes: reminder.interval,
      });

      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "icon.png",
          title: "Reminder",
          message: reminder.message,
        },
        (id) => {
          setTimeout(() => chrome.notifications.clear(id), 5000);
        }
      );

      if (reminder.sound && !reminder.muted && !isMuted) {
        playSound(reminder.sound);
      }
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  const match = alarm.name.match(/^reminder-(\d+)$/);
  if (match) {
    const index = parseInt(match[1]);
    chrome.storage.local.get(["reminders", "globalMuted"], (res) => {
      const reminders = res.reminders || [];
      const reminder = reminders[index];
      const isMuted = res.globalMuted || false;

      if (reminder) {
        chrome.notifications.create(
          {
            type: "basic",
            iconUrl: "icon.png",
            title: "Reminder",
            message: reminder.message,
          },
          (id) => {
            setTimeout(() => chrome.notifications.clear(id), 5000);
          }
        );

        if (reminder.sound && !reminder.muted && !isMuted) {
          playSound(reminder.sound);
        }
      }
    });
  }
});

async function playSound(soundPath) {
  await ensureOffscreen();
  chrome.runtime.sendMessage({
    type: "PLAY_SOUND",
    file: soundPath.replace("sounds/", ""),
  });
}

async function ensureOffscreen() {
  const has = await chrome.offscreen.hasDocument();
  if (!has) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play sound for reminder notifications",
    });
  }
}
