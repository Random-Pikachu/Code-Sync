import mongoose from 'mongoose'
import 'dotenv/config'


const connectdb = async () => {

    // console.log('U')
    try{
        await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.cvlp5es.mongodb.net/codeSync`)
        console.log("Successfully connected to database")
    }

    catch (error) {
        console.log("Error connecting to database: ", error)
        process.exit(1)
    }

}

export default connectdb