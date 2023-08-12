import { ExpandLess, ExpandMore } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useState, type FC, type ReactNode, useMemo } from 'react'
import defaultFavicon from 'data-base64:./assets/default_favicon.png'
import type { TabTree, TabTreeMessage, TabTreeNode } from '~tabtree'

function SidePanel() {
  const [tabTree, setTabTree] = useState<TabTree['tree']>(new Map())
  chrome.runtime.onMessage.addListener(({ name, data }: TabTreeMessage) => {
    if (name === 'tabTree') {
      const tabTree: TabTree['tree'] = new Map()
      for (const [id, tabTreeNode] of data) {
        tabTree.set(id, tabTreeNode)
      }
      console.log('sidepanel', tabTree)
      setTabTree(tabTree)
    }
  })

  /**
   * calculate which tabs should be displayed as open
   */
  const activeTabId = Array.from(tabTree.entries()).find(([, tabTreeNode]) => {
    return tabTreeNode.tabRef.active
  })?.[0] ?? -1
  const openTabs = new Map<TabTreeNode['id'], boolean>()
  const addOpenTab = (id: TabTreeNode['id']) => {
    const tabTreeNode = tabTree.get(id)
    if (tabTreeNode) {
      if (tabTreeNode.parentId) {
        openTabs.set(tabTreeNode.parentId, true)
        addOpenTab(tabTreeNode.parentId)
      }
    }
  }
  addOpenTab(activeTabId)

  const ListItemForTabIncludingChildren: FC<{
    tabNode: TabTreeNode
    layer: number
    children?: ReactNode
  }> = ({ tabNode, layer }) => {
    console.log('rendered')
    const [open, setOpen] = useState(!!openTabs.get(tabNode.id))
    return (
      <>
        <ListItemButton
          sx={{
            pl: layer * 2,
            backgroundColor: tabNode.tabRef.active ? 'lightgray' : '',
          }}
          onClick={() => chrome.tabs.update(tabNode.id, { selected: true })}
          dense
          disableGutters
        >
          <ListItemIcon style={{ minWidth: '12px' }}>
            {tabNode.childrenIds.length === 0 ? (
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
              src={
                tabNode.tabRef.favIconUrl &&
                !tabNode.tabRef.favIconUrl.startsWith('chrome-extension://')
                  ? tabNode.tabRef.favIconUrl
                  : defaultFavicon
              }
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
        {tabNode.childrenIds.map((id) => {
          const tabNode = tabTree.get(id)
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
      {Array.from(tabTree.entries()).map(([id, tabTreeNode]) => {
        return tabTreeNode.parentId ? null : (
          <ListItemForTabIncludingChildren
            tabNode={tabTreeNode}
            layer={0}
            key={id}
          />
        )
      })}
      <ListItem style={{ color: 'GrayText', fontSize: '12px' }}>
        If you cannot see any tabs, please update any tab.
      </ListItem>
    </List>
  )
}

export default SidePanel
