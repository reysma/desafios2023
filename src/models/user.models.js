
import mongoose from "mongoose";


const userCollection = "users";

const userSchema = mongoose.Schema({
    name: String,
    lastname: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,

});

const userModel = mongoose.model(userCollection, userSchema)

export default userModel