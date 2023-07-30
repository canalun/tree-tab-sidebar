function SidePanel() {
  const updateTabs = (tabs: chrome.tabs.Tab[]) => {
    const container = document.getElementById('container')
    container.innerHTML = ''

    const mapForTabRows = new Map()
    for (const tab of tabs) {
      const tabRow = document.createElement('div')
      tabRow.innerHTML = tab.title
      Object.assign(tabRow.style, {
        border: '1px solid black',
      })
      mapForTabRows.set(tab.id, tabRow)
    }

    for (const tab of tabs) {
      const tabRow = mapForTabRows.get(tab.id)
      if (tab.openerTabId) {
        const openerTabRow = mapForTabRows.get(tab.openerTabId)
        if (openerTabRow && tabRow) {
          openerTabRow.appendChild(tabRow)
        }
      } else {
        container.appendChild(tabRow)
      }
    }
  }

  chrome.runtime.onMessage.addListener(({ name, data }) => {
    if (name === 'updateTab') {
      console.log('ok')
      updateTabs(data.currentTabs)
    }
  })

  return <div id="container"></div>
}

export default SidePanel
