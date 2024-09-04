import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    otp: {
      code: { type: String },
      expiredAt: { type: Date, default: Date.now() + 60000 },
    },
    gender: { type: String },
    referralCode: { type: String },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    subcategoryIds: [{ type: Schema.Types.ObjectId, ref: 'Subcategory' }],
    nestedCategoryIds: [
      { type: Schema.Types.ObjectId, ref: 'NestedSubcategory' },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = model('User', userSchema);
export default UserModel;
