/**
 * Chrome does not manage "openerTabId" rigidly,
 * so we need to manage tab tree by ourselves.
 */
export class TabTree {
  constructor(tabs: chrome.tabs.Tab[], windowNumberMap: WindowNumberMap) {
    this.tree = new Map()
    tabs
      .map((tab) => convertTabToTabTreeNode(tab, windowNumberMap))
      .forEach((tabTreeNode) => {
        this.tree.set(tabTreeNode.id, tabTreeNode)
      })
  }
  tree: Map<chrome.tabs.Tab['id'], TabTreeNode>
  addTabToTree(
    tab: chrome.tabs.Tab,
    parentId: chrome.tabs.Tab['id'] | null,
    windowNumberMap: WindowNumberMap,
  ) {
    const newTabTreeNode: TabTreeNode = convertTabToTabTreeNode(
      tab,
      windowNumberMap,
    )
    newTabTreeNode.parentId = parentId
    this.tree.set(tab.id, newTabTreeNode)
    if (parentId) {
      const parentOfNewTab = this.tree.get(parentId)
      if (parentOfNewTab) {
        parentOfNewTab.childrenIds.push(tab.id)
      } else {
        console.error('parent of new tab does not exist')
      }
    }
  }
  /**
   * It removes the tab from the tree,
   * and reassigns children of the removed tab to its parent.
   */
  removeTabFromTree(removedTabId: chrome.tabs.Tab['id']) {
    const parentId = this.tree.get(removedTabId).parentId
    const childrenIds = this.tree.get(removedTabId).childrenIds
    if (parentId) {
      const parentNode = this.tree.get(parentId)
      if (parentNode) {
        parentNode.childrenIds.splice(
          parentNode.childrenIds.indexOf(removedTabId),
          1,
        )
        parentNode.childrenIds.push(...childrenIds)
      } else {
        console.error('parent of removed tab does not exist')
      }
    }
    childrenIds.forEach((childId) => {
      const childNode = this.tree.get(childId)
      if (childNode) {
        childNode.parentId = parentId
      } else {
        console.error('child of removed tab does not exist:', childId)
      }
    })
    this.tree.delete(removedTabId)
  }
  changeWindowOfTabInTree(
    tabId: chrome.tabs.Tab['id'],
    newWindowId: chrome.tabs.Tab['windowId'],
    windowNumberMap: WindowNumberMap,
  ) {
    this.tree.get(tabId).windowNumber = calcWindowNumber(
      newWindowId,
      windowNumberMap,
    )
  }
  updateTabRefs(tabs: chrome.tabs.Tab[]) {
    Array.from(this.tree.keys()).forEach((tabId) => {
      const tab = tabs.find((tab) => tab.id === tabId)
      if (tab) {
        this.tree.get(tabId).tabRef = tab
      } else {
        console.error('tab does not exist:', tabId)
      }
    })
  }
}

/**
 * This type is used to send tab tree to side panel,
 * because it's not possible to send Map
 * by using chrome.runtime.sendMessage.
 */
export type TabTreeMessage = {
  name: 'tabTree'
  data: [TabTreeNode['id'], TabTreeNode][]
}

/**
 * Any other info than parent-children relationship
 * can be obtained from chrome.tabs.Tab.
 */
export type TabTreeNode = {
  id: chrome.tabs.Tab['id']
  childrenIds: chrome.tabs.Tab['id'][]
  parentId: chrome.tabs.Tab['id'] | null
  windowNumber: number // it's not tab's windowId. It's a number managed by this extension to distinguish windows.
  tabRef: chrome.tabs.Tab // to get title, favicon, etc.
}

export type WindowNumberMap = Map<chrome.tabs.Tab['windowId'], number>

export function convertTabToTabTreeNode(
  tab: chrome.tabs.Tab,
  windowNumberMap: WindowNumberMap,
): TabTreeNode {
  return {
    id: tab.id,
    childrenIds: [],
    parentId: null,
    windowNumber: calcWindowNumber(tab.windowId, windowNumberMap),
    tabRef: tab,
  }
}

export function calcWindowNumber(
  windowId: chrome.tabs.Tab['windowId'],
  windowNumberMap: WindowNumberMap,
): number {
  if (windowNumberMap.get(windowId)) {
    return windowNumberMap.get(windowId)
  } else {
    console.error('windowNumberMap does not have windowId')
    return 0
  }
}
