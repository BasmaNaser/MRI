const Doctor = require("../Models/doctor.model");
const Patient = require("../Models/patient.model");
const Report = require("../Models/report.model");
const MriScan = require("../Models/mriscan.model");
const Note = require("../Models/notes.model");
const User = require("../Models/user.model");
const bcrypt = require("bcrypt");
const Hashedpassword = require("../utils/HashedPassword");

// ─── Helper: normalise a confidenceScore coming from AI (0-1 decimal)
//            or from doctor input (1-100 range) → always returns "xx.x%" or "--"
function formatConfidence(score) {
  if (score == null) return "--";
  // If the AI model stores 0-1 range, multiply by 100
  const pct = score <= 1 ? (score * 100) : score;
  return pct.toFixed(1) + "%";
}

// ─── Helper: decide whether a tumor was detected.
//     tumorName populated object whose .tumorName === "Normal" → no tumor
//     tumorName populated object with any other name            → tumor detected
//     tumorName is null/undefined                              → unknown (treat as no tumor)
function isTumorDetected(populatedTumorName) {
  if (!populatedTumorName || !populatedTumorName.tumorName) return false;
  return populatedTumorName.tumorName.toLowerCase() !== "normal";
}

// ─── Helper: resolve confidence based on 3 cases:
//   1. No tumorName data at all (null/undefined) → null  (no scan data yet)
//   2. tumorName = "Normal" (explicitly) → "100.0%"  (scan done, no tumor found)
//   3. tumorName = anything else → AI score from DB   (tumor detected)
function resolveConfidence(score, populatedTumorName) {
  // No populate result → no scan data → do NOT assume Normal
  if (!populatedTumorName || !populatedTumorName.tumorName) return null;
  if (populatedTumorName.tumorName.toLowerCase() === "normal") return "100.0%";
  // Tumor detected: return real AI confidence (could be null if not stored)
  return score != null ? formatConfidence(score) : null;
}

// ─── Helper: auto-assign report status based on AI confidence score
//   confidenceScore null  → 'Pending Review'   (no AI result yet — initial state)
//   confidenceScore < 50% → 'Pending Reviewed' (low confidence → urgent priority for doctor)
//   confidenceScore ≥ 50% → 'Reviewed'         (decent confidence → doctor viewed, awaiting recommendation)
function resolveReportStatus(confidenceScore) {
  if (confidenceScore == null) return 'Pending Review';
  // Normalise: AI may store 0–1 or 0–100
  const pct = confidenceScore <= 1 ? confidenceScore * 100 : confidenceScore;
  return pct < 50 ? 'Pending Reviewed' : 'Reviewed';
}

