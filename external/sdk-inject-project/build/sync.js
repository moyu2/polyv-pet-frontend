/**
 * @file 同步最后的打包资源
 */

const fs = require('fs');
const path = require('path');

/**
 * 根据文件夹路径，递归复制文件
 * @param sourceDir 源文件目录
 * @param targetDir 目标文件目录
 */
function copyDirRecursiveSync(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const sourceFile = path.join(sourceDir, file);
    const targetFile = path.join(targetDir, file);
    const stats = fs.statSync(sourceFile);

    if (stats.isFile()) {
      fs.copyFileSync(sourceFile, targetFile);
    } else if (stats.isDirectory()) {
      copyDirRecursiveSync(sourceFile, targetFile);
    }
  }
}

(function main() {
  try {
    const sourcePath = path.resolve(__dirname, '../../../dist-sdk-inject');
    const destPath = path.resolve(__dirname, '../dist/polyv-watch-app');

    copyDirRecursiveSync(sourcePath, destPath);

    console.info('build success!');
  } catch (err) {
    console.error('build error!', err);
  }
})();
