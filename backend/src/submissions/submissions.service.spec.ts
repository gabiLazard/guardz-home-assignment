import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { SubmissionRepository } from './repositories/submission.repository';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let repository: SubmissionRepository;

  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const mockSubmissionDocument = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0501234567',
    message: 'Test message',
    createdAt: mockDate,
    updatedAt: mockDate,
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0501234567',
      message: 'Test message',
      createdAt: mockDate,
      updatedAt: mockDate,
    }),
  };

  const mockRepositoryMethods = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: SubmissionRepository,
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    repository = module.get<SubmissionRepository>(SubmissionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a submission with all fields', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0501234567',
        message: 'Test message',
      };

      mockRepositoryMethods.create.mockResolvedValue(mockSubmissionDocument);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('phone', '0501234567');
      expect(result).toHaveProperty('message', 'Test message');
      expect(mockSubmissionDocument.toObject).toHaveBeenCalled();
    });

    it('should create a submission without optional phone field', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Another message',
      };

      const docWithoutPhone = {
        ...mockSubmissionDocument,
        phone: undefined,
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439012',
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Another message',
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
      };

      mockRepositoryMethods.create.mockResolvedValue(docWithoutPhone);

      const result = await service.create(createDto);

      expect(result.phone).toBeUndefined();
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should transform _id to id in response', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test',
      };

      mockRepositoryMethods.create.mockResolvedValue(mockSubmissionDocument);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('_id');
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions with default query', async () => {
      const query: QuerySubmissionDto = {};
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {},
          sortBy: 'createdAt',
          sortOrder: 'desc',
          skip: 0,
          limit: 10,
        }),
      );
      expect(repository.count).toHaveBeenCalledWith({});
    });

    it('should handle search query with $or filter', async () => {
      const query: QuerySubmissionDto = { search: 'John' };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            $or: [
              { name: { $regex: 'John', $options: 'i' } },
              { email: { $regex: 'John', $options: 'i' } },
              { message: { $regex: 'John', $options: 'i' } },
            ],
          },
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should handle pagination on page 2', async () => {
      const query: QuerySubmissionDto = { page: 2 };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(25);

      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * 10
          limit: 10,
        }),
      );
      expect(result.pagination).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle custom sort parameters', async () => {
      const query: QuerySubmissionDto = { sortBy: 'name', sortOrder: 'asc' };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      );
    });

    it('should handle date range filter with startDate only', async () => {
      const query: QuerySubmissionDto = { startDate: '2024-01-01' };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            createdAt: {
              $gte: new Date('2024-01-01'),
            },
          },
        }),
      );
    });

    it('should handle date range filter with endDate only', async () => {
      const query: QuerySubmissionDto = { endDate: '2024-01-31' };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      await service.findAll(query);

      const callArgs = (repository.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.filter.createdAt).toBeDefined();
      expect(callArgs.filter.createdAt.$lte).toBeDefined();
      // End date should be set to end of day
      const endDate = callArgs.filter.createdAt.$lte;
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });

    it('should handle date range filter with both startDate and endDate', async () => {
      const query: QuerySubmissionDto = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      await service.findAll(query);

      const callArgs = (repository.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.filter.createdAt).toBeDefined();
      expect(callArgs.filter.createdAt.$gte).toEqual(new Date('2024-01-01'));
      expect(callArgs.filter.createdAt.$lte).toBeDefined();
    });

    it('should handle combined search and date filters', async () => {
      const query: QuerySubmissionDto = {
        search: 'test',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(1);

      await service.findAll(query);

      const callArgs = (repository.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.filter.$or).toBeDefined();
      expect(callArgs.filter.createdAt).toBeDefined();
    });

    it('should return empty array when no results', async () => {
      mockRepositoryMethods.findAll.mockResolvedValue([]);
      mockRepositoryMethods.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should transform all submissions to DTOs', async () => {
      const submissions = [
        mockSubmissionDocument,
        {
          ...mockSubmissionDocument,
          _id: '507f1f77bcf86cd799439012',
          toObject: jest.fn().mockReturnValue({
            _id: '507f1f77bcf86cd799439012',
            name: 'Jane Doe',
            email: 'jane@example.com',
            message: 'Second message',
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        },
      ];

      mockRepositoryMethods.findAll.mockResolvedValue(submissions);
      mockRepositoryMethods.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[1]).toHaveProperty('id');
      expect(result.data[0]).not.toHaveProperty('_id');
      expect(result.data[1]).not.toHaveProperty('_id');
    });

    it('should calculate correct pagination for last page', async () => {
      mockRepositoryMethods.findAll.mockResolvedValue([mockSubmissionDocument]);
      mockRepositoryMethods.count.mockResolvedValue(23);

      const result = await service.findAll({ page: 3 });

      expect(result.pagination).toEqual({
        page: 3,
        pageSize: 10,
        totalItems: 23,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single submission by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockRepositoryMethods.findById.mockResolvedValue(mockSubmissionDocument);

      const result = await service.findOne(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).not.toHaveProperty('_id');
    });

    it('should return null when submission not found', async () => {
      const id = 'nonexistent';
      mockRepositoryMethods.findById.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith(id);
    });

    it('should transform _id to id in response', async () => {
      mockRepositoryMethods.findById.mockResolvedValue(mockSubmissionDocument);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('_id');
    });
  });
});
