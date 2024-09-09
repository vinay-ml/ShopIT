import user from "../models/user.js";
import User from "../models/user.js";
import crypto from "crypto";
import sendToken from "../utils/sendToken.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import { upload_file } from "../utils/cloudinary.js";

// Register user
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email is already in use. Please try another email.",
      });
    }

    // Check if the password meets the minimum length requirement
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    // If validations pass, create the user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Save the user and send the token
    await user.save();
    sendToken(user, 201, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: "Please enter email & password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    sendToken(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Logout User
export const logout = (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    message: "Logged Out",
  });
};

// Forgot password => /api/v1/password/forgot
export const forgotPassword = async (req, res, next) => {
  //find user in the database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ error: "user not found with this email" });
  }

  // get reset password token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = getResetPasswordTemplate(user.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopIT Password Recovery",
      message,
    });

    return res.status(200).json({ message: `Email sent to: ${user.email}` });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return res.status(500).json({ error: error?.message });
  }
};

// Reset Password => /api/v1/passowrd/reset/:token
export const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ error: "Password reset token is invalid or has been expired." });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ error: "Passwords does not match" });
  }

  //Set new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
};

// Get current user profile => /api/v1/me
export const getUserProfile = async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  res.status(200).json({ user });
};

// Update password => /api/v1/passsword/update
export const updatePassword = async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password");

  // Check the previouss user password
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return res.status(400).json({ error: "Old Password is incorrect" });
  }

  user.password = req.body.password;
  user.save();

  res.status(200).json({
    success: true,
  });
};

// Update User profile => /api/v1/me/update
export const updateProfile = async (req, res, next) => {
  const newUserDate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserDate, {
    new: true,
  });

  res.status(200).json({ user });
};

// get all users - ADMIN => /api/v1/admin/users
export const allUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ users });
};

// get User Details - ADMIN => /api/v1/admin/users:id
export const getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: `User not foundd with id: ${req.params.id} `,
    });
  }

  res.status(200).json({ user });
};

// Update user detais - ADMIN => /api/v1/admin/users/:id
export const updateUser = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res.status(200).json({ user });
};

// Delete Usre - ADMIN => /api/v1/admin/users/:id
export const deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(404)
      .json({ error: `User not found with id: ${req.params.id}` });
  }

  // TODO - Remove user avatar from cloudinar

  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
};

//Upload user avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    const avatarResponse = await upload_file(req.body.avatar, "shopit/avatars");

    const user = await User.findByIdAndUpdate(
      req?.user?._id,
      {
        avatar: avatarResponse,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return success response
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server Error" });
    }
  }
};
