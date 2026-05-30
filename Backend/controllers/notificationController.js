import Notification from "../models/Notification.js";
import axios from "axios";

// Notification එකක් create කරන පොදු function එක
export const createNotification = async ({ tenantType, tokenNumber, title, message, type, module, userId }) => {
  try {
    const newNotification = new Notification({
      tenantType,
      tokenNumber,
      title,
      message,
      type,
      module,
      userId
    });
    await newNotification.save();
    console.log(`Notification created for ${tokenNumber} (user: ${userId})`);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

// User ට අදාළ notifications ලබා ගැනීම
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    const query = { userId, isRead: false };
    
    // දැනට tenantType එක නැති වුණත් userId එක තියෙනවා නම් notifications පෙන්නන්න
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing in request." });
    }

    // දැනට userId එකෙන් විතරක් find කරලා බලමු වැඩේද කියලා
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notification එකක් 'Read' ලෙස mark කිරීම
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    
    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// සියල්ලම 'Read' ලෙස mark කිරීම
export const markAllAsRead = async (req, res) => {
  try {
    
    const userId = req.user?.id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    
    res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendSMS = async (phoneNumber, message) => {
   try {
      if (!phoneNumber) return; 

      // Notify.lk එකට ගැළපෙන්න + ලකුණ තියෙනවා නම් ඒක අයින් කරනවා
      // (උදා: +9477... වෙනුවට 9477... විදියට යවනවා)
      const formattedNumber = phoneNumber.replace('+', '');

      const response = await axios.post(
         "https://app.notify.lk/api/v1/send",
         {
            user_id: process.env.NOTIFY_USER_ID,
            api_key: process.env.NOTIFY_API_KEY,
            sender_id: process.env.NOTIFY_SENDER_ID, 
            to: formattedNumber,
            message: message,
         }
      );
      
      // Notify.lk එකෙන් success කියලා ආවොත්
      if(response.data && response.data.status === "success") {
         console.log(`✅ Notify.lk SMS sent successfully to: ${phoneNumber}`);
      } else {
         console.log("⚠️ Notify.lk warning/error:", response.data);
      }

   } catch (error) {
      console.error("❌ Notify.lk SMS error:", error.response?.data || error.message);
   }
};