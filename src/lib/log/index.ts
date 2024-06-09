import { error } from 'tauri-plugin-log-api';

export async function errorLog(msg: unknown) {
  if (typeof msg === 'string') {
    await error(msg);
  } else if (msg instanceof Error) {
    await error(msg.message);
  } else {
    await error(String(msg));
  }
}
