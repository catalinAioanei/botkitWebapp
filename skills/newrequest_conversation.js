var request = require('request');
var wordfilter = require('wordfilter');
wordfilter.addWords(['zebra','elephant']);

module.exports = function(controller) {

    controller.hears('request', 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {
            convo.say('You are about to enter an FOI request that will be processed by our servers.');

            convo.ask('What is your request?', function(response, convo) {
                convo.say('Hold on while we validate your request');

                if (!wordfilter.blacklisted(response.text)) {
                convo.say('Your request passed our validation process');
                convo.say('Your request is: ' + response.text);
                convo.say('Please wait while we try to find any matches...');

                request.post(
                  'http://localhost:5000/predict',
                  { json: { question: response.text } },
                  function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      if(body.good_match.length == 0){
                        convo.say('We processed your request but could not find any matches');
                      }else{
                        convo.say('Good news. We found a match. The reference number is : ' + body.good_match[0].reference);
                      }
                    } else {
                      convo.say("Ahh, you got bamboozled again. Couldn't process your request");
                    }
                  }
                );
                convo.next();
            } else {
                convo.say('I am sorry, but I am afraid I can not process that.');
                convo.next();
            }

            });
        });

    });


    controller.hears(['^question$'], 'direct_message,direct_mention,bot_message', function(bot, message) {

        bot.createConversation(message, function(err, convo) {

            // create a path for when a user says YES
            convo.addMessage({
                    text: 'How wonderful.',
            },'yes_thread');

            // create a path for when a user says NO
            // mark the conversation as unsuccessful at the end
            convo.addMessage({
                text: 'Cheese! It is not for everyone.',
                action: 'stop', // this marks the converation as unsuccessful
            },'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand. Say `yes` or `no`',
                action: 'default',
            },'bad_response');

            // Create a yes/no question in the default thread...
            convo.ask('Do you like cheese?', [
                {
                    pattern:  bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                    },
                },
                {
                    pattern:  bot.utterances.no,
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);

            convo.activate();

            // capture the results of the conversation and see what happened...
            convo.on('end', function(convo) {

                if (convo.successful()) {
                    // this still works to send individual replies...
                    bot.reply(message, 'Let us eat some!');

                    // and now deliver cheese via tcp/ip...
                }

            });
        });

    });

};
