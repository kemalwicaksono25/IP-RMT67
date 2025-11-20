const {
  validateBriefId,
  validateBriefDetailId,
  validateGenerateBrief,
  validateUpdateBriefDetail,
  validateSubmitDetail,
} = require('../../../middleware/validators/briefValidator');
const { FUNNEL_STAGE } = require('../../../helpers/enums');

describe('Brief Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateBriefId', () => {
    it('should call next() with valid numeric ID', () => {
      req.params.id = '123';

      validateBriefId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when ID is missing', () => {
      req.params.id = undefined;

      validateBriefId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID brief tidak valid',
      });
    });

    it('should return error when ID is not a number', () => {
      req.params.id = 'abc';

      validateBriefId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID brief tidak valid',
      });
    });
  });

  describe('validateBriefDetailId', () => {
    it('should call next() with valid numeric ID', () => {
      req.params.id = '456';

      validateBriefDetailId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when ID is missing', () => {
      req.params.id = undefined;

      validateBriefDetailId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID detail brief tidak valid',
      });
    });
  });

  describe('validateGenerateBrief', () => {
    it('should call next() with valid data', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        toneOfVoice: 'Friendly',
        targetMarket: 'Young adults',
        count: 5,
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when ProductId is missing', () => {
      req.body = {
        funnelStage: FUNNEL_STAGE.AWARENESS,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ProductId is required',
        })
      );
    });

    it('should return error when ProductId is not a number', () => {
      req.body = {
        ProductId: 'abc',
        funnelStage: FUNNEL_STAGE.AWARENESS,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ProductId must be a valid number',
        })
      );
    });

    it('should return error when funnelStage is missing', () => {
      req.body = {
        ProductId: 1,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'FunnelStage is required',
        })
      );
    });

    it('should accept funnelStage as string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept funnelStage as array', () => {
      req.body = {
        ProductId: 1,
        funnelStage: [FUNNEL_STAGE.AWARENESS, FUNNEL_STAGE.CONSIDERATION],
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept funnelStage as comma-separated string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: `${FUNNEL_STAGE.AWARENESS},${FUNNEL_STAGE.CONSIDERATION}`,
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when funnelStage array is empty', () => {
      req.body = {
        ProductId: 1,
        funnelStage: [],
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'FunnelStage cannot be empty',
        })
      );
    });

    it('should return error when funnelStage contains invalid value', () => {
      req.body = {
        ProductId: 1,
        funnelStage: 'invalid_stage',
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid funnel stage'),
        })
      );
    });

    it('should handle funnelStage as non-string, non-array value', () => {
      req.body = {
        ProductId: 1,
        funnelStage: 123,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid funnel stage'),
        })
      );
    });

    it('should return error when count is less than 1', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        count: 0,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Count must be a number between 1 and 20',
        })
      );
    });

    it('should return error when count is greater than 20', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        count: 21,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Count must be a number between 1 and 20',
        })
      );
    });

    it('should accept count between 1 and 20', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        count: 10,
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when targetMarket is not a string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        targetMarket: 123,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'TargetMarket must be a string',
        })
      );
    });

    it('should return error when targetMarket is too long', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        targetMarket: 'A'.repeat(501),
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'TargetMarket must be less than 500 characters',
        })
      );
    });

    it('should return error when toneOfVoice is not a string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        toneOfVoice: 123,
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ToneOfVoice must be a string',
        })
      );
    });

    it('should return error when toneOfVoice is too long', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        toneOfVoice: 'A'.repeat(101),
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ToneOfVoice must be less than 100 characters',
        })
      );
    });

    it('should accept null briefType', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: null,
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept briefType as string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: 'Problem-Agitate-Solve',
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept briefType as comma-separated string', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: 'Problem-Agitate-Solve,Before-After-Bridge',
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept briefType as array', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: ['Problem-Agitate-Solve', 'Before-After-Bridge'],
      };

      validateGenerateBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when briefType array is empty', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: [],
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'BriefType cannot be empty if provided',
        })
      );
    });

    it('should return error when briefType comma-separated string results in empty array', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: '   ,  , ',
      };

      validateGenerateBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'BriefType cannot be empty if provided',
        })
      );
    });

    it('should handle briefType as non-string, non-array value', () => {
      req.body = {
        ProductId: 1,
        funnelStage: FUNNEL_STAGE.AWARENESS,
        briefType: 123,
      };

      validateGenerateBrief(req, res, next);

      // Should pass validation as briefType is optional and non-string/non-array is converted to array
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateUpdateBriefDetail', () => {
    it('should call next() with empty body (all fields optional)', () => {
      req.body = {};

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when platform is invalid', () => {
      req.body = {
        platform: 'InvalidPlatform',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Platform must be one of'),
        })
      );
    });

    it('should accept valid platforms', () => {
      const validPlatforms = ['TikTok', 'Instagram', 'Shopee', 'Meta', 'YouTube'];
      
      validPlatforms.forEach(platform => {
        req.body = { platform };
        jest.clearAllMocks();
        validateUpdateBriefDetail(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    it('should return error when tag is invalid', () => {
      req.body = {
        tag: 'invalid_tag',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Tag must be one of'),
        })
      );
    });

    it('should accept valid tags', () => {
      const validTags = ['video', 'carousel', 'image'];
      
      validTags.forEach(tag => {
        req.body = { tag };
        jest.clearAllMocks();
        validateUpdateBriefDetail(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    it('should return error when title is not a string', () => {
      req.body = {
        title: 123,
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Title must be a string',
        })
      );
    });

    it('should return error when title is empty', () => {
      req.body = {
        title: '',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Title cannot be empty',
        })
      );
    });

    it('should return error when title is only whitespace', () => {
      req.body = {
        title: '   ',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Title cannot be empty',
        })
      );
    });

    it('should accept title with exactly 255 characters', () => {
      req.body = {
        title: 'A'.repeat(255),
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when title is too long', () => {
      req.body = {
        title: 'A'.repeat(256),
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Title must be less than 255 characters',
        })
      );
    });

    it('should return error when funnel is invalid', () => {
      req.body = {
        funnel: 'invalid_funnel',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid funnel stage'),
        })
      );
    });

    it('should accept valid funnel value', () => {
      req.body = {
        funnel: FUNNEL_STAGE.AWARENESS,
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when cta is not a string', () => {
      req.body = {
        cta: 123,
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'CTA must be a string',
        })
      );
    });

    it('should return error when cta is too long', () => {
      req.body = {
        cta: 'A'.repeat(101),
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'CTA must be less than 100 characters',
        })
      );
    });

    it('should return error when detail is not an object', () => {
      req.body = {
        detail: 'not-an-object',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Detail must be an object',
        })
      );
    });

    it('should accept detail as object', () => {
      req.body = {
        detail: { breakdown: 'Test breakdown' },
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when caption is not a string', () => {
      req.body = {
        caption: 123,
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Caption must be a string',
        })
      );
    });

    it('should return error when caption is too long', () => {
      req.body = {
        caption: 'A'.repeat(2001),
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Caption must be less than 2000 characters',
        })
      );
    });

    it('should return error when hashtags is not an array', () => {
      req.body = {
        hashtags: 'not-an-array',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hashtags must be an array',
        })
      );
    });

    it('should return error when hashtag item is not a string', () => {
      req.body = {
        hashtags: [123, 'valid'],
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hashtag at index 0 must be a string',
        })
      );
    });

    it('should return error when hashtag item is too long', () => {
      req.body = {
        hashtags: ['A'.repeat(101)],
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hashtag at index 0 must be less than 100 characters',
        })
      );
    });

    it('should accept valid hashtags array', () => {
      req.body = {
        hashtags: ['tag1', 'tag2', 'tag3'],
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when status is invalid', () => {
      req.body = {
        status: 'invalid_status',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Status must be one of'),
        })
      );
    });

    it('should accept valid statuses', () => {
      const validStatuses = ['draft', 'ready', 'pending_approval', 'approved', 'rejected', 'scheduled'];
      
      validStatuses.forEach(status => {
        req.body = { status };
        jest.clearAllMocks();
        validateUpdateBriefDetail(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    it('should return error when scheduledAt is invalid date', () => {
      req.body = {
        scheduledAt: 'invalid-date',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledAt must be a valid date',
        })
      );
    });

    it('should accept valid scheduledAt', () => {
      req.body = {
        scheduledAt: new Date().toISOString(),
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept null scheduledAt', () => {
      req.body = {
        scheduledAt: null,
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept empty string scheduledAt', () => {
      req.body = {
        scheduledAt: '',
      };

      validateUpdateBriefDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateSubmitDetail', () => {
    it('should call next() with valid scheduledAt and scheduledTime', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      req.body = {
        scheduledAt: futureDate.toISOString().split('T')[0],
        scheduledTime: '14:30',
      };

      validateSubmitDetail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when scheduledAt is missing', () => {
      req.body = {
        scheduledTime: '14:30',
      };

      validateSubmitDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledAt and ScheduledTime are required for submission',
        })
      );
    });

    it('should return error when scheduledTime is missing', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      req.body = {
        scheduledAt: futureDate.toISOString().split('T')[0],
      };

      validateSubmitDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledAt and ScheduledTime are required for submission',
        })
      );
    });

    it('should return error when scheduledAt and scheduledTime create invalid date', () => {
      req.body = {
        scheduledAt: 'invalid-date',
        scheduledTime: '14:30',
      };

      validateSubmitDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid scheduled date or time format',
        })
      );
    });

    it('should return error when scheduled date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      req.body = {
        scheduledAt: pastDate.toISOString().split('T')[0],
        scheduledTime: '14:30',
      };

      validateSubmitDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Scheduled date cannot be in the past',
        })
      );
    });
  });
});

