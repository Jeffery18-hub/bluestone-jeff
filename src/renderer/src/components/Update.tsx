import {observer} from 'mobx-react-lite'
import {Button, Modal, notification, Progress, Space} from 'antd'
import {useLocalState} from '../hooks/useLocalState'
import {useCallback, useEffect, useRef} from 'react'
import {message$} from '../utils'
import {configStore} from '../store/config'
import {openConfirmDialog$} from './ConfirmDialog'
import {action, runInAction} from 'mobx'
const ipcRenderer = window.electron.ipcRenderer
export const Update = observer(() => {
  const [state, setState] = useLocalState({
    startUpdate: false,
    percent: 0,
    manual: false,
    mas: configStore.mas,
    loading: false,
    enableUpgrade: false,
    updateData: {
      tag: '',
      englishInfo: [] as string[],
      zhInfo: [] as string[]
    }
  })
  const checkTimer = useRef(0)
  const downLoad = useCallback(() => {
    window.open(`https://github.com/1943time/bluestone/releases/latest`)
  }, [])

  const check = useCallback(async () => {
    const v = await window.electron.ipcRenderer.invoke('get-version')
    // https://www.bluemd.me/api/version
    try {
      const res = await window.api.got.get('https://www.bluemd.me/api/version', {
        searchParams: {
          version: v,
          mas: configStore.mas ? 'true' : undefined
        }
      }).json<{
        masVersion: string
        github: Record<string, any>
      }>()
      if (res.github) {
        const info:string[] = res.github.body.split('***')
        setState({
          updateData: {
            tag: configStore.mas ? 'v' + res.masVersion : res.github.tag_name,
            englishInfo: info[0]?.split(/\n|\r\n/).filter(item => !!item) || [],
            zhInfo: info[1]?.split(/\n|\r\n/).filter(item => !!item) || []
          }
        })
        runInAction(() => configStore.enableUpgrade = true)
      } else {
        checkTimer.current = window.setTimeout(check, 60 * 1000 * 60)
      }
      return !!res.github
    } catch (e) {
      checkTimer.current = window.setTimeout(check, 60 * 1000 * 60)
      return null
    }
  }, [])

  const [api, contextHolder] = notification.useNotification()
  useEffect(() => {
    check()
    ipcRenderer.on('check-updated', e => {
      setState({manual: true})
      clearTimeout(checkTimer.current)
      check().then((updated) => {
        if (updated) {
          runInAction(() => configStore.openUpdateDialog = true)
        } else {
          message$.next({
            type: 'info',
            content: configStore.zh ? '没有可用的更新' : 'No updates are available'
          })
        }
      })
    })
    ipcRenderer.on('update-progress', (e, data) => {
      const percent = (data.percent as number || 0).toFixed(1)
      setState({percent: +percent})
    })

    ipcRenderer.on('update-error', (e, err) => {
      console.error('update-error', err)
      if (state.startUpdate || state.manual) {
        let msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'The network is abnormal, please try again later or download manually'
        api.error({
          message: configStore.zh ? '更新失败' : 'The update failed',
          description: msg
        })
      }
      setState({startUpdate: false, percent: 0, manual: false})
    })
    ipcRenderer.on('update-downloaded', e => {
      setState({startUpdate: false, percent: 0})
      openConfirmDialog$.next({
        title: configStore.zh ? '下载更新已完成，是否立即重新启动？' : 'Download the update is complete, do you want to restart it now?',
        okText: 'Restart now',
        onConfirm: () => {
          ipcRenderer.send('install-update')
        },
        onCancel: () => {
          setState({
            startUpdate: false,
            percent: 0
          })
        }
      })
    })
  }, [])
  return (
    <>
      {contextHolder}
      {state.startUpdate &&
        <div
          className={`w-28 mr-2 hover:bg-black/10 rounded px-2 cursor-pointer`}
          onClick={action(() => configStore.openUpdateDialog = true)}
        >
          <Progress percent={state.percent} className={'m-0'}/>
        </div>
      }
      <Modal
        title={`Update Bluestone-${state.updateData.tag}`}
        width={600}
        onCancel={action(() => configStore.openUpdateDialog = false)}
        open={configStore.openUpdateDialog}
        footer={null}
      >
        <div
          className={'py-2 break-words'}
        >
          {configStore.zh ? (
            state.updateData.zhInfo.map((item, i) =>
              <p key={i} className={'mb-2'}>{item}</p>
            )
          ) : (
            state.updateData.englishInfo.map((item, i) =>
              <p key={i} className={'mb-2'}>{item}</p>
            )
          )}
        </div>
        {state.startUpdate &&
          <div className={'flex items-center mt-4'}>
            <span className={'mr-4'}>{'Updating'}</span>
            <Progress percent={state.percent} className={'flex-1 mb-0'}/>
          </div>
        }
        <div className={'mt-4 flex justify-center space-x-4 px-20'}>
          {state.startUpdate ? (
            <>
              <Button onClick={downLoad}>{'Download manually'}</Button>
              <Button
                onClick={() => {
                  ipcRenderer.send('cancel-update')
                  setState({startUpdate: false, percent: 0})
                }}
              >
                {configStore.zh ? '取消更新' : 'Cancel update'}
              </Button>
            </>
          ) : (
            <>
              {!state.mas &&
                <Button onClick={downLoad}>{configStore.zh ? '手动下载' : 'Download manually'}</Button>
              }
              <Button
                type={'primary'}
                block={state.mas}
                loading={state.loading}
                onClick={async () => {
                  if (state.mas) {
                    // window.open('https://apps.apple.com/us/app/bluestone-markdown/id6451391474')
                    window.open('itms-apps://apps.apple.com/us/app/bluestone-markdown/id6451391474')
                  } else {
                    setState({loading: true})
                    ipcRenderer.invoke('check-updated').then(async () => {
                      ipcRenderer.invoke('start-update')
                      setState({startUpdate: true})
                      runInAction(() => configStore.openUpdateDialog = false)
                    }).catch(e => {
                      let msg = typeof e === 'string' ? e : e instanceof Error ? e.message : 'The network is abnormal, please try again later or download manually'
                      api.error({
                        message: configStore.zh ? '更新失败' : 'The update failed',
                        description: msg
                      })
                      console.error('update fail', e)
                    }).finally(() => {
                      setState({loading: false})
                    })
                  }
                }}
              >
                {configStore.zh ? '立即更新' : 'Update now'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  )
})
