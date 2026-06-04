const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        specialization:
        {
            type: String
        },
        experienceYears:
        {
            type: Number
        },
        workplace: {
            type: String
        }
    ,   status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
},
    {timestamps:true}
);
module.exports = mongoose.model('Doctor', doctorSchema);
