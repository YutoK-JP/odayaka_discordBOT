module.exports = {
  name:'sendDeleteLogFile',
  permissions: ['SEND_MESSAGES'],
  execute: async function(interection, client, env){
    if(!checkrole(interection.member, env.AllowedViewLog)) {
      interection.reply({content:"このコマンドを実行する権限がありません。", ephemeral: true});
      return
    }
    else{
        interection.reply({files:[env.deleteLogFile], ephemeral: true});
        return;
    }
  }
}

function checkrole(member, roles)
{
    const memberroles = Array.from(member.roles.cache.keys());

    for(var i=0; i<roles.length; i++)
    {
        if(memberroles.includes(roles[i]))
            return true;
    }
    return false;
}
