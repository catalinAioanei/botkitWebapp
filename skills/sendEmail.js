const nodemailer = require('nodemailer');
const validator = require('validator');
const wordfilter = require('wordfilter');
wordfilter.addWords(['zebra','elephant']);

module.exports = function(controller) {

  controller.hears('email','message_received', function(bot, message) {

    bot.startConversation(message, function(err, convo) {
      convo.say("You are about to send an email to Camden Council that contains an FOI request.");

      convo.ask('What is your request?', function(response, convo){
        convo.say('Hold on while we validate your request');

        if (!wordfilter.blacklisted(response.text)) {

        convo.say('Your request passed our validation process');
        convo.say('Your request is: ' + response.text);

        convo.ask('What is your email address?', function(response, convo){
          if(!validator.isEmail(response.text)){
            convo.say('That is not a valid email address');
            convo.next();
          } else {

            // let transporter = nodemailer.createTransport({
            //   service:'gmail',
            //   secure: false,
            //   port: 25,
            //   auth: {
            //     user:,
            //     pass:
            //   },
            //   tls: {
            //     rejectUnauthorized: false
            //   }
            // });
            convo.say('That was a valid email address man');
            convo.next();

          }
        });
    } else {
        convo.say('I am sorry, but I am afraid we can not email that.');
        convo.next();
    }
      });
    });

  });

}

//systemsEngTeam12@gmail.com
