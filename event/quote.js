const { execSync } = require("child_process")
var req = require('request');
var fs = require('fs');
const { response } = require("express");
const { setTimeout } = require('timers/promises');

module.exports = {
    name:"messageCreate",
    nick:"quote",
    async execute(message, client, env){
      if(message.channel.type == 1) return;
      if (message.author.bot) return;
      //console.log((message.type == 'REPLY'));
      if (!(Array.from(message.mentions.members.keys()).includes(env.clientId))) return;

      console.log("Hi!");
      ch = message.channel;
      IMAGE_PATH = "/home/pi/odayaka/quote/"
      
      org_id = message.reference.messageId
      org_message = await ch.messages.fetch(org_id)
      
      if(org_message.author.bot && !(message.content.includes("re"))) return;

      let ex_imgURL;
      if(org_message.attachments.size === 1){
                org_message.attachments.forEach(e=>{
            ex_imgURL = e.url;
        })
      }
      else{
        ex_imgURL = null;
      }

      if(!org_message){
        message.reply("メッセージが古すぎる等の理由で、BOTで参照できません。");
        return ;
      }

      let moji = message.content.includes("文字") || message.content.includes("text");
      
      python_exec = "/home/pi/odayaka/render_image.py"

      user_id = org_message.member.id
      client_id = message.member.id
      image_URL = org_message.member.displayAvatarURL()
      content = org_message.content
      user_name = org_message.member.displayName

      
      user_img = IMAGE_PATH + "users/" + user_id+".png"
      output = IMAGE_PATH + client_id+".png"

      if(!ex_imgURL || moji){
        req({
          method:"GET", url:image_URL, encoding:null,},
          async (error, res, body) => {
            if(!error && response.statusCode === 200){
              fs.writeFileSync(user_img, body, 'binary');
              await execSync(`python \"${python_exec}\" ${output} \"${user_img}\" \"${user_name}\" \"${content}\" null`)
              
              await message.reply({ files: [output]})
            }
        })
      }
      else{
        ex_image = IMAGE_PATH + "image/" + user_id+".png"
        req({
          method:"GET", url:image_URL, encoding:null,},
          async (error, res, body1) => {
            if(!error && response.statusCode ===200){
              fs.writeFileSync(user_img, body1, 'binary');
              req({
                method:"GET", url:ex_imgURL, encoding:null,},
                async (error, res, body) => {
                  if(!error && response.statusCode ===200){
                    fs.writeFileSync(ex_image, body, 'binary');
                    await execSync(`python \"${python_exec}\" ${output} \"${user_img}\" \"${user_name}\" \"${content}\" \"${ex_image}\"`)
                    
                    await message.reply({ files: [output]})
                  }
              })
            }
        })
      }
        


  }
}