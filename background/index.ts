import { TabTree, type TabTreeMessage } from '~tabtree'
export {}

console.log('background starts')

// Display the instruction page after installation
chrome.runtime.onInstalled.addListener(function (object) {
  console.log('runtime onInstalled')
  let internalUrl = chrome.runtime.getURL('/options.html')
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: internalUrl })
  }
})

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// manage tab and window by using these two variables
let tabTree: TabTree | null = null
let windowNumberMap: Map<chrome.tabs.Tab['windowId'], number> = new Map()

// Initialize tab tree and window map when the extension is loaded
chrome.windows.getAll({}, function (windows) {
  console.log('initialize window map')
  let index = 0
  windows.forEach((window) => {
    if (!windowNumberMap.get(window.id)) {
      windowNumberMap.set(window.id, index)
      index++
    }
  })
  chrome.tabs.query({}, function (tabs) {
    console.log('initialize tab tree')
    tabTree = new TabTree(tabs, windowNumberMap)
    console.log(tabTree)
  })
})

//////////////////
// event listeners
//////////////////

chrome.tabs.onCreated.addListener((tab) => {
  console.log('tab created')
  tabTree.addTabToTree(tab, windowNumberMap)
  sendTabTree()
})

chrome.tabs.onActivated.addListener(() => {
  console.log('tab activated')
  sendTabTree()
})

chrome.tabs.onUpdated.addListener((_) => {
  console.log('tab activated')
  sendTabTree()
})

chrome.tabs.onRemoved.addListener((tabId, _) => {
  console.log('tab removed')
  tabTree.removeTabFromTree(tabId)
  sendTabTree()
})

/**
 * manage window information on attach event.
 * BTW, detach event is always followed by attach event,
 * so we don't need to do anything on detach event.
 */
chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  console.log('tab attached')
  tabTree.changeWindowOfTabInTree(
    tabId,
    attachInfo.newWindowId,
    windowNumberMap,
  )
  sendTabTree()
})

/**
 * we have to update tabRef before sending data to sidePanel,
 * because chrome does not mutate tabs but creates new tabs on every event.
 */
function sendTabTree() {
  console.log(tabTree)
  chrome.tabs.query({}, function (tabs) {
    console.log('update tab tree')
    tabTree.updateTabRefs(tabs)
    chrome.runtime.sendMessage<TabTreeMessage>({
      name: 'tabTree',
      data: Array.from(tabTree.tree.entries()),
    })
  })
}
