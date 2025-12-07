// copy404.js
import { promises as fs } from 'fs';
import path from 'path';

const source = path.join('dist', 'index.html');
const destination = path.join('dist', '404.html');

// 確保 Node.js 支援 ES Module (由於您的 package.json 設置了 "type": "module"，所以可以使用 import)
async function copyFile() {
  try {
    await fs.copyFile(source, destination);
    console.log(`✅ ${source} 已成功複製為 ${destination}`);
  } catch (err) {
    console.error(`❌ 複製檔案時出錯: ${err}`);
    // 如果複製失敗，應退出並報錯，防止部署不完整的檔案
    process.exit(1); 
  }
}

copyFile();