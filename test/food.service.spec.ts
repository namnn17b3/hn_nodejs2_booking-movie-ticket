import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { container } from 'tsyringe';
import { FoodService } from '../src/services/food.service';

describe('FoodService', () => {
  let foodService: FoodService = null;

  beforeAll(async () => {
    await AppDataSource.initialize();
    foodService = container.resolve(FoodService);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('Return all food when input empty', async () => {
    const foods = await foodService.getFoods();

    expect(JSON.stringify(foods.data.map((item) => item.id))).toBe(
      JSON.stringify([1, 2, 3]),
    );
  });
});
