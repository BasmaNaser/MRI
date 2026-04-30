const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
{
    scan:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MriScan'
    },

    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient',
        required:true
    },

    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },

    tumorDetected:{
        type:Boolean
    },

    confidenceScore:{
        type:Number
    },

    tumorName:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tumortype'
    },

    originalScan:{
        type:String
    },

    segmentedScan:{
        type:String
    },

    aiRecommendation:{
        type:String
    },

    recommendation:{
        type:String
    },

    reportFile:{
        type:String
    },

    doctorComment:{
        type:String
    },

    status:{
        type:String,
        default:'Pending Review'
    },

    reportDate:{
        type:Date,
        default:Date.now
    }

},
{timestamps:true}
);

module.exports = mongoose.model('Report',reportSchema);