exports.getDashboardData = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    // Count patients assigned to this doctor
    const patientsCount = await Patient.countDocuments({
      assigneddoctor: doctorId,
    });

    // Fetch all reports for stats & chart
    const allReports = await Report.find({ doctor: doctorId })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "username",
        },
      })
      .populate("tumorName", "tumorName")
      .sort({ reportDate: -1 });

    let tumorsDetected = 0;
    let totalConfidence = 0;
    let accuracyCount = 0;
    const tumorDistribution = {};

    allReports.forEach((report) => {
      if (report.tumorDetected) {
        tumorsDetected++;
      }
      if (report.confidenceScore != null) {
        totalConfidence += report.confidenceScore;
        accuracyCount++;
      }

      let tName =
        report.tumorName && report.tumorName.tumorName
          ? report.tumorName.tumorName
          : "Normal";
      tumorDistribution[tName] = (tumorDistribution[tName] || 0) + 1;
    });

    const averageAccuracy =
      accuracyCount > 0
        ? formatConfidence(totalConfidence / accuracyCount)
        : "0%";
    const lastUpdated = allReports.length > 0 ? allReports[0].reportDate : null;

    // Recent 5 reports
    const recentReportsRaw = allReports.slice(0, 5);
    const recentReports = recentReportsRaw.map((report) => ({
      id: report._id,
      patientName:
        report.patient && report.patient.user
          ? report.patient.user.username
          : "Unknown",
      date: report.reportDate,
      tumorType:
        report.tumorName && report.tumorName.tumorName
          ? report.tumorName.tumorName
          : "Normal",
      tumorDetected: isTumorDetected(report.tumorName),
      confidence: resolveConfidence(report.confidenceScore, report.tumorName),
      doctorNotes:
        report.doctorComment || report.recommendation || "No abnormalities.",
      reportUrl: report.reportFile,
    }));

    res.status(200).json({
      success: true,
      data: {
        patientsCount,
        tumorsDetected,
        averageAccuracy,
        lastUpdated,
        tumorTypeDistribution: tumorDistribution,
        recentReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Patients List
exports.getAllPatients = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { search, status, tumorType } = req.query;

    let query = { assigneddoctor: doctorId };
    if (status) query.status = status;

    const patients = await Patient.find(query).populate("user").select("-__v");

    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const userObj = patient.user;
        if (!userObj) return null; // skipped

        // if search enabled, filter by username
        if (
          search &&
          !userObj.username.toLowerCase().includes(search.toLowerCase())
        ) {
          return null;
        }

        const recentReport = await Report.findOne({ patient: patient._id })
          .populate("tumorName")
          .populate("scan")
          .sort({ reportDate: -1 });

        const latestScan = await MriScan.findOne({ patient: patient._id }).sort(
          { scanDate: -1 },
        );

        let tType = null;
        let conf = null;
        let scanDate = null;

        if (recentReport) {
          // Only show "Normal" if tumorName is explicitly "Normal" in DB
          tType =
            recentReport.tumorName && recentReport.tumorName.tumorName
              ? recentReport.tumorName.tumorName
              : null;
          conf = resolveConfidence(recentReport.confidenceScore, recentReport.tumorName);
          scanDate = recentReport.reportDate;
        } else if (latestScan) {
          tType = "Pending analysis";
          scanDate = latestScan.scanDate;
        }

        return {
          id: patient._id,
          patientName: userObj.username,
          profileImage: userObj.profileImage || null,
          age: userObj.age || 0, // Fallback if age wasn't migrated
          status: patient.status,
          tumorType: tType,
          confidence: conf,
          scanDate: scanDate,
          scan: latestScan ? latestScan.scanImage : null,
        };
      }),
    );

    let finalData = enrichedPatients.filter((p) => p !== null);
    if (tumorType && tumorType !== "All Tumor types") {
      finalData = finalData.filter(
        (p) =>
          p.tumorType && p.tumorType.toLowerCase() === tumorType.toLowerCase(),
      );
    }

    res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2.5 Add New Patient
