import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubmissionRepository } from './submission.repository';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';
import { CreateSubmissionDto } from '../dto/create-submission.dto';

// Type definitions for Mongoose query chain mocks
type MockExec<T> = {
  exec: jest.Mock<Promise<T>>;
};

type MockLimit<T> = {
  limit: jest.Mock<MockExec<T>>;
};

type MockSkip<T> = {
  skip: jest.Mock<MockLimit<T>>;
};

type MockSort<T> = {
  sort: jest.Mock<MockSkip<T>>;
};

describe('SubmissionRepository', () => {
  let repository: SubmissionRepository;
  let model: Model<SubmissionDocument>;

  const mockSubmissionData = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0501234567',
    message: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmission = {
    ...mockSubmissionData,
    save: jest.fn<Promise<SubmissionDocument>, []>(),
  } as unknown as SubmissionDocument;

  // Initialize save mock to return the mock submission
  mockSubmission.save = jest
    .fn<Promise<SubmissionDocument>, []>()
    .mockResolvedValue(mockSubmission);

  // Helper function to create a mock query chain
  const createMockQueryChain = <T>(result: T): MockSort<T> => {
    return {
      sort: jest.fn<MockSkip<T>, [unknown]>().mockReturnValue({
        skip: jest.fn<MockLimit<T>, [number]>().mockReturnValue({
          limit: jest.fn<MockExec<T>, [number]>().mockReturnValue({
            exec: jest.fn<Promise<T>, []>().mockResolvedValue(result),
          }),
        }),
      }),
    };
  };

  const mockModel = {
    find: jest.fn<MockSort<SubmissionDocument[]>, [unknown?]>(),
    findById: jest.fn<MockExec<SubmissionDocument | null>, [string]>(),
    countDocuments: jest.fn<MockExec<number>, [unknown?]>(),
    constructor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionRepository,
        {
          provide: getModelToken(Submission.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<SubmissionRepository>(SubmissionRepository);
    model = module.get<Model<SubmissionDocument>>(
      getModelToken(Submission.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should create a new submission', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0501234567',
        message: 'Test message',
      };

      const mockSave = jest
        .fn<Promise<SubmissionDocument>, []>()
        .mockResolvedValue(mockSubmission);
      const mockModelInstance = {
        save: mockSave,
      } as unknown as SubmissionDocument;

      // Mock the model constructor
      const mockModelConstructor = jest
        .fn<SubmissionDocument, [CreateSubmissionDto]>()
        .mockReturnValue(mockModelInstance);
      repository = new SubmissionRepository(
        mockModelConstructor as unknown as Model<SubmissionDocument>,
      );

      const result = await repository.create(createDto);

      expect(result).toEqual(mockSubmission);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create submission without optional phone', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Another message',
      };

      const submissionWithoutPhone = {
        ...mockSubmission,
        phone: undefined,
      } as SubmissionDocument;
      const mockSave = jest
        .fn<Promise<SubmissionDocument>, []>()
        .mockResolvedValue(submissionWithoutPhone);
      const mockModelInstance = {
        save: mockSave,
      } as unknown as SubmissionDocument;

      const mockModelConstructor = jest
        .fn<SubmissionDocument, [CreateSubmissionDto]>()
        .mockReturnValue(mockModelInstance);
      repository = new SubmissionRepository(
        mockModelConstructor as unknown as Model<SubmissionDocument>,
      );

      const result = await repository.create(createDto);

      expect(result.phone).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should find all submissions with default options', async () => {
      const submissions = [mockSubmission];
      mockModel.find.mockReturnValue(createMockQueryChain(submissions));

      const result = await repository.findAll({});

      expect(result).toEqual(submissions);
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('should apply filter options', async () => {
      const filter = { name: { $regex: 'John', $options: 'i' } };
      mockModel.find.mockReturnValue(createMockQueryChain([mockSubmission]));

      await repository.findAll({ filter });

      expect(model.find).toHaveBeenCalledWith(filter);
    });

    it('should apply sort in ascending order', async () => {
      const mockQueryChain = createMockQueryChain([mockSubmission]);
      mockModel.find.mockReturnValue(mockQueryChain);

      await repository.findAll({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should apply sort in descending order', async () => {
      const mockQueryChain = createMockQueryChain([mockSubmission]);
      mockModel.find.mockReturnValue(mockQueryChain);

      await repository.findAll({ sortBy: 'createdAt', sortOrder: 'desc' });

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should apply skip and limit for pagination', async () => {
      const mockQueryChain = createMockQueryChain([mockSubmission]);
      mockModel.find.mockReturnValue(mockQueryChain);

      await repository.findAll({ skip: 10, limit: 5 });

      const mockSkip = mockQueryChain.sort().skip;
      expect(mockSkip).toHaveBeenCalledWith(10);
    });

    it('should use default values when options not provided', async () => {
      const mockQueryChain = createMockQueryChain([mockSubmission]);
      mockModel.find.mockReturnValue(mockQueryChain);

      await repository.findAll({});

      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should return empty array when no results', async () => {
      mockModel.find.mockReturnValue(createMockQueryChain([]));

      const result = await repository.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a submission by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockModel.findById.mockReturnValue({
        exec: jest
          .fn<Promise<SubmissionDocument>, []>()
          .mockResolvedValue(mockSubmission),
      });

      const result = await repository.findById(id);

      expect(result).toEqual(mockSubmission);
      expect(model.findById).toHaveBeenCalledWith(id);
    });

    it('should return null when submission not found', async () => {
      const id = 'nonexistent';
      mockModel.findById.mockReturnValue({
        exec: jest
          .fn<Promise<SubmissionDocument | null>, []>()
          .mockResolvedValue(null),
      });

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });

    it('should handle different valid MongoDB ObjectId formats', async () => {
      const ids = ['507f1f77bcf86cd799439011', '123456789012345678901234'];

      for (const id of ids) {
        mockModel.findById.mockReturnValue({
          exec: jest
            .fn<Promise<SubmissionDocument>, []>()
            .mockResolvedValue(mockSubmission),
        });

        await repository.findById(id);
        expect(model.findById).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('count', () => {
    it('should count all documents with empty filter', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn<Promise<number>, []>().mockResolvedValue(10),
      });

      const result = await repository.count();

      expect(result).toBe(10);
      expect(model.countDocuments).toHaveBeenCalledWith({});
    });

    it('should count documents with filter', async () => {
      const filter = { name: 'John Doe' };
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn<Promise<number>, []>().mockResolvedValue(5),
      });

      const result = await repository.count(filter);

      expect(result).toBe(5);
      expect(model.countDocuments).toHaveBeenCalledWith(filter);
    });

    it('should return zero when no documents match', async () => {
      const filter = { name: 'Nonexistent' };
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn<Promise<number>, []>().mockResolvedValue(0),
      });

      const result = await repository.count(filter);

      expect(result).toBe(0);
    });

    it('should count with complex filter', async () => {
      const complexFilter = {
        $or: [
          { name: { $regex: 'John', $options: 'i' } },
          { email: { $regex: 'John', $options: 'i' } },
        ],
        createdAt: { $gte: new Date('2024-01-01') },
      };

      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn<Promise<number>, []>().mockResolvedValue(3),
      });

      const result = await repository.count(complexFilter);

      expect(result).toBe(3);
      expect(model.countDocuments).toHaveBeenCalledWith(complexFilter);
    });
  });
});
