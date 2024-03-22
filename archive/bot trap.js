module.exports = {
    name:"messageCreate",
    nick:"trap",
    async execute(message, client, env){
      return;
        if(message.bot) return;
        if(message.channelId != "1001715381922189313") return;

        const fs = require("fs"); 
        
        if(message.member.moderatable){
          try{
            timeout = 10800000;
            message.member.timeout(timeout, "TRAPPED OF BOT");
            const actorname = message.member.user.username;

            var date = new Date();
            date=date.toLocaleString();
            fs.appendFileSync('/home/pi/Share/traplog.txt', `[${date}]「${actorname}」 has trapped with message:「${message.content}」.\n`);

            const admin_user = await client.users.fetch("541617956208246794");

            admin_user.send(`[${date}]「${actorname}」 has trapped with message:「${message.content}」.\n`);

            message.delete();
          }
          catch(e){
            console.log(e)
          }
        }
      }
}