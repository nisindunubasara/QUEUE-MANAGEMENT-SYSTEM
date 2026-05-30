import mongoose from "mongoose";
import "dotenv/config";



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "user",
        "customer",
        "organization_admin",
        "branch_admin",
        "staff",
        "hospital_super_admin",
        "police_super_admin",
        "bank_super_admin",
        "police_division_admin",
        "police_branch_admin",
        "police_staff",
        "doctor",
      ],
      required: true,
    },

    tenantType: {
      type: String,
      enum: ["hospital", "police", "bank", null],
      default: null,
      required: function () {
        return this.role === "staff" || this.role === "doctor";
      },
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: function () {
        const needsOrg = ["staff", "doctor"].includes(this.role);
        const isSharedTenant = ["bank", "hospital"].includes(
          String(this.tenantType || "").trim().toLowerCase()
        );
        return needsOrg && isSharedTenant;
      },
    },

    organizationName: {
      type: String,
      default: null,
      trim: true,
    },

    divisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      required: function () {
        return false;
      },
    },

    divisionName: {
      type: String,
      default: null,
      trim: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: function () {
        return this.role === "staff" || this.role === "doctor";
      },
    },

    branchName: {
      type: String,
      default: null,
      trim: true,
      required: function () {
        return this.role === "staff" || this.role === "doctor";
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastPingAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;