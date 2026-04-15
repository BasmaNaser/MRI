const express=require('express');
const AdminRouter=express.Router();
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const {protectAdmin}=require('../Middleware/protect')
const {changePassword,updateAdminProfile,getDoctors,createDoctor,getDashboard,getPatients
    ,getProfile,getReports,logout,deleteDoctor,updateDoctor,updateDoctorStatus,
    viewPatient}=require('../Controllers/Admin.controller');
    //sign up only for test
const{signupAdmin}=require('../Controllers/auth.controller')   ;
AdminRouter.post('/admin/signup',signupAdmin);

AdminRouter.get('/admin/doctors',protectAdmin('Admin'),getDoctors);
AdminRouter.post('/admin/doctors',protectAdmin('Admin'),createDoctor);
AdminRouter.put('/admin/doctors/:id',protectAdmin('Admin'),updateDoctor);
AdminRouter.patch('/admin/doctors/:id/status',protectAdmin('Admin'),updateDoctorStatus);
AdminRouter.delete('/admin/doctors/:id',protectAdmin('Admin'),deleteDoctor);

AdminRouter.get('/admin/patients',protectAdmin('Admin'),getPatients);
AdminRouter.get('/admin/patient/:id',protectAdmin('Admin'),viewPatient);

AdminRouter.get('/admin/reports',protectAdmin('Admin'),getReports)

AdminRouter.post('/auth/logout',protectAdmin('Admin'),logout);
AdminRouter.get('/admin/profile',protectAdmin('Admin'),getProfile);
AdminRouter.get('/admin/dashboard',protectAdmin('Admin'),getDashboard);
AdminRouter.patch('/admin/profile',protectAdmin('Admin'),updateAdminProfile)
AdminRouter.patch('/admin/password',protectAdmin('Admin'),validateChangePassword,changePassword);

module.exports=AdminRouter;