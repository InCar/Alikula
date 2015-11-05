/**
 * Created by liz on 2015/10/29.
 */
module.exports = {
    port: process.env.INCAR_PORT || 8080,
    logLevel: process.env.INCAR_LOG_LEVEL || 2, // 1:Error 2:Warning 3:Info 4:Detail
    aliyunCMSUrl: 'http://metrics.aliyuncs.com',
    aliyunCMSVersion: '2015-04-20',
    aliyunInstances: [
        {key: "TestingServer", value: "i-236pp2bne"},
        {key: "inCarDev", value: "i-23orv50er"},
        {key: "INCAR01", value: "AY140402102724524c92"}
    ],
    aliyunAccessKeyId: '6VXnxE3VeyLvGS57',
    aliyunAccessKeySecret: 'JAOJwWTyCbrGTIYO2bRQapltCFLzOb'
};
