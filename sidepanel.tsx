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
import defaultFavicon from 'data-base64:./assets/default_favicon.png'
import {
  useEffect,
  useLayoutEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import type { TabTree, TabTreeMessage, TabTreeNode } from '~tabtree'

export default SidePanel

function SidePanel() {
  const [tabTree, setTabTree] = useState<TabTree['tree']>(new Map())

  // open state for each list item(=tab) is managed in this component
  // these states are determined by user's action and tab active state,
  // so they have to be calculated apart from tabTree
  //
  // spec:
  //  - initially, all list items are closed
  //  - if a list item is active, it and its ancestors/children are open
  //  - when a list item is clicked, it switches open/close
  const [openMap, setOpen] = useState<Map<chrome.tabs.Tab['id'], boolean>>(
    new Map(),
  )

  // receive tabTree from background
  useEffect(() => {
    chrome.runtime.onMessage.addListener(receiveTabTreeAndCalcOpenMap)
    return () =>
      chrome.runtime.onMessage.removeListener(receiveTabTreeAndCalcOpenMap)

    function receiveTabTreeAndCalcOpenMap({ name, data }: TabTreeMessage) {
      if (name === 'tabTree') {
        const tabTree: TabTree['tree'] = new Map()
        for (const [id, tabTreeNode] of data) {
          tabTree.set(id, tabTreeNode)
        }
        setTabTree(tabTree)
      }
    }
  }, [])

  // update openMap when tabTree is updated
  useLayoutEffect(() => {
    const _openMap: Map<chrome.tabs.Tab['id'], boolean> = new Map()
    for (const [id, _] of tabTree) {
      _openMap.set(id, openMap.get(id) ?? false)
    }
    const activeTabId =
      Array.from(tabTree.entries()).find(([, tabTreeNode]) => {
        return Boolean(tabTreeNode.tabRef.active)
      })?.[0] ?? -1
    console.log('activeTabId', activeTabId)
    if (activeTabId > -1) {
      openAncestorsRecursively(activeTabId)
      openChildrenRecursively(activeTabId)
    }
    setOpen(_openMap)

    function openAncestorsRecursively(id: number) {
      const tabTreeNode = tabTree.get(id)
      if (tabTreeNode?.parentId) {
        _openMap.set(tabTreeNode.parentId, true)
        openAncestorsRecursively(tabTreeNode.parentId)
      }
    }
    function openChildrenRecursively(id: number) {
      const tabTreeNode = tabTree.get(id)
      tabTreeNode?.childrenIds.forEach((id) => {
        _openMap.set(id, true)
        openChildrenRecursively(id)
      })
    }
  }, [tabTree])

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="div">
      {Array.from(tabTree.entries()).map(([id, tabTreeNode]) => {
        return tabTreeNode.parentId ? null : (
          <ListItemForTabIncludingChildren
            key={id}
            tabTreeNode={tabTreeNode}
            tabTree={tabTree}
            openStates={openMap}
            changeOpenState={setOpen}
            layer={0}
          />
        )
      })}
      <ListItem style={{ color: 'GrayText', fontSize: '12px' }}>
        If you cannot see any tabs, please update any tab.
      </ListItem>
    </List>
  )
}

const ListItemForTabIncludingChildren: FC<{
  tabTreeNode: TabTreeNode
  tabTree: TabTree['tree']
  layer: number
  openStates: Map<chrome.tabs.Tab['id'], boolean>
  changeOpenState: React.Dispatch<
    React.SetStateAction<Map<chrome.tabs.Tab['id'], boolean>>
  >
  children?: ReactNode
}> = ({ tabTreeNode, tabTree, layer, openStates, changeOpenState }) => {
  const { active, favIconUrl, title } = tabTreeNode.tabRef
  const open = openStates.get(tabTreeNode.id) ?? false
  const toggleOpen = () =>
    changeOpenState((prevOpenStates) => {
      const newOpenStates = new Map(prevOpenStates)
      newOpenStates.set(tabTreeNode.id, !prevOpenStates.get(tabTreeNode.id))
      return newOpenStates
    })
  return (
    <>
      <ListItemButton
        sx={{
          pl: layer * 2,
          backgroundColor: active ? 'lightgray' : '',
          height: '30px',
        }}
        onClick={() => chrome.tabs.update(tabTreeNode.id, { selected: true })}
        dense
        disableGutters
      >
        <ListItemIcon style={{ minWidth: '12px' }}>
          {tabTreeNode.childrenIds.length === 0 ? (
            <ExpandLess style={{ opacity: 0 }} />
          ) : open ? (
            <ExpandLess
              onClick={(e) => {
                e.stopPropagation()
                toggleOpen()
              }}
            />
          ) : (
            <ExpandMore
              onClick={(e) => {
                e.stopPropagation()
                toggleOpen()
              }}
            />
          )}
        </ListItemIcon>

        <ListItemIcon style={{ minWidth: '24px' }}>
          <img
            src={
              favIconUrl && !favIconUrl.startsWith('chrome-extension://')
                ? favIconUrl
                : defaultFavicon
            }
            height={'14px'}
            width={'14px'}
          />
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            fontSize: '12px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        />
        <ListItemIcon
          style={{ marginRight: '-36px' }}
          onClick={(e) => {
            e.stopPropagation()
            chrome.tabs.remove(tabTreeNode.id)
          }}
        >
          <CloseIcon style={{ height: '20px', width: '20px' }} />
        </ListItemIcon>
      </ListItemButton>
      {tabTreeNode.childrenIds.map((id) => {
        const tabTreeNode = tabTree.get(id)
        return (
          <Collapse in={open} timeout="auto">
            <ListItemForTabIncludingChildren
              key={id}
              tabTreeNode={tabTreeNode}
              tabTree={tabTree}
              openStates={openStates}
              changeOpenState={changeOpenState}
              layer={layer + 1}
            />
          </Collapse>
        )
      })}
    </>
  )
}
