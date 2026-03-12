const mongoose=require('mongoose');

const tumorTypeSchema=mongoose.Schema(
{
    tumorName:{
        type:String,
        required:true,
        unique:true
    }
})

module.exports=mongoose.model('Tumortype',tumorTypeSchema);