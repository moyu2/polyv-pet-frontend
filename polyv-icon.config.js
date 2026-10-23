/**
 * 文档地址：https://npm-registry.polyv.net/-/web/detail/@polyv/icons-cli
 */

/** @type {import('@polyv/icons-cli').IconLibraryCliConfig[]} */
module.exports = [
  {
    resourcesDir: './icon-svgs/pc',
    outDir: './src/components/component-icons/pc',
    libraryType: 'vue-middle',
    iconMap: './src/components/component-icons/pc/map.ts',
    convertColorMode: 'all',
    mapExportPrefix: 'PcIcon',
    demoHtml: './icon-svgs/demo/icon-demo-pc.html',
    libraryName: 'PC 端观看页图标',
    endOfLine: 'lf',
  },
  {
    resourcesDir: './icon-svgs/mobile',
    outDir: './src/components/component-icons/mobile',
    libraryType: 'vue-middle',
    iconMap: './src/components/component-icons/mobile/map.ts',
    convertColorMode: 'all',
    mapExportPrefix: 'MobileIcon',
    demoHtml: './icon-svgs/demo/icon-demo-mobile.html',
    libraryName: '移动端观看页图标',
    endOfLine: 'lf',
  },
  {
    resourcesDir: './icon-svgs/pc-origin',
    outDir: './src/components/component-icons/pc-origin',
    libraryType: 'vue-middle',
    iconMap: './src/components/component-icons/pc-origin/map.ts',
    mapExportPrefix: 'PcOriginIcon',
    demoHtml: './icon-svgs/demo/icon-demo-pc-origin.html',
    libraryName: 'PC 端观看页图标（原始色）',
    convertColorMode: 'origin',
    endOfLine: 'lf',
  },
  {
    resourcesDir: './icon-svgs/mobile-origin',
    outDir: './src/components/component-icons/mobile-origin',
    libraryType: 'vue-middle',
    iconMap: './src/components/component-icons/mobile-origin/map.ts',
    mapExportPrefix: 'MobileOriginIcon',
    demoHtml: './icon-svgs/demo/icon-demo-mobile-origin.html',
    libraryName: '移动端观看页图标（原始色）',
    convertColorMode: 'origin',
    endOfLine: 'lf',
  },
];
