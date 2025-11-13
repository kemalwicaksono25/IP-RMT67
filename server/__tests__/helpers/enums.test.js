const enums = require('../../helpers/enums');

describe('Enums Helper', () => {
  describe('USER_ROLE', () => {
    it('should have ADMIN role', () => {
      expect(enums.USER_ROLE.ADMIN).toBe('admin');
    });

    it('should have STAFF role', () => {
      expect(enums.USER_ROLE.STAFF).toBe('staff');
    });

    it('should have all expected user roles', () => {
      expect(Object.keys(enums.USER_ROLE)).toEqual(['ADMIN', 'STAFF']);
    });
  });

  describe('BRIEF_STATUS', () => {
    it('should have all expected brief statuses', () => {
      expect(enums.BRIEF_STATUS.DRAFT).toBe('draft');
      expect(enums.BRIEF_STATUS.READY).toBe('ready');
      expect(enums.BRIEF_STATUS.PENDING_APPROVAL).toBe('pending_approval');
      expect(enums.BRIEF_STATUS.APPROVED).toBe('approved');
      expect(enums.BRIEF_STATUS.REJECTED).toBe('rejected');
      expect(enums.BRIEF_STATUS.SCHEDULED).toBe('scheduled');
    });

    it('should have all expected keys', () => {
      const expectedKeys = ['DRAFT', 'READY', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED'];
      expect(Object.keys(enums.BRIEF_STATUS)).toEqual(expectedKeys);
    });
  });

  describe('BRIEF_DETAIL_STATUS', () => {
    it('should have same values as BRIEF_STATUS', () => {
      expect(enums.BRIEF_DETAIL_STATUS.DRAFT).toBe(enums.BRIEF_STATUS.DRAFT);
      expect(enums.BRIEF_DETAIL_STATUS.READY).toBe(enums.BRIEF_STATUS.READY);
      expect(enums.BRIEF_DETAIL_STATUS.PENDING_APPROVAL).toBe(enums.BRIEF_STATUS.PENDING_APPROVAL);
      expect(enums.BRIEF_DETAIL_STATUS.APPROVED).toBe(enums.BRIEF_STATUS.APPROVED);
      expect(enums.BRIEF_DETAIL_STATUS.REJECTED).toBe(enums.BRIEF_STATUS.REJECTED);
      expect(enums.BRIEF_DETAIL_STATUS.SCHEDULED).toBe(enums.BRIEF_STATUS.SCHEDULED);
    });

    it('should have all expected keys', () => {
      const expectedKeys = ['DRAFT', 'READY', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED'];
      expect(Object.keys(enums.BRIEF_DETAIL_STATUS)).toEqual(expectedKeys);
    });
  });

  describe('FUNNEL_STAGE', () => {
    it('should have all expected funnel stages', () => {
      expect(enums.FUNNEL_STAGE.AWARENESS).toBe('awareness');
      expect(enums.FUNNEL_STAGE.CONSIDERATION).toBe('consideration');
      expect(enums.FUNNEL_STAGE.RETARGETING_VISITOR).toBe('retargeting_visitor');
      expect(enums.FUNNEL_STAGE.RETARGETING_ATC_NOT_PURCHASE).toBe('retargeting_atc_not_purchase');
      expect(enums.FUNNEL_STAGE.AFTER_PURCHASE).toBe('after_purchase');
      expect(enums.FUNNEL_STAGE.REVENUE).toBe('revenue');
      expect(enums.FUNNEL_STAGE.LOYALTY).toBe('loyalty');
    });

    it('should have all expected keys', () => {
      const expectedKeys = [
        'AWARENESS',
        'CONSIDERATION',
        'RETARGETING_VISITOR',
        'RETARGETING_ATC_NOT_PURCHASE',
        'AFTER_PURCHASE',
        'REVENUE',
        'LOYALTY',
      ];
      expect(Object.keys(enums.FUNNEL_STAGE)).toEqual(expectedKeys);
    });
  });

  describe('CONTENT_TAG', () => {
    it('should have all expected content tags', () => {
      expect(enums.CONTENT_TAG.VIDEO).toBe('video');
      expect(enums.CONTENT_TAG.CAROUSEL).toBe('carousel');
      expect(enums.CONTENT_TAG.IMAGE).toBe('image');
    });

    it('should have all expected keys', () => {
      const expectedKeys = ['VIDEO', 'CAROUSEL', 'IMAGE'];
      expect(Object.keys(enums.CONTENT_TAG)).toEqual(expectedKeys);
    });
  });
});

