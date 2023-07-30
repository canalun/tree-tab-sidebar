import { ExpandLess, ExpandMore } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { useMemo, useState, type FC, type ReactNode } from 'react'

// TODO: move calculation logic to background script
// TODO: display current tab as opened and highlighted

type TabTreeNode = {
  id: chrome.tabs.Tab['id']
  childrenId: chrome.tabs.Tab['id'][]
  tabRef: chrome.tabs.Tab
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

  const tabTrees = useMemo(() => constructTabTrees(tabs), [tabs])

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="div">
      {Array.from(tabTrees.entries()).map(([id, tabNode]) => {
        return tabNode.parentId ? null : (
          <ListItemForTabIncludingChildren
          tabNode={tabNode}
          layer={0}
          tabTrees={tabTrees}
          key={id}
          />
          )
        })}
        <ListItem style={{color: 'GrayText', fontSize: '12px'}}>If you cannot see any tabs, please update any tab.</ListItem>
    </List>
  )
}

function constructTabTrees(
  tabs: chrome.tabs.Tab[],
): Map<chrome.tabs.Tab['id'], TabTreeNode> {
  const tabMap = new Map<chrome.tabs.Tab['id'], chrome.tabs.Tab>()
  for (const tab of tabs) {
    tabMap.set(tab.id, tab)
  }

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
        const parentNode = convertTabIntoTabTreeNode(tabMap.get(node.parentId))
        parentNode.childrenId.push(node.id)
        registerTabTree(parentNode)
      }
    }
  }

  function convertTabIntoTabTreeNode(tab: chrome.tabs.Tab): TabTreeNode {
    return {
      id: tab.id,
      parentId: tab.openerTabId,
      childrenId: [],
      tabRef: tab,
    }
  }
}

const ListItemForTabIncludingChildren: FC<{
  tabNode: TabTreeNode
  layer: number
  tabTrees: Map<chrome.tabs.Tab['id'], TabTreeNode>
  children?: ReactNode
}> = ({ tabNode, layer, tabTrees }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <ListItemButton
        sx={{ pl: layer * 2 }}
        onClick={() => chrome.tabs.update(tabNode.id, { selected: true })}
        dense
        disableGutters
      >
        <ListItemIcon style={{ minWidth: '12px' }}>
          {tabNode.childrenId.length === 0 ? (
            <ExpandLess style={{ opacity: 0 }} />
          ) : open ? (
            <ExpandLess
              onClick={(e) => {
                e.stopPropagation()
                setOpen((prev) => !prev)
              }}
            />
          ) : (
            <ExpandMore
              onClick={(e) => {
                e.stopPropagation()
                setOpen((prev) => !prev)
              }}
            />
          )}
        </ListItemIcon>

        <ListItemIcon style={{ minWidth: '24px' }}>
          <img
            src={tabNode.tabRef.favIconUrl}
            height={'16px'}
            width={'16px'}
          />
        </ListItemIcon>
        <ListItemText
          primary={tabNode.tabRef.title}
          primaryTypographyProps={{
            fontSize: '12px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        />
        <ListItemIcon
          style={{ marginRight: '-30px' }}
          onClick={(e) => {
            e.stopPropagation()
            chrome.tabs.remove(tabNode.id)
          }}
        >
          <CloseIcon />
        </ListItemIcon>
      </ListItemButton>
      {tabNode.childrenId.map((id) => {
        const tabNode = tabTrees.get(id)
        return (
          <Collapse in={open} timeout="auto">
            <ListItemForTabIncludingChildren
              tabNode={tabNode}
              layer={layer + 1}
              tabTrees={tabTrees}
            />
          </Collapse>
        )
      })}
    </>
  )
}

// TODO: favicon in below way not working esp. for non-favicon sites
// function faviconURL(u: string) {
//   const url = new URL(chrome.runtime.getURL('/_favicon/'))
//   url.searchParams.set('pageUrl', u)
//   return url.toString()
// }

export default SidePanel
