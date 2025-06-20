chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PLAY_SOUND" && msg.file) {
    const audio = new Audio(chrome.runtime.getURL(`sounds/${msg.file}`));
    audio.play().catch(console.warn);
  }
});
