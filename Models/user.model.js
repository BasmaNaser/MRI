const mongoose=require('mongoose');

const userSchema=new mongoose.Schema(
{
    username:{type:String,required:true,minlength:3},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:8},
    phone:{type:String},
    address:{type:String},
    gender:{
        type:String,
        enum:['Male','Female','Other']
    },
    role:{
        type:String,
        enum:['Patient','Doctor'],
        default:'Patient'
    },
    profileImage:{
        type:String,
        default:'https://publichealth.wincoil.gov/wp-content/uploads/2022/10/blank-profile-photo.jpg'
    }
},
{timestamps:true}
);

module.exports= mongoose.model('User',userSchema);