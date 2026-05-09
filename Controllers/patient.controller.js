const Doctor = require('../Models/doctor.model');
const Patient = require('../Models/patient.model');
const MriScan = require('../Models/mriscan.model');
const Report = require('../Models/report.model');
const Tumortype = require('../Models/tumorType.model');
const User=require('../Models/user.model')
const Note = require('../Models/notes.model');
const path = require('path');
const comparePassword = require('../utils/comparePassword');
const Hashedpassword = require('../utils/HashedPassword');
const { validationResult } = require('express-validator');

async function getProfileController(req, res) {
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

async function getAllDoctorsController(req, res) {
    try {
        const { search, specialty } = req.query;
        const filter = {};
        if (specialty) {
            filter.specialization = { $regex: specialty, $options: 'i' };
        }

        let doctors = await Doctor.find(filter).populate({
            path: 'user',
            select: 'username profileImage'
        }).select('specialization experienceYears workplace');

        if (search) {
            doctors = doctors.filter(doc =>
                doc.user && doc.user.username.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (doctors.length === 0)
            return res.status(404).json({
                success: false,
                message: 'Doctors Not Found'
            });
        const currentPatient = await Patient.findOne({ user: req.user._id });
        const results = await Promise.all(doctors.map(async doc => {
            const patientsCount = await Patient.countDocuments({ assigneddoctor: doc._id });
            return {
                id: doc._id,
                name: doc.user.username,
                profileImage: doc.user.profileImage,
                specialization: doc.specialization,
                experienceYears: doc.experienceYears,
                workplace: doc.workplace,
                patientsCount: patientsCount,
                isFollowing: currentPatient?.assigneddoctor?.toString() === doc._id.toString()
            };
        }))

        res.status(200).json(
            {
                success: true,
                count: results.length,
                data: results
            }
        );
    } catch (error) {
        next(error);
    }

}

async function logoutController(req, res) {
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

async function followDoctorController(req, res) {
    try {
        const { doctorId } = req.body;
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }
        const doctorExists = await Doctor.findById(doctorId);
        if (!doctorExists) {
            return res.status(404).json({
                success: false,
                message: 'This doctor does not exist or has been removed'
            });
        }
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }
        if (patient.assigneddoctor) {
            const currentDoctorId = patient.assigneddoctor.toString();
            const newDoctorId = doctorId.toString();

            if (currentDoctorId === newDoctorId) {
                patient.assigneddoctor = null;
                await patient.save();

                return res.status(200).json({
                    success: true,
                    message: 'Unfollowed successfully',
                    isFollowing: false
                });
            }
        }
        patient.assigneddoctor = doctorId;
        await patient.save();
        res.status(200).json(
            {
                success: true,
                message: 'Doctor assigned successfully',
                isFollowing: true
            }
        )

    } catch (error) {
        next(error)
    }
}

async function getRecentReportsController(req, res) {
    try {
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        // const reports= await Report.find({patient:user._id}).sort({ reportDate: -1 })
        // .limit(5).populate('tumorName','tumorName')
        // .populate(
        //     {
        //         path:'doctor',
        //         populate:
        //         {
        //             path:'user',
        //             select:'username email'
        //         }
        //     }
        // );
        const reports = await Report.find({ patient: patient._id }).populate('tumorName', 'tumorName')
            .select('reportDate confidenceScore tumorName reportFile tumorDetected').limit(5);
        if (reports.length === 0) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'No Reports Found'
                }
            )
        }
        res.status(200).json(
            {
                success: true,
                data: reports.map(r => ({
                    id: r._id,
                    date: r.reportDate,
                    tumorType: r.tumorName ? r.tumorName.tumorName : (r.tumorDetected ? "Unknown Tumor" : "Normal"),
                    confidence: r.confidenceScore != null ? r.confidenceScore + "%" : "--",
                    file: r.reportFile

                }))
            }
        )
    } catch (error) {
        next(error)
    }
}


