/**
 * Created by liz on 2015/10/29.
 */
module.exports = {
    port: process.env.INCAR_PORT || 8080,
    logLevel: process.env.INCAR_LOG_LEVEL || 2, // 1:Error 2:Warning 3:Info 4:Detail
    aliyunCMSUrl: 'http://metrics.aliyuncs.com',
    aliyunCMSVersion: '2015-04-20',
    aliyunAccessKeyId: '***',
    aliyunAccessKeySecret: '***'
};
