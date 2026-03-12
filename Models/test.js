// seed.js
const mongoose = require('mongoose');

// استدعاء الموديلات
const User = require('./user.model');
const Doctor = require('./doctor.model');
const Mriscan = require('./mriscan.model');
const Tumortype = require('./tumorType.model');
const Recommendation = require('./recommendation.model');
const Admin = require('./admin.model');


    console.log('Connected to MongoDB Atlas');

   
    // أنشئ Users (Patients و Doctors)
    const patient = await User.create({
      username: 'AliPatient',
      email: 'ali.patient@test.com',
      password: '12345678',
      role: 'Patient',
      gender: 'Male'
    });

    const doctorUser = await User.create({
      username: 'DrSara',
      email: 'dr.sara@test.com',
      password: '12345678',
      role: 'Doctor',
      gender: 'Female'
    });

    // أنشئ Doctor مرتبط بالـ User
    const doctor = await Doctor.create({
      doctor: doctorUser._id,
      specilization: 'Radiology',
      workplace: 'Clinic A'
    });

    // أنشئ Tumortype
    const tumor = await Tumortype.create({
      tumorName: 'Glioma'
    });

    // أنشئ Recommendation مرتبط بالورم
    await Recommendation.create({
      subject: 'MRI follow-up every 6 months',
      securityLevel: 'High',
      tumorName: tumor._id
    });

    // أنشئ MRI Scan مرتبط بالـ Patient، Doctor، Tumortype
    await Mriscan.create({
      scanImage: 'scan1.png',
      patient: patient._id,
      doctor: doctor._id,
      tumorName: tumor._id,
      confidenceScore: 0.95
    });

    // أنشئ Admin
    await Admin.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123'
    });

    console.log('Seeding done ✅');
