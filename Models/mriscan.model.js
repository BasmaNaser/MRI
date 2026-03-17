const mongoose = require('mongoose');

const mriScanSchema = new mongoose.Schema(
{
    scanImage:{
        type:String,
        required:true
    },

    scanDate:{
        type:Date,
        default:Date.now
    },

    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient',
        required:true
    },

    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor'
    },

    status:{
        type:String,
        enum:['Pending','Reviewed'],
        default:'Pending'
    }

},
{timestamps:true}
);

module.exports = mongoose.model('MriScan',mriScanSchema);