import {observer} from 'mobx-react-lite'
import {Dialog} from '../Dialog'
import {useLocalState} from '../../hooks/useLocalState'
import {useCallback, useEffect} from 'react'
import {tagStore} from '../../store/tag'
import {Button, Tag} from 'antd'
import {TagOutlined} from '@ant-design/icons'
import {configStore} from '../../store/config'
import {db, ITag} from '../../store/db'
import {treeStore} from '../../store/tree'
import {nanoid} from 'nanoid'

export const AddTagToFile = observer(() => {
  const [state, setState] = useLocalState({
    open: false,
    selectedTags: [] as string[],
    tags: [] as ITag[],
    curFilePath: ''
  })
  useEffect(() => {
    const open = async (e: any, filePath: string) => {
      if (!filePath) return
      const tags = await db.tag.toArray()
      const selectTags = await db.tagFile.where('filePath').equals(filePath || '').toArray()
      setState({tags: tagStore.sortTags(tags), selectedTags: selectTags.map(t => t.tagId!), open: true, curFilePath: filePath})
    }
    db.tag.toArray().then(res => setState({tags: res}))
    window.electron.ipcRenderer.on('addFileTag', open)
    return () => {
      window.electron.ipcRenderer.removeListener('addFileTag', open)
    }
  }, [])

  const addTag = useCallback(async () => {
    if (state.curFilePath) {
      await db.tagFile.where('filePath').equals(state.curFilePath).delete()
      if (state.selectedTags.length) {
        await db.tagFile.bulkAdd(state.selectedTags.map(t => {
          return {
            id: nanoid(),
            tagId: t,
            filePath: state.curFilePath
          }
        }))
        if (treeStore.treeTab === 'bookmark') {
          tagStore.init()
        }
      }
    }
    setState({open: false})
  }, [])

  return (
    <Dialog
      open={state.open}
      title={configStore.zh ? '选择标签' : 'Select tag'}
      onClose={() => setState({open: false})}
    >
      <div className={'w-[360px] p-4 flex flex-col space-y-4'}>
        {!!state.tags.length &&
          <div className={'flex flex-wrap justify-center mt-2'}>
            {state.tags.map(t =>
              <Tag
                icon={<TagOutlined/>}
                onClick={() => {
                  if (state.selectedTags.includes(t.id!)) {
                    setState({selectedTags: state.selectedTags.filter(id => id !== t.id)})
                  } else {
                    setState({selectedTags: [...state.selectedTags, t.id!]})
                  }
                }}
                color={state.selectedTags.includes(t.id!) ? '#06b6d4' : 'default'} key={t.id}
                className={'leading-7 cursor-pointer mb-3 px-4 text-sm mr-3'}
              >
                {t.title}
              </Tag>
            )}
          </div>
        }
        {!state.tags.length &&
          <div className={'text-center dark:text-gray-400 text-gray-500 text-sm'}>{configStore.zh ? '没有标签，请先添加标签' : 'No tags, please add tags first'}</div>
        }
        <div className={'flex px-5'}>
          <Button
            block={true}
            onClick={addTag}
            disabled={!state.tags?.length}
          >
            {configStore.zh ? '添加标签至文件' : 'Add tags to file'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
})
