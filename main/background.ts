import crypto from 'crypto';
import { app, dialog, ipcMain } from 'electron';
import serve from 'electron-serve';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { ICacheImage } from '../renderer/type';
import { createWindow } from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const imageCache = path.join(app.getPath('userData'), 'thumbnail');

(async () => {
  await app.whenReady();

  // create thumbnail directory
  if (!fs.existsSync(imageCache)) {
    fs.mkdirSync(imageCache);
  }

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.handle('showDialog', async _event => {
  return await dialog.showOpenDialog({ properties: ['openDirectory'] });
});

ipcMain.handle('cacheImage', async (_event, source: ICacheImage[]) => {
  console.debug(`${source.length} of thumbnails to be created.`);
  try {
    await Promise.all(source.map(o => createThumbnail(o)));
  } catch (e) {
    console.error(e);
  }
});

async function createThumbnail(image: ICacheImage): Promise<void> {
  const fileName = crypto.createHash('md5').update(image.src).digest('hex');
  const imageCachePath = path.join(imageCache, fileName);
  try {
    const sharpInstance = sharp(image.data);
    const buffer = await sharpInstance
      .resize({ height: 360 })
      .sharpen()
      .avif()
      .toBuffer();
    await fs.promises.writeFile(imageCachePath, buffer);
  } catch (e) {
    console.error('cache image: ', e);
  }
}
