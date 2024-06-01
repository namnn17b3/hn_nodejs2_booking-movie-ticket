import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { container } from 'tsyringe';
import { CategoryService } from '../src/services/category.service';

describe('CategoryService', () => {
  let categoryService: CategoryService = null;

  beforeAll(async () => {
    await AppDataSource.initialize();
    categoryService = container.resolve(CategoryService);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('Return all category when input empty', async () => {
    const categories = await categoryService.getAllCategories();
    console.log(categories.map((item) => item.id));

    expect(JSON.stringify(categories.map((item) => item.id))).toBe(
      JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    );
  });
});
