import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://goels4280:iqbnrYwmIzkTZanB@codec.dwkcs2l.mongodb.net/?retryWrites=true&w=majority&appName=CodeC"
        
    );
};

module.exports = connectDB;
