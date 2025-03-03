import signup from "../models/register.js";
import bcrypt from "bcrypt";

const register = async (req, res) => {
    try {
        const data = req.body;
        const salt = await bcrypt.genSalt(7);
        const check = await signup.findOne({ email: data.email });

        if (check) {
            return res.status(409).json({
                message: "User already exists in our database"
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, salt);
        data.password = hashedPassword;

        const registerInstance = new signup({
            email: data.email,
            password: data.password
        });

        let result = await registerInstance.save();

        return res.status(201).json({
            message: "Data saved successfully",
            error: null,
            data: result
        });

    } catch (err) {
        console.log("Error caught:", err);
        return res.status(500).json({
            message: "Failed to save the data",
            error: err.message
        });
    }
};

export default register;
