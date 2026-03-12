import chalk from 'chalk';

export class Logger {
  static info(message: any, context?: string) {
    const args: any[] = [chalk.blue('ℹ INFO:')];
    if (context) args.push(chalk.cyan(`[${context}]`));
    args.push(message);
    console.log(...args);
  }

  static success(message: any, context?: string) {
    const args: any[] = [chalk.green('✔ SUCCESS:')];
    if (context) args.push(chalk.cyan(`[${context}]`));
    args.push(message);
    console.log(...args);
  }

  static warn(message: any, context?: string) {
    const args: any[] = [chalk.yellow('⚠ WARN:')];
    if (context) args.push(chalk.cyan(`[${context}]`));
    args.push(message);
    console.warn(...args);
  }

  static error(message: any, error?: any, context?: string) {
    const args: any[] = [chalk.red('✖ ERROR:')];

    // Auto-detect if second argument is context (string) or an error object.
    let err = error;
    let ctx = context;
    if (typeof error === 'string' && context === undefined) {
      ctx = error;
      err = undefined;
    }

    if (ctx) args.push(chalk.cyan(`[${ctx}]`));
    args.push(message);
    console.error(...args);

    if (err) {
      console.error(chalk.red(typeof err === 'object' && err.stack ? err.stack : err));
    }
  }
}
