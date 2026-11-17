
const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  relatedId
}) => {
  try {
    if (!recipient || !sender || recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId
    });

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

module.exports = createNotification;
