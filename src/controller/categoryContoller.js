import { handleError, handleResponse } from '../utils/index.js';
import { categoryModel } from '../models/index.js';

const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      // Stage 1: Project to include only the fields you want
      {
        $project: {
          _id: 1,
          categoryName: 1,
          subcategories: {
            $map: {
              input: '$subcategories',
              as: 'subcategory',
              in: {
                _id: '$$subcategory._id',
                subCategoryName: '$$subcategory.subCategoryName',
                nestedSubcategories: {
                  $map: {
                    input: '$$subcategory.nestedSubcategories',
                    as: 'nestedSubcategory',
                    in: {
                      _id: '$$nestedSubcategory._id',
                      subCategoryName: '$$nestedSubcategory.subCategoryName',
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    handleResponse(res, 'Categories fetched successfully', categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    handleError(res, error, 400, 'Error fetching categories');
  }
};

const addOrUpdateCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('No categories provided.');
    }

    const categoryPromises = categories.map(async (category) => {
      const { categoryId, categoryName, subcategories } = category;

      if (!categoryName || !Array.isArray(subcategories)) {
        throw new Error('Category name and subcategories are required.');
      }

      const categoryData = {
        categoryName,
        subcategories: subcategories.map((sub) => ({
          ...sub,
          nestedSubcategories: sub.nestedSubcategories || [],
        })),
      };

      let result;
      if (categoryId) {
        result = await categoryModel.findByIdAndUpdate(
          categoryId,
          categoryData,
          { new: true }
        );
      } else {
        result = new categoryModel(categoryData);
        await result.save();
      }
      return result;
    });

    const processedCategories = await Promise.all(categoryPromises);

    handleResponse(
      res,
      'Categories processed successfully',
      processedCategories
    );
  } catch (error) {
    console.error('Error processing categories:', error);
    handleError(res, error, 400, 'Error processing categories');
  }
};

export default { getCategories, addOrUpdateCategories };
