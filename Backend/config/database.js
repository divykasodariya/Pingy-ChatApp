import mongoose from "mongoose"
const connectDB = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("sucessfully connected database")
    }
    catch (error) {
        
        console.log(error);
    }
}

export default connectDB;