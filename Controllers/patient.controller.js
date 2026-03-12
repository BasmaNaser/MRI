async function getProfileController(req,res){
   try {
    const user= req.user;

    res.status(200).json(
        {
            success:true,
            data:
            {
                username:user.username,
                email:user.email,
                image:user.profileImage
            }
        }
    )
    
   } catch (error) {
    next(error);
   }
}

module.exports={getProfileController}