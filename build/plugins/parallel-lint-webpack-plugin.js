/* eslint-disable no-unused-vars */
const { spawn } = require('child_process');
const os = require('os');

/**
 * 并行 lint Webpack 插件
 * 使用子进程并行执行 ESLint 和 StyleLint 检查（通过 npm 脚本）
 * 在 webpack emit 前等待 lint 完成，确保代码质量
 */
class ParallelLintWebpackPlugin {
  /**
   * @param {Object} options 插件配置
   * @param {boolean} options.enabled 是否启用并行 lint
   * @param {boolean} options.failOnError lint 失败是否阻塞构建
   * @param {number} options.workerCount worker 线程数量（保留参数）
   * @param {Object} options.eslintOptions ESLint 配置（保留参数）
   * @param {Object} options.stylelintOptions StyleLint 配置（保留参数）
   */
  constructor(options = {}) {
    this.options = {
      enabled: true,
      failOnError: true,
      workerCount: Math.max(1, os.cpus().length - 1),
      eslintOptions: {},
      stylelintOptions: {},
      ...options,
    };

    this.lintProcesses = [];
    this.lintPromises = [];
    this.hasError = false;
    this.errorMessages = [];
  }

  /**
   * 应用插件到 Webpack compiler
   * @param {import('webpack').Compiler} compiler Webpack compiler 实例
   */
  apply(compiler) {
    // 如果不启用并行 lint，则不执行操作
    if (!this.options.enabled) {
      return;
    }

    // 在编译开始时启动 lint 检查
    compiler.hooks.compile.tap('ParallelLintWebpackPlugin', () => {
      this.startLintProcesses();
    });

    // 在 emit 前等待 lint 完成（阻塞构建流程）
    compiler.hooks.emit.tapPromise('ParallelLintWebpackPlugin', async compilation => {
      console.log('⏳ 等待 lint 检查完成...');
      await this.waitForLintCompletion();

      if (this.hasError && this.options.failOnError) {
        const errorMessage = `❌ Lint 检查失败，构建被阻止:\n${this.errorMessages.join('\n')}`;
        compilation.errors.push(new Error(errorMessage));
        throw new Error(errorMessage);
      }

      console.log('✅ lint 检查完成，继续构建流程');
    });

    // 监听编译完成，输出最终结果
    compiler.hooks.done.tap('ParallelLintWebpackPlugin', stats => {
      this.outputLintResults(stats);
    });

    // 监听编译失败，清理进程
    compiler.hooks.failed.tap('ParallelLintWebpackPlugin', () => {
      this.cleanupProcesses();
    });
  }

  /**
   * 启动 lint 进程
   */
  startLintProcesses() {
    console.log('🚀 启动并行 lint 检查...');

    const lintTasks = [
      { type: 'vue-tsc-check', script: 'check:prod' },
      { type: 'eslint', script: 'lint-es' },
      { type: 'stylelint', script: 'lint-style' },
    ];

    lintTasks.forEach(task => {
      const promise = this.startLintProcess(task);
      this.lintPromises.push(promise);
    });
  }

  /**
   * 启动单个 lint 进程
   * @param {Object} task lint 任务配置
   * @returns {Promise<void>} lint 进程的 Promise
   */
  startLintProcess(task) {
    return new Promise((resolve, reject) => {
      console.log(`📦 启动 ${task.type} 检查: npm run ${task.script}`);

      const child = spawn('npm', ['run', task.script], {
        cwd: process.cwd(),
        stdio: 'pipe', // 捕获输出以便显示
        shell: process.platform === 'win32',
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      child.on('close', code => {
        if (code !== 0) {
          console.error(`❌ ${task.type} 检查失败，退出码: ${code}`);
          if (stderr) console.error(stderr);
          if (stdout) console.log(stdout);

          this.hasError = true;
          this.errorMessages.push(`${task.type} 检查失败: ${stderr || '查看上方输出'}`);
          reject(new Error(`${task.type} 检查失败，退出码: ${code}`));
        } else {
          console.log(`✅ ${task.type} 检查完成`);
          if (stdout) console.log(stdout);
          resolve();
        }
      });

      child.on('error', error => {
        console.error(`❌ ${task.type} 进程错误: ${error.message}`);
        this.hasError = true;
        this.errorMessages.push(`${task.type} 进程错误: ${error.message}`);
        reject(error);
      });

      this.lintProcesses.push(child);
    });
  }

  /**
   * 等待所有 lint 进程完成
   */
  async waitForLintCompletion() {
    try {
      await Promise.all(this.lintPromises);
    } catch (error) {
      // 错误已经在 startLintProcess 中处理，这里只需确保等待完成
      // 如果 failOnError 为 false，我们仍然继续构建
      if (!this.options.failOnError) {
        console.warn('⚠️  Lint 检查发现错误，但配置为不阻塞构建');
      }
    }
  }

  /**
   * 输出 lint 检查结果
   * @param {Object} stats webpack stats 对象
   */
  outputLintResults(stats) {
    // 清理进程
    this.cleanupProcesses();

    if (this.hasError && !this.options.failOnError) {
      console.warn('⚠️  Lint 检查发现以下问题（但构建继续）:');
      this.errorMessages.forEach(msg => console.warn(`   ${msg}`));
    } else if (!this.hasError) {
      console.log('✅ 所有 lint 检查通过');
    }
  }

  /**
   * 清理进程
   */
  cleanupProcesses() {
    this.lintProcesses.forEach(child => {
      if (!child.killed) {
        try {
          child.kill('SIGTERM');
        } catch (e) {
          // 忽略错误
        }
      }
    });
    this.lintProcesses = [];
    this.lintPromises = [];
  }
}

module.exports = ParallelLintWebpackPlugin;
