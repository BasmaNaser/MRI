const mongoose=require('mongoose');
require('dotenv').config();
const tumortype=require('../Models/tumorType.model');
const tumorjson=require('./tumorand Recommenfation.json')
const Recommendation=require('../Models/recommendation.model')
async function db() {
try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connection Running Successfuly ✅');
        // await tumortype.deleteMany({});
        // await Recommendation.deleteMany({});
        // const savedTumortype=[];
        // for(const t of tumorjson.tumortypes)
        // {
        //    const doc= await tumortype.create({tumorName:t.tumorName.trim()});
        //    savedTumortype.push(doc);
        // }
        // for(const r of tumorjson.recommendations)
        // {
        //     const tumor = savedTumortype.find(t => t.tumorName === r.tumorName.trim());
        //     if (!tumor) {
        //         console.log(`Warning: Tumortype not found for recommendation: ${r.subject}`);
        //         continue; // يتخطى لو مش موجود
        //     }

        //     await Recommendation.create(
        //         {
        //             subject:r.subject,
        //             tumorName:tumor._id
        //         })
        // }
        
} catch (error) {
    console.log(`There has error is ${error}❗`);
}
}
module.exports = db;