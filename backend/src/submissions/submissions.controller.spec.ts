import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  const mockSubmissionResponseDto = {
    id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0501234567',
    message: 'Test message',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockPaginatedResponse = {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should create a submission with all fields', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0501234567',
        message: 'Test message',
      };

      mockSubmissionsService.create.mockResolvedValue(
        mockSubmissionResponseDto,
      );

      const result = await controller.create(createDto);

      expect(result).toEqual(mockSubmissionResponseDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create a submission without optional phone field', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Another message',
      };

      const responseWithoutPhone = {
        ...mockSubmissionResponseDto,
        phone: undefined,
      };
      mockSubmissionsService.create.mockResolvedValue(responseWithoutPhone);

      const result = await controller.create(createDto);

      expect(result.phone).toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should return HTTP 201 status code', async () => {
      const createDto: CreateSubmissionDto = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      mockSubmissionsService.create.mockResolvedValue(
        mockSubmissionResponseDto,
      );

      // The @HttpCode decorator ensures 201 status
      const result = await controller.create(createDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions with default query', async () => {
      const query: QuerySubmissionDto = {};
      mockSubmissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return paginated submissions with page parameter', async () => {
      const query: QuerySubmissionDto = { page: 2 };
      const page2Response = {
        ...mockPaginatedResponse,
        pagination: {
          ...mockPaginatedResponse.pagination,
          page: 2,
          hasPrev: true,
        },
      };
      mockSubmissionsService.findAll.mockResolvedValue(page2Response);

      const result = await controller.findAll(query);

      expect(result.pagination.page).toBe(2);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return paginated submissions with search parameter', async () => {
      const query: QuerySubmissionDto = { search: 'John' };
      mockSubmissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return paginated submissions with sort parameters', async () => {
      const query: QuerySubmissionDto = { sortBy: 'name', sortOrder: 'asc' };
      mockSubmissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return paginated submissions with date range', async () => {
      const query: QuerySubmissionDto = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockSubmissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return paginated submissions with all query parameters', async () => {
      const query: QuerySubmissionDto = {
        page: 2,
        search: 'test',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockSubmissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no submissions found', async () => {
      const emptyResponse = {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockSubmissionsService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll({});

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a single submission by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockSubmissionsService.findOne.mockResolvedValue(
        mockSubmissionResponseDto,
      );

      const result = await controller.findOne(id);

      expect(result).toEqual(mockSubmissionResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when submission not found', async () => {
      const id = 'nonexistent';
      mockSubmissionsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should handle different id formats', async () => {
      const ids = ['507f1f77bcf86cd799439011', '123456789012345678901234'];

      for (const id of ids) {
        mockSubmissionsService.findOne.mockResolvedValue(
          mockSubmissionResponseDto,
        );
        await controller.findOne(id);
        expect(service.findOne).toHaveBeenCalledWith(id);
      }
    });
  });
});
