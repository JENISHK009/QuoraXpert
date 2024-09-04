import { Schema, model } from 'mongoose';

const NestedSubcategorySchema = new Schema(
  {
    subCategoryName: { type: String, required: true },
  },
  {
    timestamps: false,
    _id: true,
  }
);

const SubcategorySchema = new Schema(
  {
    subCategoryName: { type: String, required: true },
    nestedSubcategories: [NestedSubcategorySchema],
  },
  {
    timestamps: false,
    _id: true,
  }
);

const CategorySchema = new Schema(
  {
    categoryName: { type: String, required: true },
    subcategories: [SubcategorySchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const CategoryModel = model('Category', CategorySchema);
export default CategoryModel;
