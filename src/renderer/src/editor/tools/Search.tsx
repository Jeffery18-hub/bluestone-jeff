import {observer} from 'mobx-react-lite'
import {useEditorStore} from '../store'
import {useEffect, useMemo, useRef} from 'react'
import IClose from '../../assets/ReactIcon/IClose'
import {Tooltip} from 'antd'
export const Search = observer(() => {
  const store = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    setTimeout(() =>
      inputRef.current?.focus()
    )
  }, [store.openSearch, store.focusSearch])
  return (
    <div
      className={`absolute w-full duration-200 left-0 top-10 items-center z-30 def-bg overflow-hidden border-b b1 ${store.openSearch ? '' : 'hidden'}`}
    >
      <div className={'max-w-[700px] mx-auto '}>
        <div
          className={'flex items-center py-2 h-[45px] justify-between px-14'}
        >
          <div className={'flex-1'}>
            <input
              value={store.search.text}
              placeholder={'查找'}
              autoFocus={true}
              ref={inputRef}
              onFocus={() => {
                store.matchSearch(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  store.nextSearch()
                }
              }}
              className={'w-full input'}
              onChange={e => store.setSearchText(e.target.value)}
            />
          </div>
          <div className={'ml-4 flex justify-end text-gray-400 items-center select-none'}>
            <div className={'space-x-3 text-[13px] leading-5 flex items-center mr-2'}>
              <div
                className={'bg-zinc-700/30 px-2 py-0.5 rounded cursor-pointer border dark:border-zinc-700 border-gray-500/50 hover:text-gray-300 duration-100'}
                onClick={() => store.prevSearch()}
              >
                上一个
              </div>
              <div
                className={'bg-zinc-700/30 px-2 py-0.5 rounded cursor-pointer border border-zinc-700 hover:text-gray-300 duration-100'}
                onClick={() => store.nextSearch()}
              >
                下一个
              </div>
            </div>
            <div className={'w-12 text-right'}>
              {!!store.matchCount &&
                <div className={'space-x-0.5 text-sm'}>
                  <span>{store.search.currentIndex + 1}</span>
                  <span>/</span>
                  <span>{store.matchCount}</span>
                </div>
              }
              {!store.matchCount && !!store.search.text &&
                <div className={'text-gray-500 text-sm'}>
                  无结果
                </div>
              }
            </div>
          </div>
          <div className={'ml-5'}>
            <Tooltip placement="bottom" title={'Esc'} mouseEnterDelay={.5}>
              <div
                className={'p-1'}
                onClick={() => {
                  store.setOpenSearch(false)
                }}
              >
                <IClose className={'w-5 h-5 text-gray-400 hover:text-gray-300'}/>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
})
