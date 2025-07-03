const cron = require("node-cron");
const sendEmail = require("./sendEmail");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);  // Subtract 1 day
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    console.log("Emails to notify:", listOfEmails);

    await Promise.all(
      listOfEmails.map(async (email) => {
        try {
          console.log(`Sending email to ${email}`);
          await sendEmail.run(
            `New Friend Request pending for ${email}`,
            "There are pending requests. Please log in to CodeConnect.shop and accept or reject them."
          );
        } catch (err) {
          console.error("Error sending email to:", email, err);
        }
      })
    );

  } catch (err) {
    console.error("Cron job failed:", err);
  }
});
