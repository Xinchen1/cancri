import { obfuscate } from 'javascript-obfuscator';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const distDir = './dist';
const assetsDir = join(distDir, 'assets');

// 混淆配置 - 高强度保护
const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // 设置为 false，避免影响 GitHub Pages 运行
  debugProtectionInterval: 0,
  disableConsoleOutput: false, // 保留 console，方便调试
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

function obfuscateFile(filePath: string): void {
  try {
    const code = readFileSync(filePath, 'utf-8');
    
    // 跳过 source map 文件
    if (filePath.endsWith('.map')) {
      console.log(`⏭️  跳过 source map: ${filePath}`);
      return;
    }
    
    // 跳过 HTML 文件
    if (filePath.endsWith('.html')) {
      console.log(`⏭️  跳过 HTML: ${filePath}`);
      return;
    }
    
    // 只处理 JavaScript 文件
    if (!filePath.endsWith('.js')) {
      return;
    }
    
    console.log(`🔒 混淆文件: ${filePath}`);
    
    const obfuscationResult = obfuscate(code, obfuscationOptions);
    const obfuscatedCode = obfuscationResult.getObfuscatedCode();
    
    writeFileSync(filePath, obfuscatedCode, 'utf-8');
    console.log(`✅ 完成混淆: ${filePath}`);
  } catch (error) {
    console.error(`❌ 混淆失败 ${filePath}:`, error);
    throw error;
  }
}

function processDirectory(dir: string): void {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (stat.isFile()) {
        obfuscateFile(filePath);
      }
    }
  } catch (error) {
    console.error(`❌ 处理目录失败 ${dir}:`, error);
    throw error;
  }
}

console.log('🚀 开始混淆构建文件...');
console.log(`📁 目标目录: ${distDir}`);

try {
  // 检查 dist 目录是否存在
  if (!statSync(distDir).isDirectory()) {
    console.error(`❌ 构建目录不存在: ${distDir}`);
    console.error('💡 请先运行: npm run build');
    process.exit(1);
  }

  // 处理 assets 目录中的所有 JS 文件
  if (statSync(assetsDir).isDirectory()) {
    processDirectory(assetsDir);
    console.log('✅ 所有文件混淆完成！');
  } else {
    console.warn(`⚠️  Assets 目录不存在: ${assetsDir}`);
    console.warn('💡 可能构建失败，检查构建输出');
    process.exit(1);
  }
} catch (error: any) {
  console.error('❌ 混淆过程出错:', error.message);
  if (error.code === 'ENOENT') {
    console.error('💡 文件或目录不存在，请先运行: npm run build');
  }
  process.exit(1);
}

