import { sendToBackground } from '@plasmohq/messaging'

function SidePanel() {
  // console.log('i am sidepanel')

  const updateTabs = (tabs: chrome.tabs.Tab[]) => {
    const container = document.getElementById('container')
    for (const tab of tabs) {
      const tabRow = document.createElement('div')
      console.log(tab.title)
      tabRow.innerHTML = tab.title
      Object.assign(tabRow.style, {
        border: '1px solid black',
      })
      container.appendChild(tabRow)
    }
  }

  // chrome.runtime.onMessage.addListener(({ name, data }) => {
  //   if (name === 'updateTabs') {
  //     updateTabs(data.currentTabs)
  //   }
  // })

  const onUpdate = async () => {
    // nameがneverだって言われるので無視
    // @ts-ignore
    const res = await sendToBackground<any, { currentTabs: chrome.tabs.Tab[] }>(
      {
        name: 'updateTabs',
      },
    )
    updateTabs(res.currentTabs)
  }

  return (
    <>
      <div id="container"></div>
      <button onClick={onUpdate}></button>
    </>
  )
}

export default SidePanel
