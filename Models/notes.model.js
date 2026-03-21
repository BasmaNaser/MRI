const mongoose=require('mongoose');

const noteSchema=new mongoose.Schema(
    {
        mriscan:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'MriScan'
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