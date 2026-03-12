const mongoose=require('mongoose');

const recommendationSchema=new mongoose.Schema(
{
    subject:{
        type:String,
        required:true
    },

    securityLevel:{
        type:String
    },

    tumorName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tumortype'
    },

    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

},
{timestamps:true}
)

module.exports=mongoose.model('Recommendation',recommendationSchema);