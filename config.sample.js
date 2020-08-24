module.exports = {

    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: "<yourBoTName>",
        password: "oauth:<yourBotSecretOauth>"
    },
    channels: [ "<yourCannel>" ]
  
}