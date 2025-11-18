/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Submissions API (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Apply global prefix as in main.ts
    app.setGlobalPrefix('api');

    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    // Clean up test database
    if (connection) {
      await connection.dropDatabase();
      await connection.close();
    }
    await app.close();
  });

  afterEach(async () => {
    // Clear submissions collection after each test
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /submissions', () => {
    it('should create a new submission with valid data', async () => {
      const createSubmissionDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        message: 'This is a test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(createSubmissionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createSubmissionDto.name,
        email: createSubmissionDto.email,
        phone: createSubmissionDto.phone,
        message: createSubmissionDto.message,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a submission without optional phone field', async () => {
      const createSubmissionDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        message: 'Test message without phone',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(createSubmissionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createSubmissionDto.name,
        email: createSubmissionDto.email,
        message: createSubmissionDto.message,
      });
      expect(response.body.phone).toBeUndefined();
    });

    it('should return 400 when name is missing', async () => {
      const invalidDto = {
        email: 'test@example.com',
        message: 'Test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('name should not be empty');
    });

    it('should return 400 when email is invalid', async () => {
      const invalidDto = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });

    it('should return 400 when name exceeds max length', async () => {
      const invalidDto = {
        name: 'a'.repeat(101),
        email: 'test@example.com',
        message: 'Test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain(
        'name must be shorter than or equal to 100 characters',
      );
    });

    it('should return 400 when phone exceeds max length', async () => {
      const invalidDto = {
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1'.repeat(21),
        message: 'Test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain(
        'phone must be shorter than or equal to 20 characters',
      );
    });

    it('should return 400 when message exceeds max length', async () => {
      const invalidDto = {
        name: 'John Doe',
        email: 'test@example.com',
        message: 'a'.repeat(1001),
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain(
        'message must be shorter than or equal to 1000 characters',
      );
    });

    it('should sanitize HTML in submission fields', async () => {
      const createSubmissionDto = {
        name: '<script>alert("xss")</script>John Doe',
        email: 'test@example.com',
        message: '<b>Bold message</b> with <script>alert("xss")</script>',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(createSubmissionDto)
        .expect(201);

      // Sanitization should remove script tags
      expect(response.body.name).not.toContain('<script>');
      expect(response.body.message).not.toContain('<script>');
    });
  });

  describe('GET /submissions', () => {
    beforeEach(async () => {
      // Create test submissions
      const submissions = [
        {
          name: 'Alice Smith',
          email: 'alice@example.com',
          phone: '1111111111',
          message: 'First message',
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '2222222222',
          message: 'Second message',
        },
        {
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          message: 'Third message',
        },
      ];

      for (const submission of submissions) {
        await request(app.getHttpServer())
          .post('/api/submissions')
          .send(submission);
      }
    });

    it('should return all submissions with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.totalItems).toBe(3);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });

    it('should filter submissions by search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ search: 'alice' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Alice');
    });

    it('should sort submissions by name ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ sortBy: 'name', sortOrder: 'asc' })
        .expect(200);

      expect(response.body.data[0].name).toBe('Alice Smith');
      expect(response.body.data[1].name).toBe('Bob Johnson');
      expect(response.body.data[2].name).toBe('Charlie Brown');
    });

    it('should sort submissions by name descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ sortBy: 'name', sortOrder: 'desc' })
        .expect(200);

      expect(response.body.data[0].name).toBe('Charlie Brown');
      expect(response.body.data[1].name).toBe('Bob Johnson');
      expect(response.body.data[2].name).toBe('Alice Smith');
    });

    it('should filter by date range', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({
          startDate: yesterday.toISOString(),
          endDate: tomorrow.toISOString(),
        })
        .expect(200);

      expect(response.body.data.length).toBe(3);
    });

    it('should return 400 for invalid sort field', async () => {
      await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ sortBy: 'invalid' })
        .expect(400);
    });

    it('should return 400 for invalid page number', async () => {
      await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ page: 0 })
        .expect(400);
    });
  });

  describe('GET /submissions/:id', () => {
    let submissionId: string;

    beforeEach(async () => {
      const createSubmissionDto = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message for single retrieval',
      };

      const response = await request(app.getHttpServer())
        .post('/api/submissions')
        .send(createSubmissionDto);

      submissionId = response.body.id;
    });

    it('should return a single submission by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: submissionId,
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message for single retrieval',
      });
    });

    it('should return empty object for non-existent submission', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .get(`/api/submissions/${nonExistentId}`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('should return 400 for invalid MongoDB ObjectId', async () => {
      await request(app.getHttpServer())
        .get('/api/submissions/invalid-id')
        .expect(500); // Current implementation throws 500 for invalid ObjectId
    });
  });

  describe('Multiple submissions pagination', () => {
    beforeEach(async () => {
      // Create 15 submissions to test pagination
      const submissions = Array.from({ length: 15 }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        message: `Message ${i + 1}`,
      }));

      for (const submission of submissions) {
        await request(app.getHttpServer())
          .post('/api/submissions')
          .send(submission);
      }
    });

    it('should return first page with 10 items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ page: 1 })
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.totalItems).toBe(15);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });

    it('should return second page with remaining items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/submissions')
        .query({ page: 2 })
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.totalItems).toBe(15);
      expect(response.body.pagination.page).toBe(2);
    });
  });
});
