export {}

// TODO: Add a listener for when the user clicks on the action toolbar icon

console.log('background starts')

chrome.runtime.onInstalled.addListener(function (object) {
  let internalUrl = chrome.runtime.getURL('/options.html')
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: internalUrl })
  }
})

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
  // sendCurrentTabs()
  console.log('tab created')
})
chrome.tabs.onActivated.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab activated')
})
chrome.tabs.onUpdated.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab updated')
})
chrome.tabs.onMoved.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab moved')
})
chrome.tabs.onRemoved.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab removed')
})
chrome.tabs.onReplaced.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab replaced')
})
chrome.tabs.onAttached.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab attached')
})
chrome.tabs.onDetached.addListener(async function () {
  // sendCurrentTabs()
  console.log('tab detached')
})
