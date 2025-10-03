import { model, Schema } from "mongoose";

const PartnerSchema = new Schema({
  media: {  // Keep this as 'media' to match your frontend expectations
    type: String,
    required: [true, "Partner image is required"],
    trim: true,
    validate: {
      validator: function (v: string) {
        // Basic URL validation to ensure we're storing valid Cloudinary URLs
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(v) ||
          /^https:\/\/res\.cloudinary\.com\/.+/.test(v);
      },
      message: "Please provide a valid image URL"
    }
  },
  name: {
    type: String,
    required: [true, "Partner name is required"],
    trim: true,
    minlength: [2, "Partner name must be at least 2 characters long"],
    maxlength: [100, "Partner name cannot exceed 100 characters"],
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
  // Add some additional options for better performance and consistency
  toJSON: { virtuals: true },  // Include virtual fields when converting to JSON
  toObject: { virtuals: true }
});

// Add an index on the name field for faster queries
PartnerSchema.index({ name: 1 });

// Add a pre-save middleware to ensure name consistency
PartnerSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Create and export the model
const Partners = model('Partners', PartnerSchema);

export default Partners;