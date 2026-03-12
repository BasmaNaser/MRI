const User = require('../Models/user.model');
const Hashedpassword = require('../utils/HashedPassword');
const { createAccessToken, createAutoToken, createRefreshToken, createResetToken } = require('../utils/tokens');
const comparePassword = require('../utils/comparePassword')
const {sendTestEmail,sendEmailRestPassword} = require('../utils/sendmail');
const Patient=require('../Models/patient.model');
const Doctor= require('../Models/doctor.model')
const jwt= require('jsonwebtoken');
const patientModel = require('../Models/patient.model');
require('dotenv').config();
async function signupController(req, res) {
    try {
        const { username, email, password, confirmedPassword, role } = req.body;
        if (!username || !email || !password || !confirmedPassword || !role)
            return res.status(400).json('All Data Required!');
        const emailExist = await User.findOne({ email });
        if (emailExist)
            return res.status(409).json({ message: `User Already Exists !` });
        if (password !== confirmedPassword)
            return res.status(400).json({ message: 'Passwords do not match!' });
        // try {
        //     const loginLink = `${process.env.FRONTEND_URL}/login?token=${autoLoginToken}`;
        //     const subject= 'Welcome to 3D MRI Brain';
        //     const htmlMessage = `
    // <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #ddd; padding: 20px; border-radius: 10px;">
    //     <h2 style="color: #1a73e8;">Welcome, ${username}!</h2>
    //     <p>Thank you for registering at <strong>MRI Brain Storm</strong>.</p>
    //     <p>Your account has been created successfully and you can login now.</p>
    //     <a href="${loginLink}" style="display:inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
    //         Login Now
    //     </a>
    // </div>
    // `;
        //     await sendTestEmail(email, username, loginLink,subject,html);
        // } catch (err) {
        //     return res.status(400).json({ message: 'Invalid or unreachable email!' });
        // }
        const HashPass = await Hashedpassword(password);
        const newUser = await User.create(
            {
                username,
                email,
                password: HashPass,
                role
            });
            if(role==='Patient')
                await Patient.create({user:newUser._id})
            else if(role==='Doctor')
                await Doctor.create({user:newUser._id})

        const autoToken = createAutoToken(newUser._id, role);
        const userData = await User.find({ email }).select('username email role -_id');
        res.status(201).json({
            Success: true, message: `${newUser.role} Added Successfuly`,
            data: userData,
            token: autoToken
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
async function loginController(req, res) {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password)
            return res.status(400).json({ message: 'Email or Username and Password Required!' });
        let user = await User.findOne({ email:emailOrUsername });
        if (!user)
            user=await User.findOne({username:emailOrUsername});
        if (!user)
            return res.status(401).json({ message: 'Invalid Username Or Password' });
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid Username Or Password' });
        const accessToken = createAccessToken(user._id, user.role);
        const refreshToken = createRefreshToken(user._id, user.role);
        res.cookie('refreshToken', refreshToken,
            {
                httpOnly: true
            }
        );
        res.status(200).json(
            {
                success: true,
                message: 'Login Successfuly',
                data: accessToken,
                role: user.role
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
}
async function tokenLoginController(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ success: false, message: 'Token missing!' });
        const token = authHeader.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decode.user_id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User Not Found' });
        const accessToken = createAccessToken(user._id, user.role);
        
        res.status(200).json(
            {
                success: true,
                message: 'Token valid. Auto-login successful!',
                data: accessToken,
                role: user.role
            }
        )
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token!' });

    }
}

async function refreshTokenController(req,res)
{
try {
        const token = req.cookies.refreshToken;
        if(!token)
            return res.status(401).json({success:false,message:'Refresh Token missing !'});
        const decode=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET) ;
        const user= await User.findById(decode.user_id);
        if(!user)
            return res.status(404).json({success:false,message:'User Not Found'});
        const accessToken=createAccessToken(user._id,user.role);
        const refreshToken=createRefreshToken(user._id,user.role);
        res.cookie('refreshToken',refreshToken,
            {
                httpOnly:true
            }
        );
        res.status(200).json(
            {
                success:true,
                message:'Token refreshed Successfuly',
                data:accessToken,
                role:user.role
            }
        )
} catch (error) {
    res.status(500).json({message:'Invalid or expired refresh token'});
}
}
async function forgetPasswordController(req,res)
{
    try {
        const {email}=req.body;
        if(!email)
            return res.status(400).json({success:false,message:'email required !'});
        const user= await User.findOne({email});
        if(!user)
            return res.status(200).json({message:'Reset email Sent {if it Exists}!'});
        const resetToken = createResetToken(user._id,user.role);
        //const resetlink=`${process.env.FRONTEND_URL}/reset-password/${resettoken}`
    
        // const info = await sendEmailRestPassword(email,user.username,resetlink,'Reset your password');
        res.status(200).json({success:true,message:'Reset email Sent {if it Exists}!',data:resetToken});
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

async function resetPasswordController(req,res)
{
    try {
        let token=req.params.token;
        const {password,confirmedPassword}=req.body;
        if(!token||!password||!confirmedPassword)
            return res.status(400).json({success:false,message:'All field Required'});
        if(password!==confirmedPassword)
            return res.status(400).json({success:false,message:`Password don't match`});
        const decode = jwt.verify(token,process.env.RESET_TOKEN_SECRET);
        const user = await User.findById(decode.user_id);
        if(!user)
            return res.status(404).json({success:false,message:'User Not Found!'})
        const HashedPass= await Hashedpassword(password);
        user.password=HashedPass;
        user.save();
        res.status(200).json({success:true,message:'Password Updated Successfuly ✅',data:user.role},)
        token=null;
    } catch (error) {
        res.status(401).json({success:false,message:error.message})
    }
}
async function getAllUsers(req,res)
{
    const users=await User.find();
    if(!users)
        return res.status(404).json({message:'No Users Found'});
    res.json({message:'There User',data:users})
}

module.exports = { signupController, loginController, tokenLoginController,refreshTokenController ,forgetPasswordController,resetPasswordController,getAllUsers};
