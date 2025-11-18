import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  const mockSubmissionResponseDto = {
    id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    message: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockSubmissionsService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get<SubmissionsService>(SubmissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new submission and return DTO', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
      };

      mockSubmissionsService.create.mockResolvedValue(mockSubmissionResponseDto);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockSubmissionResponseDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions with DTOs', async () => {
      const paginatedResponse = {
        data: [mockSubmissionResponseDto],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockSubmissionsService.findAll.mockResolvedValue(paginatedResponse);

      const query = { page: 1 };
      const result = await controller.findAll(query);
      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass query parameters including sort to service', async () => {
      const paginatedResponse = {
        data: [mockSubmissionResponseDto],
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };
      mockSubmissionsService.findAll.mockResolvedValue(paginatedResponse);

      const query = { page: 2, search: 'John', sortBy: 'name', sortOrder: 'asc' as const };
      const result = await controller.findAll(query);
      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single submission as DTO', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmissionResponseDto);

      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockSubmissionResponseDto);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
