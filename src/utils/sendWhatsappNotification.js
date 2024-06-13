const axios = require('axios');

const sendWhatsAppNotification = async (vendorWhatsAppNumber, notificationMessage) => {
  const url = `https://api.whatsapp.com/send?phone=${vendorWhatsAppNumber}&text=${encodeURIComponent(
    notificationMessage
  )}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      console.log('WhatsApp message sent successfully');
    } else {
      console.error('Failed to send WhatsApp message');
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
};

module.exports = sendWhatsAppNotification;