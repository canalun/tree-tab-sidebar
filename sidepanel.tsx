import { ExpandLess, ExpandMore } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useState, type FC, type ReactNode } from 'react'

type TabTreeNode = {
  id: chrome.tabs.Tab['id']
  childrenId: chrome.tabs.Tab['id'][]
  parentId?: chrome.tabs.Tab['id']
}

function SidePanel() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])
  chrome.runtime.onMessage.addListener(
    ({
      name,
      data,
    }: {
      name: string
      data: { currentTabs: chrome.tabs.Tab[] }
    }) => {
      if (name === 'updateTab') {
        setTabs(data.currentTabs)
      }
    },
  )

  const tabMap = new Map<chrome.tabs.Tab['id'], chrome.tabs.Tab>()
  for (const tab of tabs) {
    tabMap.set(tab.id, tab)
  }

  const convertTabIntoTabTreeNode = (tab: chrome.tabs.Tab): TabTreeNode => {
    return {
      id: tab.id,
      parentId: tab.openerTabId,
      childrenId: [],
    }
  }

  const constructTabTrees: (
    tabs: chrome.tabs.Tab[],
  ) => Map<chrome.tabs.Tab['id'], TabTreeNode> = (tabs) => {
    const tabTrees = new Map<chrome.tabs.Tab['id'], TabTreeNode>()
    tabs.forEach((tab) => {
      if (tabTrees.has(tab.id)) {
        return
      }
      const tabNode = convertTabIntoTabTreeNode(tab)
      registerTabTree(tabNode)
    })
    return tabTrees

    function registerTabTree(node: TabTreeNode) {
      tabTrees.set(node.id, node)
      if (node.parentId) {
        const parentNode = tabTrees.get(node.parentId)
        if (parentNode) {
          parentNode.childrenId.push(node.id)
        } else {
          const parentNode = convertTabIntoTabTreeNode(
            tabMap.get(node.parentId),
          )
          parentNode.childrenId.push(node.id)
          registerTabTree(parentNode)
        }
      }
    }
  }

  const tabTrees = constructTabTrees(tabs)

  const ListItemForTabIncludingChildren: FC<{
    tabNode: TabTreeNode
    layer: number
    children?: ReactNode
  }> = ({ tabNode, layer }) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <ListItemButton
          sx={{ pl: layer * 2 }}
          onClick={() => chrome.tabs.update(tabNode.id, { selected: true })}
          dense
          disableGutters
        >
          <ListItemIcon style={{minWidth:'12px'}}>
            {tabNode.childrenId.length === 0 ? <ExpandLess style={{opacity:0}} /> : open ? (
              <ExpandLess onClick={(e) => {
                e.stopPropagation()
                setOpen((prev) => !prev)
              }}/>
            ) : (
              <ExpandMore onClick={(e) => {
                e.stopPropagation()
                setOpen((prev) => !prev)}}/>
            )}
          </ListItemIcon>
          <ListItemIcon style={{minWidth:'30px'}}>
            {tabMap.get(tabNode.id)?.favIconUrl && (
              <img
                src={tabMap.get(tabNode.id)?.favIconUrl}
                height={'18px'}
                width={'18px'}
              />
            )}
          </ListItemIcon>
          <ListItemText
            inset={!tabMap.get(tabNode.id)?.favIconUrl}
            primary={tabMap.get(tabNode.id)?.title}
            primaryTypographyProps={{ fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}

          />
          <ListItemIcon  style={{marginRight:'-30px'}} onClick={(e) => {
            e.stopPropagation()
            chrome.tabs.remove(tabNode.id)
            }} >
            <CloseIcon/>
          </ListItemIcon>
        </ListItemButton>
        {tabNode.childrenId.map((id) => {
          const tabNode = tabTrees.get(id)
          return (
            <Collapse in={open} timeout="auto">
              <ListItemForTabIncludingChildren
                tabNode={tabNode}
                layer={layer + 1}
              />
            </Collapse>
          )
        })}
      </>
    )
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="div">
      {Array.from(tabTrees.entries()).map(([id, tabNode]) => {
        return tabNode.parentId ? null : (
          <ListItemForTabIncludingChildren
            tabNode={tabNode}
            layer={0}
            key={id}
          />
        )
      })}
    </List>
  )
}

export default SidePanel
