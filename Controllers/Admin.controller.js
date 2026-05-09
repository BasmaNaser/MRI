const Admin = require('../Models/admin.model');
const User = require('../Models/user.model');
const Doctor= require('../Models/doctor.model');
const Patient=require('../Models/patient.model');
const Report = require('../Models/report.model');
const MriScan = require('../Models/mriscan.model');
const bcrypt = require('bcrypt');
const Hashedpassword = require('../utils/HashedPassword');
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const { validationResult } = require('express-validator');

const getDoctors = async (req, res, next) => {
    try {
        const { search, status } = req.query;

        const Filter = {};
        if (status) Filter.status = status;

        const doctors = await Doctor.find(Filter)
            .populate({
                path: 'user',
                select: 'username email role profileImage',
                match: search ? {
                    $or: [
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                } : {}
            })
            .select('specialization status');

        res.status(200).json({
            success: true,
            data: doctors
        });

    } catch (err) {
        next(err);
    }
};

const createDoctor = async (req, res, next) => {
    try {
        const { username, email, password, specialization } = req.body;

        if (!username || !email || !password || !specialization) {
            return res.status(400).json({
                success: false,
                message: 'All data required!'
            });
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(409).json({
                success: false,
                message: 'Doctor already exists!'
            });
        }

        const hashPass = await Hashedpassword(password);

        
        const newUser = await User.create({
            username,
            email,
            password: hashPass,
            role: 'Doctor' 
        });

        
        const newDoctor = await Doctor.create({
            user: newUser._id,
            specialization, 
            status: 'active' 
        });

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                specialization: newDoctor.specialization,
                role: newUser.role,
                status: newDoctor.status
            }
        });

    } catch (error) {
        next(error);
    }
};

const updateDoctor = async (req, res, next) => {
    try {
        const { username, email, specialization } = req.body;
        const userId = req.params.id;

        const user = await User.findOneAndUpdate(
            { _id: userId, role: 'Doctor' },
            {
                ...(username && { username }),
                ...(email && { email })
            },
            { returnDocument: 'after', select: 'username email role' }
        );

        if (!user) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const doctor = await Doctor.findOneAndUpdate(
            { user: userId },
            {
                ...(specialization && { specialization })
            },
            { returnDocument: 'after', select: 'specialization status' }
        );

        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                specialization: doctor?.specialization || 'Not Specified',
                status: doctor?.status || 'active'
            }
        });

    } catch (error) {
        next(error);
    }
};

const updateDoctorStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const doctor = await Doctor.findOneAndUpdate(
            { _id: req.params.id, role: 'Doctor' },
            { status },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json({ success: true, data: doctor });

    } catch (error) {
        next(error);
    }
};

const deleteDoctor = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findOneAndDelete({ _id: userId, role: 'Doctor' });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        await Doctor.findOneAndDelete({ user: userId });

        res.json({
            success: true,
            message: 'Doctor deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

//
const getPatients = async (req, res, next) => {
    try {
        const { search } = req.query;

        let filter = { role: 'Patient' };

        if (search) {
            filter.username = { $regex: search, $options: 'i' };
        }

       const patients = await User.aggregate([

            { $match: filter },

            {
                $project: {
                    password: 0
                }
            },

            // connect with patient model
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'patient'
                }
            },

            // array → object
            {
                $unwind: {
                    path: '$patient',
                    preserveNullAndEmptyArrays: true
                }
            },

            // connect with MriScan
            {
                $lookup: {
                    from: 'mriscans',
                    localField: 'patient._id',
                    foreignField: 'patient',
                    as: 'scans'
                }
            },
            {
                $addFields: {
                    lastScan: { $max: '$scans.scanDate' }
                }
            },

            {
                $project: {
                    scans: 0,
                    patient: 0
                }
            }

        ]);

        res.json({
            success: true,
            data: patients
        });

    } catch (error) {
        next(error);
    }
};

