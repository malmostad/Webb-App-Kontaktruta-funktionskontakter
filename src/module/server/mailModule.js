define(function(require) {
	'use strict';

	var
		logUtil = require('LogUtil');

	return {
		sendMail: function(params) {

			var mailUtil = require('MailUtil'),
				mailBuilder = mailUtil.getMailBuilder(),
				completeMessage = '',
				sent = false,
				to;

			to = params.to;
			completeMessage = completeMessage + 'Meddelande från sidan: ' + params.currentURL + '\n\n';
			completeMessage = completeMessage + 'Namn: ' + params.name + '\n';
			completeMessage = completeMessage + 'Email: ' + params.email + '\n';
			completeMessage = completeMessage + 'Telefon: ' + params.phone + '\n\n';
			completeMessage = completeMessage + 'Meddelande:\n' + params.message + '\n';

			mailBuilder.setSubject(params.subject);
			mailBuilder.setTextMessage(completeMessage);
			mailBuilder.addRecipient(params.to);

			try {
				sent = mailBuilder.build().send();
			} catch (e) {
				logUtil.error('[Kontaktruta] Could not send mail to: ' + to + ' because: ' + e);
			}

			logUtil.info('[Kontaktruta] Mail sent to: ' + to);

			return sent;
		}
	};
});