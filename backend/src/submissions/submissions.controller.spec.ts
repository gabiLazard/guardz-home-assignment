import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;

  const mockSubmission = {
    _id: '507f1f77bcf86cd799439011',
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
    it('should create a new submission', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
      };

      mockSubmissionsService.create.mockResolvedValue(mockSubmission);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockSubmission);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of submissions', async () => {
      const submissions = [mockSubmission];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll();
      expect(result).toEqual(submissions);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single submission', async () => {
      mockSubmissionsService.findOne.mockResolvedValue(mockSubmission);

      const result = await controller.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockSubmission);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