async function getDashboardSummaryController(req, res) {
    try {
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id }).populate(
            {
                path: 'assigneddoctor',
                populate:
                {
                    path: 'user',
                    select: 'username email'
                }
            }
        );
        const scans = await MriScan.find({ patient: patient._id }).sort({ scanDate: -1 });
        const pendingScans = scans.filter(scan => scan.status === 'Pending');
        const reviewedScans = scans.filter(scan => scan.status === 'Reviewed');
        const reports = await Report.find({ patient: patient._id }).select('confidenceScore');
        const latestScan = scans[0] || null;

        let averageAccuracy = null;
        if (reports.length > 0) {
            const total = reports.reduce((sum, r) => sum + (r.confidenceScore || 0), 0);
            averageAccuracy = (total / reports.length).toFixed(1) + "%";
        }

        res.status(200).json(
            {
                success: true,
                data: {
                    totalScans: scans.length,
                    pendingScans: pendingScans.length,
                    reviewedScans: reviewedScans.length,
                    lastUpdated: latestScan ? latestScan.scanDate : null,
                    totalAccuracy: averageAccuracy,
                    assignedDoctor: patient.assigneddoctor ?
                        {
                            id: patient.assigneddoctor._id,
                            name: patient.assigneddoctor.user.username,
                            email: patient.assigneddoctor.user.email,
                            specialization: patient.assigneddoctor.specialization || null,
                            experienceYears: patient.assigneddoctor.experienceYears || null,
                            workplace: patient.assigneddoctor.workplace || null,
                        }
                        : null
                }
            }
        )

    } catch (error) {
        next(error);
    }
}

async function getLatestNotesController(req, res) {
    try {
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        const mriscan = await MriScan.find({ patient: patient._id });
        const scanIds = mriscan.map(scan => scan._id);
        const notes = await Note.find({ mriscan: { $in: scanIds } }).sort({ createdAt: -1 })
            .limit(5).populate(
                {
                    path: 'mriscan',
                    select: 'scanImage status',
                    populate: {
                        path: 'doctor',
                        populate: { path: 'user', select: 'username email' }
                    }
                });
        if (notes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notes Not Found'
            });
        }

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
}

async function getAllTumorsTypeController(req, res) {
    try {
        const tumors = await Tumortype.find().sort({ tumorName: 1 });
        if (!tumors.length) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'No Tumor Found'
                }
            )
        }
        res.status(200).json(
            {
                success: true,
                data: tumors.map(t => (
                    {
                        id: t._id,
                        name: t.tumorName
                    }
                ))
            }
        )
    } catch (error) {
        next(error)
    }

}

async function getAllReportsController(req, res) {
    try {
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        const { search, tumorName } = req.query;
        const query = { patient: patient._id };
        if (tumorName) {
            query.tumorName = tumorName
        }
        const reports = await Report.find(query).sort({ reportDate: -1 })
            .populate('tumorName', 'tumorName')
            .select('reportDate tumorName confidenceScore reportFile tumorDetected')
            .lean();
        if (reports.length === 0) {
            return res.status(404).json(
                {
                    success: false,
                    message: 'No Reports Found'
                }
            )
        }
        for (let r of reports) {
            if(search){
            const notes = await Note.find({ mriscan: r.scan, note: { $regex: search, $options: 'i' } })
                .select('note createdAt').sort({ createdAt: -1 });
            r.notes = notes;
        }}
        res.status(200).json(
            {
                success: true,
                data: reports.map(r => ({
                    id: r._id,
                    date: r.reportDate,
                    tumorType: r.tumorName ? r.tumorName.tumorName : (r.tumorDetected ? "Unknown Tumor" : "Normal"),
                    confidence: r.confidenceScore != null ? r.confidenceScore + "%" : "--",
                    notes: r.notes,
                    file: r.reportFile

                }))
            }
        )
    } catch (error) {
        next(error)
    }
}
async function uploadScanController(req, res) {
    try {
        const user = req.user;
        const file = req.file;
        const patient = await Patient.findOne({ user: user._id }).populate('assigneddoctor');
        const doctor = patient.assigneddoctor;
        if (!file) {
            return res.status(400).json({ success: false, message: 'Scan image is required' });
        }
        const newScan = await MriScan.create({
            scanImage: file.path,
            patient: patient._id,
            doctor: doctor ? doctor._id : null,
            status: 'Pending',
        });
        res.status(201).json({
            success: true,
            data: newScan
        });
    } catch (error) {
        next(error);
    }

}

async function getScanResultController(req, res) {
    try {
        const { id } = req.params;
        const scan = await MriScan.findById(id)
            .populate({
                path: 'doctor',
                populate: {
                    path: 'user',
                    select: 'username email'
                }
            }).select('scanImage status scanDate')
            .lean();
        if (!scan)
            return res.status(404).json(
                {
                    success: false,
                    message: 'Scan Not Found'
                });
        const reports = await Report.find({ scan: scan._id })
            .populate('tumorName', 'tumorName')
            .populate('doctor', 'user');

        res.status(200).json(
            {
                success: true,
                data: { scan, reports }
            }
        )
    } catch (error) {
        next(error);
    }
}

