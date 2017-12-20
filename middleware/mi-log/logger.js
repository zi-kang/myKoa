const log4js = require('log4js');
const path = require("path");
const client = require("./access.js");

// ALL OFF 这两个等级并不会直接在业务代码中使用
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];
// 几个常用的type
// const types = ["console", "file", "dateFile", "levelFilter", "pattern"];

const baseInfo = {
    appLogLevel: 'debug',
    dir: 'logs',
    env: 'local',
    projectName: 'default',
    serverIp: '0.0.0.0'
}

/**
 * log 中间件主函数
 *
 * @param {string} env - 环境变量
 * @param {Object} options
 * @param {Object} options.projectName - 项目名称
 * @param {Object} options.appLogLevel - app日志记录的日志级别
 * @param {Object} options.serverIp - 当前服务器ip
 * @returns
 */
module.exports = (options) => {
    let contextLogger = {};
    let config = {};
    const opts = Object.assign({}, baseInfo, options || {}) ;
    const {
        projectName,
        serverIp,
        appLogLevel,
        dir,
        env
    } = opts;
    const currentLevel = methods.findIndex(ele => ele === appLogLevel)
    const appenders = {};
    const commonInfo = { projectName, serverIp };

    appenders.tasks = {
        type: 'dateFile',
        filename: `${dir}/task`,
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true
    }
    // 开发环境添加终端打印日志
    if (env === "dev" || env === "local" || env === "development") {
        appenders.out = {
            type: "console"
        }
    }

    config = {
        appenders,
        categories: {
            default: {
                appenders: Object.keys(appenders),
                level: appLogLevel
            }
        }
    }
    // 访问日志
    const accessLogger = log4js.getLogger("access");
    // 应用日志
    const performanceLogger = log4js.getLogger("performance");

    // 将log挂在上下文上
    return async (ctx, next) => {
        const start = Date.now();

        log4js.configure(config);
        // level 以上级别的日志方法
        methods.forEach((method, i) => {
            if (i >= currentLevel) {
                contextLogger[method] = (message) => {
                    performanceLogger[method](client(ctx, message, commonInfo))
                }
            } else {
                contextLogger[method] = () => {}
            }
        });
        ctx.log = contextLogger;

        await next();
        // 记录URL以及页面执行时间
        const delta = Date.now() - start;
        accessLogger.info(client(ctx, {
            responseTime: delta
        }, commonInfo))
    }
}