import { Schema, model } from 'mongoose';

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RoleModel = model('Role', roleSchema);
export default RoleModel;
