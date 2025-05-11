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
        // default: ""
        validate:{
            validator: function(v){
                if (this.isFolder) return v === null;
                return typeof(v) === "string" && v.length>=0;
            },
            message: props => props.instance.isFolder ? "Folder shall not have any content" : "Files shall have a content parameter"
        }
    },
    children: {
        type: mongoose.Schema.Types.Mixed,
        // default: []
        default: undefined, 
        validate:{
            validator: function(v){
                if (this.isFolder) return Array.isArray(v);
                return v === undefined;
            },
            message: props => props.instance.isFolder ? "Folders must have children" : "Files dont have any children"
        }
    }
})
 
  const userSchema = new mongoose.Schema({
      roomId: {
          type: String,
          required: true,
          unique: true
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