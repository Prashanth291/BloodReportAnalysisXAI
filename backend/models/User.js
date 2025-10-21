import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    verificationOTP: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    profile: {
      age: {
        type: Number,
        min: 0,
        max: 120,
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        lowercase: true,
      },
      conditions: [
        {
          type: String,
          enum: [
            "pregnant",
            "diabetic",
            "hypertensive",
            "kidney_disease",
            "liver_disease",
            "heart_disease",
            "thyroid_disorder",
          ],
          lowercase: true,
        },
      ],
      ethnicity: {
        type: String,
        enum: ["general", "african", "asian", "caucasian", "hispanic", "other"],
        default: "general",
        lowercase: true,
      },
      medications: [String],
      bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      height: Number, // in cm
      weight: Number, // in kg
      lifestyle: {
        smoking: {
          type: String,
          enum: ["never", "former", "current"],
        },
        alcohol: {
          type: String,
          enum: ["never", "occasional", "moderate", "heavy"],
        },
        exercise: {
          type: String,
          enum: ["sedentary", "light", "moderate", "active", "very_active"],
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
