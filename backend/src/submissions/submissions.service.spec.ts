import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubmissionsService } from './submissions.service';
import { Submission } from './schemas/submission.schema';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let mockModel: any;

  const mockSubmission = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    message: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockModel = {
      new: jest.fn().mockResolvedValue(mockSubmission),
      constructor: jest.fn().mockResolvedValue(mockSubmission),
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: getModelToken(Submission.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new submission', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
      };

      mockModel.save = jest.fn().mockResolvedValue(mockSubmission);
      jest.spyOn(mockModel, 'constructor').mockImplementation(() => ({
        save: mockModel.save,
      }));

      const result = await service.create(createDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of submissions', async () => {
      const submissions = [mockSubmission];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(submissions),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(submissions);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single submission', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubmission),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockSubmission);
      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
