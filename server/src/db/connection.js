import mongoose from 'mongoose'
import 'dotenv/config'


const connectdb = async () => {

    // console.log('U')
    try{
        await mongoose.connect("mongodb://0.0.0.0:27017/codeSync")
        console.log("Successfully connected to database")
    }

    catch (error) {
        console.log("Error connecting to database: ", error)
        process.exit(1)
    }

}

export default connectdb