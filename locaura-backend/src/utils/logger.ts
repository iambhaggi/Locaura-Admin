import chalk from 'chalk';

export class Logger {
  static info(message: string, context?: any) {
    const ctx = context ? chalk.cyan(`[${context}] `) : '';
    console.log(chalk.blue('ℹ INFO: ') + ctx + message);
  }

  static success(message: string, context?: any) {
    const ctx = context ? chalk.cyan(`[${context}] `) : '';
    console.log(chalk.green('✔ SUCCESS: ') + ctx + message);
  }

  static warn(message: string, context?: any) {
    const ctx = context ? chalk.cyan(`[${context}] `) : '';
    console.warn(chalk.yellow('⚠ WARN: ') + ctx + message);
  }

  static error(message: string, error?: any, context?: any) {
    const ctx = context ? chalk.cyan(`[${context}] `) : '';
    console.error(chalk.red('✖ ERROR: ') + ctx + message);
    if (error) {
      console.error(chalk.red(error.stack || error));
    }
  }
}
