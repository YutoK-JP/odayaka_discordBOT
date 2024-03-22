module.exports = {
    name:"messageCreate",
    nick:"noReply",
    async execute(message, client, env){
      if(message.channelId != "1143394316736270436") return;
      if(message.type != 19) return;
      if(message.author.bot) return;
      
      console.log(`message from ${message.author.username} was deleted.(reply to ${message.reference.messageId})`)

      var createDate = new Date(message.createdTimestamp);
      var createTime = createDate.toLocaleString();


      var logObject = {
        "ユーザー名": message.author.username,
        "メッセージ内容" : message.content,
        "作成日時" : createTime,
      }

      const fs = require("fs");
      const logFilePath = "/home/pi/odayaka/log/noReply.json";
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
      message.delete()
    }
}