exports.addPatient = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { username, name, email, password, phone, gender, status } = req.body;

    const finalUsername = username || name;

    if (!finalUsername || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Patient name, email, and password are required",
        });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await Hashedpassword(password);
      user = new User({
        username: finalUsername,
        email,
        password: hashedPassword,
        phone,
        gender,
        role: "Patient",
      });
      await user.save();
    }

    const newPatient = new Patient({
      user: user._id,
      assigneddoctor: doctorId,
      status: status || "Pending",
    });

    await newPatient.save();

    res.status(201).json({
      success: true,
      message: "Patient added successfully",
      data: newPatient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. View Details Patient
exports.getPatientDetails = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const doctorId = req.doctor._id;

    const patient = await Patient.findOne({
      _id: patientId,
      assigneddoctor: doctorId,
    })
      .populate("user")
      .select("-__v");

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found or unauthorized" });
    }

    const recentReport = await Report.findOne({
      patient: patientId,
      doctor: doctorId,
    })
      .populate("tumorName")
      .populate("scan")
      .sort({ reportDate: -1 });

    const latestScan = await MriScan.findOne({ patient: patientId }).sort({
      scanDate: -1,
    });

    res.status(200).json({
      success: true,
      data: {
        patientInfo: {
          id: `#BRN${patient._id.toString().slice(-4).toUpperCase()}`,
          name: patient.user ? patient.user.username : "Unknown",
          email: patient.user ? patient.user.email : null,
          phone: patient.user ? patient.user.phone : null,
          gender: patient.user ? patient.user.gender : null,
          profileImage: patient.user ? patient.user.profileImage : null,
          age: patient.user ? patient.user.age : null,
          lastScan: recentReport
            ? recentReport.reportDate
            : latestScan
              ? latestScan.scanDate
              : null,
        },
        mriScanAnalysis: {
          originalScan: recentReport
            ? recentReport.originalScan
            : latestScan
              ? latestScan.scanImage
              : "Not available",
          segmentedScan: recentReport
            ? recentReport.segmentedScan
            : "Not available",
        },
        aiAnalysisResult: {
          tumorType: recentReport
            ? recentReport.tumorName && recentReport.tumorName.tumorName
              ? recentReport.tumorName.tumorName
              : "Normal"
            : "No Data",
          tumorDetected: recentReport ? isTumorDetected(recentReport.tumorName) : false,
          confidence: recentReport ? resolveConfidence(recentReport.confidenceScore, recentReport.tumorName) : null,
          status: patient.status,
          description: recentReport
            ? recentReport.doctorComment || recentReport.aiRecommendation
            : "No analysis reports available.",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Reports (View reports for a patient)
exports.getPatientReports = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const doctorId = req.doctor._id;
    const { status } = req.query; // اختياري: لتصفية حسب الحالة

    const patient = await Patient.findOne({
      _id: patientId,
      assigneddoctor: doctorId,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found or unauthorized" });
    }

    // بناء query الفلتر
    const query = { patient: patientId, doctor: doctorId };
    if (status) {
      query.status = status;
    } else {
      // الافتراضي: فقط التقارير المعلقة (Pending Review)
      query.status = "Pending Review";
    }

    const reports = await Report.find(query)
      .populate("tumorName")
      .populate("scan")
      .sort({ reportDate: -1 })
      .select("-__v");

    const formattedReports = reports.map((r) => {
      const plain = r.toObject();
      // Determine tumor type name — only "Normal" if explicitly set in DB
      const tumorTypeName =
        r.tumorName && r.tumorName.tumorName
          ? r.tumorName.tumorName
          : null;

      // Flatten tumorName to string for display
      if (plain.tumorName && plain.tumorName.tumorName) {
        plain.tumorName = plain.tumorName.tumorName;
      }

      // Add formatted fields used by frontend
      plain.tumorType = tumorTypeName || null;  // null = no data, not "Normal"
      plain.tumorDetected = isTumorDetected(r.tumorName);
      plain.confidence = resolveConfidence(r.confidenceScore, r.tumorName);

      return plain;
    });

    res.status(200).json({
      success: true,
      data: formattedReports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Recommendations (Write report and pass data)
exports.createRecommendation = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const {
      recommendation,
      tumorDetected,
      originalScan,
      segmentedScan,
      confidenceScore,
      tumorName,
      reportFile,
      scan,
    } = req.body;
    const doctorId = req.doctor._id;

    const patient = await Patient.findOne({
      _id: patientId,
      assigneddoctor: doctorId,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found or unauthorized" });
    }

    // If Normal (no tumor) and no confidence provided, default to 100%
    let finalConfidence = confidenceScore != null ? Number(confidenceScore) : null;
    if (!tumorDetected && finalConfidence == null) {
      finalConfidence = 100;
    }

    // Auto-set status based on confidence:
    //   < 50%  → 'Pending Reviewed' (low confidence — high priority, needs urgent review)
    //   ≥ 50%  → 'Reviewed'         (decent confidence — doctor viewed, no recommendation yet)
    // If recommendation is provided right away → skip to 'Completed'
    const autoStatus = recommendation
      ? 'Completed'
      : resolveReportStatus(finalConfidence);

    const newReport = new Report({
      patient: patientId,
      doctor: doctorId,
      scan,
      originalScan,
      segmentedScan,
      tumorDetected,
      confidenceScore: finalConfidence,
      tumorName,
      recommendation, // standard MRI
      aiRecommendation: recommendation, // local GUI dashboard
      reportFile,
      status: autoStatus,
    });

    await newReport.save();

    // Update scan status to Reviewed if scan ID is provided
    if (scan) {
      await MriScan.findByIdAndUpdate(scan, { status: "Reviewed" });
    }

    res.status(201).json({
      success: true,
      message: "Recommendation successfully saved as a report.",
      data: newReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Profile
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    const doctor = await Doctor.findById(doctorId)
      .populate("user")
      .select("-__v");
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const responseObj = {
      _id: doctor._id,
      name: doctor.user.username,
      email: doctor.user.email,
      profileImage: doctor.user.profileImage,
      specialization: doctor.specialization,
      experienceYears: doctor.experienceYears,
      workplace: doctor.workplace,
    };

    res.status(200).json({
      success: true,
      data: responseObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6.5 Upload Profile Image
exports.uploadDoctorImage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: user not found in request.' });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Profile image is required!' });
    }

    // Build a clean relative URL path for DB storage and serving via /uploads static route
    // multer stores the absolute path in req.file.path, but we only need the relative portion
    const imagePath = `uploads/doctor/${req.file.filename}`;

    user.profileImage = imagePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage: user.profileImage },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6.6 Update Profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      specialization,
      experienceYears,
      workplace,
      phone,
      address,
      gender,
    } = req.body;
    const user = req.user;
    const doctor = req.doctor;

    // Update User fields
    if (name) user.username = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;

    // Update Doctor fields
    if (specialization) doctor.specialization = specialization;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (workplace) doctor.workplace = workplace;

    await user.save();
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: doctor._id,
        name: user.username,
        email: user.email,
        profileImage: user.profileImage,
        specialization: doctor.specialization,
        experienceYears: doctor.experienceYears,
        workplace: doctor.workplace,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Notes - Add Note
exports.addNote = async (req, res) => {
  try {
    const { patientId, mriscanId, title, note } = req.body;
    const doctorId = req.doctor._id;

    if (!note) {
      return res
        .status(400)
        .json({ success: false, message: "Note text is required" });
    }

    const newNote = new Note({
      doctor: doctorId,
      patient: patientId,
      mriscan: mriscanId,
      title,
      note,
    });

    await newNote.save();

    res.status(201).json({
      success: true,
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Notes - Get Notes
exports.getNotes = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = { doctor: req.doctor._id };
    if (patientId) {
      query.patient = patientId;
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Notes - Update Note
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, note } = req.body;

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, note },
      { new: true, runValidators: true },
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Notes - Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Profile - Change Password
exports.changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const { newPassword } = req.body;
    const user = req.user; // Provided by auth middleware

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide old and new password",
        });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect old password" });
    }

    user.password = await Hashedpassword(newPassword);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Profile - Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const userId = req.user._id;

    await Doctor.findByIdAndDelete(doctorId);
    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. Reports - Get all reports for doctor
exports.getAllReports = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { tumorType, startDate, endDate } = req.query;

    let query = { doctor: doctorId };

    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    let reports = await Report.find(query)
      .populate({
        path: "patient",
        populate: { path: "user", select: "username" },
      })
      .populate("tumorName")
      .populate("scan")
      .sort({ reportDate: -1 });

    const formattedReports = reports.map((r) => ({
      id: r._id,
      patientName:
        r.patient && r.patient.user ? r.patient.user.username : "Unknown",
      // Only show "Normal" if explicitly in DB — null means no scan data yet
      tumorType:
        r.tumorName && r.tumorName.tumorName
          ? r.tumorName.tumorName
          : null,
      tumorDetected: isTumorDetected(r.tumorName),
      confidence: resolveConfidence(r.confidenceScore, r.tumorName),
      scanDate: r.reportDate,
      doctorNotes:
        r.doctorComment ||
        r.recommendation ||
        r.aiRecommendation ||
        "No notes available.",
      status: r.status,
    }));

    let finalData = formattedReports;
    if (tumorType && tumorType !== "All Tumor types") {
      finalData = formattedReports.filter(
        (r) =>
          r.tumorType && r.tumorType.toLowerCase() === tumorType.toLowerCase(),
      );
    }

    res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. Recommendations - Get pending AI recommendations
exports.getPendingRecommendations = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    const reports = await Report.find({
      doctor: doctorId,
      status: "Pending Review",
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "username" },
      })
      .sort({ reportDate: -1 });

    const formattedRecommendations = reports.map((r) => ({
      id: r._id,
      patientName:
        r.patient && r.patient.user ? r.patient.user.username : "Unknown",
      date: r.reportDate,
      aiRecommendation:
        r.aiRecommendation ||
        r.recommendation ||
        "No AI Recommendation provided.",
      doctorComment: r.doctorComment || "",
    }));

    res.status(200).json({
      success: true,
      data: formattedRecommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. Recommendations - Update status and doctor comment
exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { doctorComment, status } = req.body;
    const doctorId = req.doctor._id;

    const report = await Report.findOne({ _id: reportId, doctor: doctorId });
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    if (doctorComment !== undefined) {
      report.doctorComment = doctorComment;
    }

    // If an explicit status is passed in the request body, use it;
    // otherwise: a filled doctorComment means the doctor took action → mark 'Completed'
    if (status) {
      report.status = status;
    } else if (doctorComment && doctorComment.trim()) {
      report.status = 'Completed';
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to '${report.status}'.`,
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
