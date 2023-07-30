import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
  const currentTabs: chrome.tabs.Tab[] = []
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      console.log(tab.title)
      currentTabs.push(tab)
    })

    res.send({
      currentTabs,
    })
  })
}

export default handler
