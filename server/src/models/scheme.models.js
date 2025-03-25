import mongoose from "mongoose";



const fileStructure = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type:String,
        required: true

    },
    isFolder: {
        type: Boolean,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    children: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    }
})

const userSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    users: {
        type: [String],
        default: []
    },
    fileStruct: {
        type: [fileStructure],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
})



export const data = mongoose.model("data", userSchema);