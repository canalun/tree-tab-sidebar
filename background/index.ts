export {}

console.log('background starts')

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

chrome.tabs.onUpdated.addListener(async function () {
  const currentTabs: chrome.tabs.Tab[] = []
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      console.log(tab.title)
      currentTabs.push(tab)
    })

    chrome.runtime.sendMessage({
      name: 'updateTab',
      data: { currentTabs: currentTabs },
    })
  })
})
