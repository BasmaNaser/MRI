const mongoose=require('mongoose');

const noteSchema=new mongoose.Schema(
    {
        patient:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Patient',
            required:true
        },
        doctor:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Doctor',
            required:true
        },
        title:
        {
        type:String
        },
        note:
        {
            type:String,
            required:true
        }
    },
    {timestamps:true}
)
module.exports=mongoose.model('Note',noteSchema);