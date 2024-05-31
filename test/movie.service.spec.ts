import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { MovieRepository } from '../src/repositories/movie.repository';
import { MovieService } from '../src/services/movie.service';
import { container } from 'tsyringe';
import {
  MovieSaveRequestDto,
  MovieUpdateRequestDto,
} from '../src/dtos/req/movie/movie.save.req.dto';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { DateFormat } from '../src/enum/date.format.enum';
import * as fs from 'fs';
import * as path from 'path';

describe('MovieService', () => {
  let movieService: MovieService = null;
  let movieRepository: MovieRepository = null;

  beforeAll(async () => {
    await AppDataSource.initialize();
    movieService = container.resolve(MovieService);
    movieRepository = container.resolve(MovieRepository);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('Return new movies when input empty', async () => {
    const newMovies = await movieService.getNewestFilms();
    expect(JSON.stringify([11, 31, 32, 33, 34, 35])).toEqual(
      JSON.stringify(newMovies.map((item) => item.id)),
    );
  });

  it('Return hot movies when input empty', async () => {
    const hotMovies = await movieService.getHotFilms();
    expect(
      JSON.stringify(hotMovies.map((item) => item.id).sort((a, b) => a - b)),
    ).toEqual(JSON.stringify([14, 15, 18, 19, 20, 29]));
  });

  it('Return moives with multicondition when input page=1; name="Venom"; categoriIds=[2, 3, 4, 5]; age=13; adminRequest=null', async () => {
    const movies = await movieService.getMoivesWithPagination(
      1,
      'Venom',
      [2, 3, 4, 5],
      13,
      null,
    );
    expect(JSON.stringify(movies.items.map((item) => item.id))).toEqual(
      JSON.stringify([2, 9, 16, 23, 30]),
    );
  });

  it('Return moives with multicondition when input page=1; name="Venome"; categoriIds=[1, 2, 3, 4, 5]; age=13; adminRequest=null', async () => {
    const movies = await movieService.getMoivesWithPagination(
      1,
      'Venome',
      [1, 2, 3, 4, 5],
      13,
      null,
    );
    expect(movies).toBe(null);
  });

  it('Return moives with multicondition when input page=1; name=null; categoriIds=null; age=13; adminRequest=true', async () => {
    const movies = await movieService.getMoivesWithPagination(
      1,
      null,
      null,
      13,
      true,
    );
    expect(JSON.stringify(movies.items.map((item) => item.id))).toEqual(
      JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]),
    );
  });

  it('Return movie detail when input movieId is null', async () => {
    const movie = await movieService.getMovieDetail(null);
    expect(movie).toBe(null);
  });

  it('Return movie detail when input movieId is 13', async () => {
    const movie: any = await movieService.getMovieDetail(13);
    expect(movie.categories.trim()).toEqual('Phim tài liệu');
  });

  it('Return updated when input include MovieUpdateRequestDto and largeImage, smallImage', async () => {
    const movieUpdateRequestDto = new MovieUpdateRequestDto();
    movieUpdateRequestDto['movieId'] = 11;
    movieUpdateRequestDto.name = 'Hello World';
    movieUpdateRequestDto.direction = 'Nam Nam Nam';
    movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
    movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
    movieUpdateRequestDto.language = 'Tiếng Việt';
    movieUpdateRequestDto.categoryIds = [1, 2, 3, 4];
    movieUpdateRequestDto.duration = 60;
    movieUpdateRequestDto.ageLimit = 13;
    movieUpdateRequestDto.releaseDate = new Date('2024-06-15');
    movieUpdateRequestDto.startDateShowing = new Date('2024-06-29');
    movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
    movieUpdateRequestDto.shortDescription = faker.lorem.text();
    movieUpdateRequestDto.longDescription = faker.lorem.text();

    await movieService.save(movieUpdateRequestDto);

    // @ts-ignore
    movieUpdateRequestDto.releaseDate = '2024-06-15';
    // @ts-ignore
    movieUpdateRequestDto.startDateShowing = '2024-06-29';
    // @ts-ignore
    movieUpdateRequestDto.endDateShowing = '2024-07-29';

    const movie = await movieRepository.findOne({
      where: { id: 11 },
      relations: ['categories'],
    });

    expect(JSON.stringify(movieUpdateRequestDto)).toEqual(
      JSON.stringify({
        movieId: movie.id,
        name: movie.name,
        direction: movie.direction,
        actors: movie.actors,
        trailerurl: movie.trailerurl,
        language: movie.language,
        categoryIds: movie.categories.map((item) => item.id),
        duration: movie.duration,
        ageLimit: movie.ageLimit,
        releaseDate: dayjs(movie.releaseDate).format(DateFormat.YYYY_MM_DD),
        startDateShowing: dayjs(movie.startDateShowing).format(
          DateFormat.YYYY_MM_DD,
        ),
        endDateShowing: dayjs(movie.endDateShowing).format(
          DateFormat.YYYY_MM_DD,
        ),
        shortDescription: movie.shortDescription,
        longDescription: movie.longDescription,
        largeImgurl: movie.largeImgurl,
        smallImgurl: movie.smallImgurl,
      }),
    );
  });

  it('Return created when input include MovieSaveRequestDto and largeImage, smallImage', async () => {
    const movieUpdateRequestDto = new MovieSaveRequestDto();
    movieUpdateRequestDto.name = 'New Movie';
    movieUpdateRequestDto.direction = 'Nam Nam Nam';
    movieUpdateRequestDto.actors = 'Nam1, Nam2, Nam3';
    movieUpdateRequestDto.trailerurl = 'https://www.youtube.com';
    movieUpdateRequestDto.language = 'Tiếng Việt';
    movieUpdateRequestDto.categoryIds = [1];
    movieUpdateRequestDto.duration = 60;
    movieUpdateRequestDto.ageLimit = 13;
    movieUpdateRequestDto.releaseDate = new Date('2024-04-15');
    movieUpdateRequestDto.startDateShowing = new Date('2024-05-29');
    movieUpdateRequestDto.endDateShowing = new Date('2024-07-29');
    movieUpdateRequestDto.shortDescription = faker.lorem.text();
    movieUpdateRequestDto.longDescription = faker.lorem.text();

    const filePath =
      '/home/nam/Downloads/Hinh-nen-full-hd-1080-cho-may-tinh-canh-mua-thu-dep-nao-long.jpg';
    const buffer = fs.readFileSync(filePath);
    const largeImage: Express.Multer.File = {
      fieldname: 'file',
      originalname: path.basename(filePath),
      encoding: '7bit',
      mimetype: 'image/jpeg', // or the appropriate mime type
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: fs.createReadStream(filePath),
    };
    const smallImage: Express.Multer.File = {
      fieldname: 'file',
      originalname: path.basename(filePath),
      encoding: '7bit',
      mimetype: 'image/jpeg', // or the appropriate mime type
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: fs.createReadStream(filePath),
    };

    await movieService.save(movieUpdateRequestDto, largeImage, smallImage);

    // @ts-ignore
    movieUpdateRequestDto.releaseDate = '2024-04-15';
    // @ts-ignore
    movieUpdateRequestDto.startDateShowing = '2024-05-29';
    // @ts-ignore
    movieUpdateRequestDto.endDateShowing = '2024-07-29';

    const movie = await movieRepository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.categories', 'categories')
      .orderBy('movie.id', 'DESC')
      .getOne();

    expect(JSON.stringify(movieUpdateRequestDto)).toEqual(
      JSON.stringify({
        name: movie.name,
        direction: movie.direction,
        actors: movie.actors,
        trailerurl: movie.trailerurl,
        language: movie.language,
        categoryIds: movie.categories.map((item) => item.id),
        duration: movie.duration,
        ageLimit: movie.ageLimit,
        releaseDate: dayjs(movie.releaseDate).format(DateFormat.YYYY_MM_DD),
        startDateShowing: dayjs(movie.startDateShowing).format(
          DateFormat.YYYY_MM_DD,
        ),
        endDateShowing: dayjs(movie.endDateShowing).format(
          DateFormat.YYYY_MM_DD,
        ),
        shortDescription: movie.shortDescription,
        longDescription: movie.longDescription,
      }),
    );
  });
});
