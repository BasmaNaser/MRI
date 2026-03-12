const bcrypt = require('bcrypt');
async function comparePassword(password,hashedpassword)
{
    return await bcrypt.compare(password,hashedpassword)
}
module.exports=comparePassword