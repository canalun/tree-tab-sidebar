import { TabTree, type TabTreeMessage } from '~tabtree'
export {} // plasmo template

// Display the instruction page after installation
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

// manage tab and window by using these two variables
let tabTree: TabTree | null = null
let windowNumberMap: Map<chrome.tabs.Tab['windowId'], number> = new Map()

// Initialize tab tree and window map when the extension is loaded
chrome.windows.getAll({}, function (windows) {
  let index = 0
  windows.forEach((window) => {
    if (!windowNumberMap.get(window.id)) {
      windowNumberMap.set(window.id, index)
      index++
    }
  })
  chrome.tabs.query({}, function (tabs) {
    tabTree = new TabTree(tabs, windowNumberMap)
    console.log('initialized tab tree,', tabTree)
  })
})

//////////////////
// event listeners
//////////////////

chrome.tabs.onCreated.addListener((tab) => {
  console.log('tab created:', tab)
  const parentId =
    tab.pendingUrl !== 'chrome://newtab/' && tab.openerTabId
      ? tab.openerTabId
      : null
  tabTree.addTabToTree(tab, parentId, windowNumberMap)
  sendTabTree()
})

chrome.tabs.onActivated.addListener(() => {
  console.log('tab activated')
  sendTabTree()
})

chrome.tabs.onUpdated.addListener((_) => {
  console.log('tab updated')
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
  chrome.tabs.query({}, function (tabs) {
    tabTree.updateTabRefs(tabs)
    chrome.runtime.sendMessage<TabTreeMessage>({
      name: 'tabTree',
      data: Array.from(tabTree.tree.entries()),
    })
    console.log('sent tab tree:', Array.from(tabTree.tree.entries()))
  })
}
