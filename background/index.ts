export {}

console.log('background starts')

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

function sendCurrentTabs() {
  const currentTabs: chrome.tabs.Tab[] = []
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      currentTabs.push(tab)
    })
    chrome.runtime.sendMessage({
      name: 'updateTab',
      data: { currentTabs: currentTabs },
    })
  })
  return
}

chrome.tabs.onCreated.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onUpdated.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onMoved.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onRemoved.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onReplaced.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onAttached.addListener(async function () {
  sendCurrentTabs()
})
chrome.tabs.onDetached.addListener(async function () {
  sendCurrentTabs()
})
