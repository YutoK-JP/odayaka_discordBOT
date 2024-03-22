module.exports = {
  name:"messageCreate",
  nick:"2-chan",
  async execute(message, client, env){
    if(message.author.bot) return;
    if(message.channel.id != env.niChan) return;

    const orgMessage = message.content;
    let Name, Content;
    const userid = message.author.id;

    const fs = require("fs");
    const configPath = "conf/2ch_name.json";
    const nameConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));


    if(orgMessage.match(/^<.*>.*/)){
      [Name, Content] = orgMessage.split("<")[1].split(">");
      if(Name==""){
        Name = "名無しさん＠お腹いっぱい。";
        delete nameConfig[userid]
      }
      else{
        nameConfig[userid] = Name;
      }
      fs.writeFileSync(configPath, JSON.stringify(nameConfig, null, "\t"));
    }
    else{
      if(Object.keys(nameConfig).includes(userid))
        Name = nameConfig[userid];
      else
        Name = "名無しさん＠お腹いっぱい。";

      Content = orgMessage;
    }
    let beforeMessage = (await message.channel.messages.fetch({limit:10, before:message.id})).find(mes=>mes.author.bot);
    //message.channel.send("a");
    //console.log(beforeMessage);
    let threadNumber;
    if(beforeMessage!==undefined){
      beforeMessage = beforeMessage.content;
      if(beforeMessage.match(/^[0-9]+：/)){
        threadNumber = Number(beforeMessage.split("：")[0])+1;
      }
      else{
        threadNumber=1;
      }
    }
    else{
      threadNumber=1;
    }
    //console.log(threadNumber);

    
    let now = new Date();
    const weekDay = ["日", "月", "火", "水", "木", "金", "土"];
    let displayDate = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}(${weekDay[now.getDay()]}) ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    let Sending
    if(Content.includes("\n"))
    {
      Sending = `${threadNumber}：${Name}：${displayDate} ID:${userid}\n${Content}`
    }
    else
    {
      Sending = `${threadNumber}：${Name}：${displayDate} ID:${userid}\n\t${Content}`
    }
    

    if(orgMessage.match(/>>[1-9].[0-9]*/))
    {
      let anchorN = Number(orgMessage.match(/>>[1-9].[0-9]*/)[0].slice(2));
      if(anchorN < threadNumber && threadNumber-anchorN > 20 )
      {
        const oldMessages = await message.channel.messages.fetch({limit:100, before:message.id});
        oldMessages.forEach(mes=>{
          if(mes.content.match(/^[0-9]+：/)){
            var N = Number(mes.content.split("：")[0]);
            if(N == anchorN){
              Sending+=`\n\t${mes.url}`
              return;
            }
          }
        });
      }
    }
    message.channel.send(Sending);
    message.delete();
  }
}