const viewPatient = async (req, res, next) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: 'Patient'
        }).select('-password').select('-password -__v');

        if (!user) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const patient = await Patient.findOne({ user: user._id });

        if (!patient) {
            return res.json({
                success: true,
                data: { ...user.toObject(), lastScan: null }
            });
        }

        const lastScan = await MriScan.findOne({
            patient: patient._id
        })
        .sort({ createdAt: -1 })
        .populate('doctor', 'username email').select('-scanImage');

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                lastScan
            }
        });

    } catch (error) {
        next(error);
    }
};

const getReports = async (req, res, next) => {
    try {
        const { doctorId, patientId } = req.query;

        let filter = {};

        if (doctorId) filter.doctor= doctorId;
        if (patientId) filter.patient= patientId;
const reports = await Report.find(filter)
  // populate patient -> patient.user -> username
  .populate({
    path: 'patient',
    populate: { path: 'user', select: 'username' }
  })
  // populate doctor -> doctor.user -> username
  .populate({
    path: 'doctor',
    populate: { path: 'user', select: 'username' }
  })
  // populate tumor type
  .populate('tumorName')
  .populate('scan','scanDate')
  .sort({ createdAt: -1 }).exec();;
        res.status(200).json({
            success: true,
            data: reports
        });

    } catch (error) {
        next(error);
    }
};

//
const getProfile=(req,res,next)=>{
     try {
        const user = req.user;

        res.status(200).json(
            {
                success: true,
                data:
                {
                    username: user.username,
                    email: user.email,
                    image: user.profileImage
                }
            }
        )

    } catch (error) {
        next(error);
    }
}
const logout=async(req,res,next)=>{
    try {
        res.clearCookie('refreshToken', { httpOnly: true });
        res.status(200).json({
            success: true,
            message: 'Logged Out Successfully'
        });
    } catch (error) {
        next(error);
    }

}

const getDashboard = async (req, res, next) => {
    try {
    
        const [
            totalDoctors,
            totalPatients,
            scansAnalyzed,
            accuracyData,
            monthlyActivity,
            tumorTypes
        ] = await Promise.all([
            User.countDocuments({ role: 'Doctor' }),
            User.countDocuments({ role: 'Patient' }),
            MriScan.countDocuments({ status: 'Reviewed' }),
            Report.aggregate([
                {
                    $group: {
                        _id: null,
                        avgConfidence: { $avg: "$confidenceScore" }
                    }
                }
            ]),

            MriScan.aggregate([
                {
                    $group: {
                        _id: { $month: "$scanDate" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),

            Report.aggregate(
                [
    {
        $group: {
            _id: "$tumorName",
            count: { $sum: 1 }
        }
    },
    {
        $lookup: {
            from: "tumortypes", 
            localField: "_id",
            foreignField: "_id",
            as: "tumor"
        }
    },
    { $unwind: { path: "$tumor", preserveNullAndEmptyArrays: true } },
    {
        $project: {
            _id: 0,
            tumorName: { $ifNull: ["$tumor.tumorName", "Normal"] }, 
            count: 1
        }
    }
])]);

        const aiAccuracyAvg = accuracyData[0]?.avgConfidence || 0;

        res.status(200).json({
            success: true,
            data: {
                totalDoctors,
                totalPatients,
                scansAnalyzed,
                aiAccuracyAvg: aiAccuracyAvg.toFixed(1) + "%",
                monthlyActivity,
                tumorTypes
            }
        });

    } catch (error) {
        next(error);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await Admin.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        next(err);
    }
};

const updateAdminProfile=async(req,res,next)=>{
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(e => e.msg)
            });
        }

        const { username, email } = req.body;
        const admin = await Admin.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        if (username) admin.fullName = username;
        if (email) admin.email = email;

        await admin.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                fullName: admin.fullName,
                email: admin.email
            }
        });

    } catch (error) {
        next(error);
    }
};
module.exports={updateAdminProfile,changePassword,getDoctors,createDoctor,getDashboard,viewPatient,getPatients
    ,getProfile,getReports,logout,deleteDoctor,updateDoctor,updateDoctorStatus
}
