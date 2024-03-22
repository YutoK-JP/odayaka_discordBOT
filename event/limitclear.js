module.exports = {
    name:"voiceStateUpdate",
    nick:"limit clear",
    async execute(oldstate, newstate, client){
        if(!(oldstate.channel)) return;
        if(oldstate.guild.id != 763425893741363210) return;

        const ch = oldstate.channel

        if(ch.members.size == 0){
          try{
            ch.setUserLimit(0)
          }
          catch(e){
            console.log(e)
          }
        }
      }
}