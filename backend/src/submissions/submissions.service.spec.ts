import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { SubmissionRepository } from './repositories/submission.repository';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let mockRepository: any;

  const mockSubmissionDocument = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    message: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(mockSubmissionDocument),
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: SubmissionRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new submission and return DTO', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
      };

      const result = await service.create(createDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions with default query', async () => {
      const submissions = [mockSubmissionDocument];
      mockRepository.findAll.mockResolvedValue(submissions);
      mockRepository.count.mockResolvedValue(1);

      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('name', 'John Doe');
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should return paginated submissions with search query', async () => {
      const submissions = [mockSubmissionDocument];
      mockRepository.findAll.mockResolvedValue(submissions);
      mockRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'John' });
      expect(result.data).toHaveLength(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
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
    });

    it('should handle pagination correctly for page 2', async () => {
      const submissions = [mockSubmissionDocument];
      mockRepository.findAll.mockResolvedValue(submissions);
      mockRepository.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 2 });
      expect(result.pagination).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single submission as DTO', async () => {
      mockRepository.findById.mockResolvedValue(mockSubmissionDocument);

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('id');
      expect(mockRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null if submission not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');
      expect(result).toBeNull();
    });
  });
});
