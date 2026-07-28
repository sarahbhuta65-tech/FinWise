const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const upload = require("../middlewares/upload");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        number: newUser.number,
        occupation: newUser.occupation,
        city: newUser.city,
        dob: newUser.dob,
        bio: newUser.bio,
        profilePicture: newUser.profilePicture,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      occupation: user.occupation,
      city: user.city,
      dob: user.dob,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePicture: photo,
        password: "", // Google users don't use passwords
        provider: "google",
      });
    }

    res.status(200).json({
      message: "Google Login Successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        occupation: user.occupation,
        city: user.city,
        dob: user.dob,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Profile
router.put("/profile/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      occupation,
      city,
      dob,
      bio,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        number,
        occupation,
        city,
        dob,
        bio,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put(
    "/profile-picture/:id",
    upload.single("profilePicture"),
    async (req, res) => {
        try {

            const profilePicture =
                `/uploads/profilePictures/${req.file.filename}`;

            const updatedUser =
                await User.findByIdAndUpdate(
                    req.params.id,
                    { profilePicture },
                    { new: true }
                );

            res.json({
                message: "Profile picture updated successfully",
                user: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    number: updatedUser.number,
                    occupation: updatedUser.occupation,
                    city: updatedUser.city,
                    dob: updatedUser.dob,
                    bio: updatedUser.bio,
                    profilePicture: updatedUser.profilePicture,
                },
            });

        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
);

router.put("/change-password/:id", async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        await user.save();

        res.json({
            message: "Password updated successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
});

module.exports = router;