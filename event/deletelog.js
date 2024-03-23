const { AuditLogEvent} = require('discord.js');

module.exports = {
    name:"messageDelete",
    async execute(message, client, env){
        if(message.guildId != env.log_guild) return;
        if(message.author.bot || message.interection) return;
        if(message.channel.id == env.niChan) return;

        const path = require("path");
        const fs = require("fs");

        var createDate = new Date(message.createdTimestamp);
        var createTime = createDate.toLocaleString();

        var deleteDate = new Date()
        var deletedTime = deleteDate.toLocaleString();
        
        var user = message.author.username;
        var mes = message.content;

        var channelName = message.channel.name

        var logObject = {
          "ユーザー名": user,
          "メッセージ内容" : mes,
          "チャンネル": channelName,
          "作成日時" : createTime,
          "消去日時": deletedTime
        }
        //#endregion

        const logFilePath = env.deleteLogFile;
        if(fs.existsSync(logFilePath))
        {
          try{
            var dataArray = JSON.parse(fs.readFileSync(logFilePath));

            dataArray.unshift(logObject);

            fs.writeFileSync(logFilePath, JSON.stringify(dataArray, null, "  "));
          }
          catch(e){
            console.log(e);
          }
        }
        else{
          var dataArray = [logObject];
          
          fs.writeFileSync(logFilePath, JSON.stringify(dataArray, null, "  "));
        }
        
      }
}