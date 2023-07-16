import {dialog, ipcMain, Menu, BrowserWindow, shell, app, nativeTheme, BrowserView} from 'electron'
import {mkdirp} from 'mkdirp'
import {is} from '@electron-toolkit/utils'
import {join} from 'path'
import {getLocale, store} from './store'
import {writeFileSync} from 'fs'
export const baseUrl = is.dev && process.env['ELECTRON_RENDERER_URL'] ? process.env['ELECTRON_RENDERER_URL'] : join(__dirname, '../renderer/index.html')
const workerPath = join(__dirname, '../renderer/worker.html')
export const isDark = (config?: any) => {
  if (!config) config = store.get('config') || {}
  let dark = false
  if (typeof config.theme === 'string') {
    if (config.theme === 'dark') {
      dark = true
    } else if (config.theme === 'system' && nativeTheme.shouldUseDarkColors) {
      dark = true
    }
  } else {
    dark = nativeTheme.shouldUseDarkColors
  }
  return dark
}
export const registerApi = () => {
  ipcMain.on('to-worker', (e, ...args:any[]) => {
    const window = BrowserWindow.fromWebContents(e.sender)!
    window?.getBrowserView()?.webContents.send('task', ...args)
  })

  ipcMain.handle('get-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('get-path', (e, type: Parameters<typeof app.getPath>[0]) => {
    return app.getPath(type)
  })
  ipcMain.handle('get-env', () => {
    return {
      isPackaged: app.isPackaged,
      webPath: app.isPackaged ? join(app.getAppPath(), '..', 'web') : join(__dirname, '../../web')
    }
  })
  ipcMain.handle('saveServerConfig', (e, config: any) => {
    store.set('server-config', config)
  })
  ipcMain.handle('removeServerConfig', (e) => {
    store.delete('server-config')
  })
  ipcMain.handle('getServerConfig', (e) => {
    return store.get('server-config')
  })
  ipcMain.handle('getConfig', () => {
    const config:any = store.get('config') || {}
    const theme = typeof config.theme === 'string' ? config.theme : nativeTheme.themeSource
    const dark = isDark(config)
    return {
      showLeading: !!config.showLeading,
      locale: getLocale(),
      theme: theme,
      dark: dark,
      codeLineNumber: !!config.codeLineNumber,
      codeTabSize: config.codeTabSize || 2,
      codeTheme: config.codeTheme || 'material-theme-palenight',
      editorTextSize: config.editorTextSize || 16,
      leadingLevel: config.leadingLevel || 4,
      showCharactersCount: config.showCharactersCount,
      titleColor: config.titleColor
    }
  })

  ipcMain.on('relaunch', () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle('get-system-dark', (e) => {
    return nativeTheme.shouldUseDarkColors
  })
  ipcMain.on('setStore', (e, key: string, value: any) => {
    if (typeof value === 'undefined') {
      store.delete(key)
    } else {
      store.set(key, value)
    }
  })
  ipcMain.on('toggleShowLeading', (e, show: boolean) => {
    const showLeading = Menu.getApplicationMenu()?.getMenuItemById('showLeading')
    if (showLeading) showLeading.click()
    return showLeading?.checked || false
  })
  ipcMain.handle('mkdirp', (e, path: string) => {
    return mkdirp(path)
  })
  ipcMain.handle('save-dialog', async (e, options: Parameters<typeof dialog['showSaveDialog']>[0]) => {
    return dialog.showSaveDialog(options)
  })
  ipcMain.on('send-to-self', (e, task: string, ...args) => {
    const window = BrowserWindow.fromWebContents(e.sender)!
    window?.webContents.send(task, ...args)
  })

  ipcMain.on('close-window', (e) => {
    BrowserWindow.fromWebContents(e.sender)?.close()
  })

  ipcMain.on('task-result', (e, ...args) => {
    BrowserWindow.fromWebContents(e.sender)?.webContents.send('task-result', ...args)
  })
  ipcMain.handle('getCachePath', async (e) => {
    return app.getPath('sessionData')
  })
  ipcMain.handle('showOpenDialog', async (e, options: Parameters<typeof dialog['showOpenDialog']>[0]) => {
    return dialog.showOpenDialog({
      ...options,
      securityScopedBookmarks: true
    })
  })
  ipcMain.on('openInFolder', (e, path: string) => {
    shell.showItemInFolder(path)
  })
  ipcMain.on('max-size', (e) => {
    BrowserWindow.fromWebContents(e.sender)?.maximize()
  })

  ipcMain.on('move-to-trash', (e, path) => {
    return shell.trashItem(path)
  })
  ipcMain.handle('get-base-url', e => {
    return baseUrl
  })
  ipcMain.handle('get-preload-url', e => {
    return join(__dirname, '../preload/index.js')
  })

  ipcMain.on('print-pdf', async (e, filePath: string, rootPath?: string) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) {
      const view = new BrowserView({
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false,
          nodeIntegration: true,
          contextIsolation: false,
          webviewTag: true
        }
      })
      win.setBrowserView(view)
      view.setBounds({ x: 0, y: 0, width: 0, height: 0})
      await view.webContents.loadFile(workerPath)
      const ready = async (e: any, filePath: string) => {
        try {
          const save = await dialog.showSaveDialog({
            filters: [{name: 'pdf', extensions: ['pdf']}]
          })
          if (save.filePath) {
            const buffer = await view.webContents.printToPDF({
              printBackground: true,
              displayHeaderFooter: true,
              margins: {
                marginType: 'custom',
                bottom: 0,
                left: 0,
                top: 0,
                right: 0
              },
            })
            writeFileSync(save.filePath, buffer)
            shell.showItemInFolder(save.filePath)
          }
        } finally {
          win.setBrowserView(null)
          ipcMain.off('print-pdf-ready', ready)
        }
      }
      ipcMain.on('print-pdf-ready', ready)
      setTimeout(() => {
        view.webContents.send('print-pdf-load', filePath, rootPath)
      }, 300)
    }
  })
}
