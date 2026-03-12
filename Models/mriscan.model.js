const mongoose=require('mongoose');

const mriScanSchema=mongoose.Schema(
{
    scanImage:{
        type:String,
        required:true
    },

    scanDate:{
        type:Date,
        default:Date.now
    },

    confidenceScore:{
        type:Number
    },

    result:{
        type:String,
        enum:['Tumor','Normal']
    },

    reportFile:String,

    reportDate:Date,

    tumorName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tumortype'
    },

    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor'
    }

},
{timestamps:true}
)

module.exports=mongoose.model('Mriscan',mriScanSchema);