async function downloadReportController(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;

        const patient = await Patient.findOne({ user: user._id });

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.patient.toString() !== patient._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!report.reportFile) {
            return res.status(404).json({
                success: false,
                message: 'Report file not found'
            });
        }

        const filePath = path.resolve(report.reportFile);

        return res.download(filePath);

    } catch (error) {
        next(error);
    }
}

async function deleteReportController(req, res) {
    try {
        const { id } = req.params;
        const report = await Report.findByIdAndDelete(id);
        if (!report)
            return res.status(404).json(
                {
                    success: false,
                    message: 'Report Not Found'
                });
        res.status(200).json(
            {
                success: true,
                message: 'Report Deleted Successfuly'
            }
        )
    } catch (error) {
        next(error);
    }
}

async function getLatestRecommendationController(req, res) {
    try {
        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const latestReport = await Report.findOne({ patient: patient._id })
            .populate('tumorName', 'tumorName')
            .sort({ reportDate: -1 })
            .select('tumorName confidenceScore recommendation reportDate tumorDetected')
            .lean(); // لو حابة نتجنب مشاكل الـ mongoose document

        if (!latestReport) {
            return res.status(404).json({ success: false, message: 'No Recommendations Found' });
        }

        return res.status(200).json({
            success: true,
            data: {
                tumorType: latestReport.tumorName ? latestReport.tumorName.tumorName : (latestReport.tumorDetected ? "Unknown Tumor" : "Normal"),
                confidence: latestReport.confidenceScore != null ? latestReport.confidenceScore + "%" : "--",
                recommendation: latestReport.recommendation || null,
                recommendationDate: latestReport.reportDate
            }
        });
    } catch (error) {
        next(error); // دلوقتي next موجود
    }
}

async function downloadLatestRecommendationController(req, res, next) {
    try {

        const user = req.user;
        const patient = await Patient.findOne({ user: user._id });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const latestReport = await Report.findOne({ patient: patient._id })
            .sort({ reportDate: -1 });
        if (!latestReport || !latestReport.reportFile) {
            return res.status(404).json({ success: false, message: 'No report file found' });
        }

        const filePath = path.resolve(latestReport.reportFile);
        return res.download(filePath);



    } catch (error) {
        next(error);
    }
}
async function uploadPatientImageController(req, res) {
    try {
        const user = req.user;
        if (!req.file)
            return res.status(400).json({ success: false, message: 'image is required !' });

        user.profileImage = req.file.path;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            data: { profileImage: user.profileImage }
        });
    } catch (error) {
        next(error);
    }

}

async function changePasswordController(req, res)
{
    try
    {
        const user = req.user;
        const patient = await User.findById(user._id);

        const errors = validationResult(req);

        if (!errors.isEmpty())
        {
            return res.status(400).json(
            {
                success:false,
                errors: errors.array().map(e => e.msg)
            });
        }

        const { currentPassword, newPassword } = req.body;

        const isMatch = await comparePassword(currentPassword, patient.password);

        if (!isMatch)
        {
            return res.status(400).json(
            {
                success:false,
                message:'Current password is incorrect'
            });
        }

        const hashedPass = await Hashedpassword(newPassword);

        user.password = hashedPass;

        await user.save();

        return res.status(200).json(
        {
            success:true,
            message:'Password Changed Successfully'
        });

    }
    catch(error)
    {
        next(error);
    }
}

async function updateProfileController(req, res, next) {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(e => e.msg)
            });
        }
        const user = req.user;
        const { username, email, doctorId } = req.body;

        const patient = await Patient.findOne({ user: user._id });

        if (username) {
            user.username = username;
        }

        if (email) {
            user.email = email;
        }

        if (doctorId) {
            patient.assigneddoctor = doctorId;
            await patient.save();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                username: user.username,
                email: user.email,
                assignedDoctor: patient.assigneddoctor
            }
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { getProfileController, getAllDoctorsController, logoutController, followDoctorController, getRecentReportsController, getDashboardSummaryController, getLatestNotesController, getAllTumorsTypeController, getAllReportsController, uploadScanController, getScanResultController, downloadReportController, deleteReportController, getLatestRecommendationController, downloadLatestRecommendationController, uploadPatientImageController, changePasswordController, updateProfileController }
