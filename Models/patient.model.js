const mongoose=require('mongoose');

const patientSchema=new mongoose.Schema(
    {
        user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        assigneddoctor:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Doctor',
        },
        status:
        {
            type:String,
            default:'Pending'
        },
        
    },
    {timestamps:true}
)
module.exports=mongoose.model('Patient',patientSchema);
