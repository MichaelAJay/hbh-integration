import { Test, TestingModule } from '@nestjs/testing';
import { CrmError } from 'src/common/classes/custom-error.class';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { NutshellApiService } from './nutshell-api.service';

describe('H4H_NutshellApiService', () => {
  let service: NutshellApiService;

  const validRef = 'H4H' as ACCOUNT_REF;
  const invalidRef = 'INVALID_TEST' as ACCOUNT_REF;
  const invalidLeadId = '2324aZZ3Tt';

  const leadDetails1 = {
    lead: {
      products: [
        {
          id: '7',
          quantity: 27,
        },
        {
          id: '31',
          quantity: 3,
        },
        {
          id: '111',
          quantity: 1,
        },
        {
          id: '115',
          quantity: 1,
        },
        {
          id: '347',
          quantity: 1,
          price: {
            currency_shortname: 'USD',
            amount: '-103.09',
          },
        },
      ],
      description: 'EZ_CATER 6/12/23 Athens',
      customFields: {
        'Lead description':
          'This lead was generated from the EzManage order 2PT-ZHV',
      },
      stagesetId: '23',
    },
  };

  const leadDetails2 = {
    lead: {
      products: [
        {
          id: '15',
          quantity: 60,
        },
        {
          id: '347',
          quantity: 1,
          price: {
            currency_shortname: 'USD',
            amount: '-38.89',
          },
        },
      ],
      description: 'EZ_ORDER 6/7/23 Athens',
      customFields: {
        'Lead description':
          'This lead was generated from the EzManage order WPZ-PZT',
      },
      stagesetId: '1',
    },
  };

  const validCreateLead = {
    ref: validRef,
    orderName: 'TEST LEAD',
  };

  const validCreateLeadWithLeadDetails1 = {
    ...validCreateLead,
    lead: leadDetails1,
  };

  const validCreateLeadWithLeadDetails2 = {
    ...validCreateLead,
    lead: leadDetails2,
  };

  const leadToCreateWithLeadDetails2AndInvalidRef = {
    ref: invalidRef,
    lead: leadDetails2,
    orderName: 'TEST LEAD',
  };

  const leadIdsToDelete: string[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutshellApiService],
    }).compile();

    service = module.get<NutshellApiService>(NutshellApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create lead', async () => {
    /**
     * Test invalid lead creation
     */

    it('should fail because ref is not found', async () => {
      await expect(
        service.createLead(leadToCreateWithLeadDetails2AndInvalidRef),
      ).rejects.toThrow(CrmError);

      await expect(
        service.createLead(leadToCreateWithLeadDetails2AndInvalidRef),
      ).rejects.toHaveProperty(
        'message',
        `Client configuration variables not found for REF ${leadToCreateWithLeadDetails2AndInvalidRef.ref}`,
      );

      await expect(
        service.createLead(leadToCreateWithLeadDetails2AndInvalidRef),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it('should create a lead successfully', async () => {
      const leadId = await service.createLead(validCreateLeadWithLeadDetails2);
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      expect(leadId).toBeDefined();
      expect(typeof leadId).toBe('string');
    });
  });

  describe('get lead', async () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId,
        }),
      ).rejects.toThrow(CrmError);

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId,
        }),
      ).rejects.toHaveProperty(
        'message',
        `Client configuration variables not found for REF ${invalidRef}`,
      );

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId,
        }),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it("should fail to retrieve a lead that doesn't exist", async () => {
      const retrieveParamsWithInvalidLeadId = {
        leadId: invalidLeadId,
        ref: validRef,
      };

      await expect(
        service.getLead(retrieveParamsWithInvalidLeadId),
      ).rejects.toThrow(CrmError);

      await expect(
        service.getLead(retrieveParamsWithInvalidLeadId),
      ).rejects.toHaveProperty(
        'message',
        `Lead ${retrieveParamsWithInvalidLeadId.leadId} not found`,
      );

      await expect(
        service.getLead(retrieveParamsWithInvalidLeadId),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it('should retrieve a lead successfully', async () => {
      // Setup
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const { description, rev } = await service.getLead({
        leadId,
        ref: validRef,
      });
      expect(description).toBeDefined();
      expect(rev).toBeDefined();
      expect(typeof description).toBe('string');
      expect(typeof rev).toBe('string');
    });
  });

  describe('update lead', async () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const updateParamsWithInvalidRef = {
        ref: invalidRef,
        leadId,
        updates: leadDetails2,
      };

      await expect(
        service.updateLead(updateParamsWithInvalidRef),
      ).rejects.toThrow(CrmError);

      await expect(
        service.updateLead(updateParamsWithInvalidRef),
      ).rejects.toHaveProperty(
        'message',
        `Client configuration variables not found for REF ${invalidRef}`,
      );

      await expect(
        service.updateLead(updateParamsWithInvalidRef),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it("should fail to update a lead that doesn't exist", async () => {
      const updateParamsWithInvalidLeadId = {
        leadId: invalidLeadId,
        ref: validRef,
        updates: leadDetails1,
      };

      await expect(
        service.updateLead(updateParamsWithInvalidLeadId),
      ).rejects.toThrow(CrmError);

      await expect(
        service.updateLead(updateParamsWithInvalidLeadId),
      ).rejects.toHaveProperty(
        'message',
        `Lead ${updateParamsWithInvalidLeadId.leadId} not found`,
      );

      await expect(
        service.updateLead(updateParamsWithInvalidLeadId),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it('should create a lead and then update it successfully', async () => {
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails1,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const { description, rev } = await service.updateLead({
        leadId,
        ref: validRef,
        updates: leadDetails2,
      });

      expect(description).toBeDefined();
      expect(rev).toBeDefined();
      expect(typeof description).toBe('string');
      expect(typeof rev).toBe('string');
    });
  });

  describe('delete lead', async () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const deleteParamsWithInvalidRef = {
        ref: invalidRef,
        leadId,
      };

      await expect(
        service.deleteLead(deleteParamsWithInvalidRef),
      ).rejects.toThrow(CrmError);

      await expect(
        service.deleteLead(deleteParamsWithInvalidRef),
      ).rejects.toHaveProperty(
        'message',
        `Client configuration variables not found for REF ${invalidRef}`,
      );

      await expect(
        service.deleteLead(deleteParamsWithInvalidRef),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it("should fail to delete a lead that doesn't exist", async () => {
      const deleteParamsWithInvalidLeadId = {
        leadId: invalidLeadId,
        ref: validRef,
      };

      await expect(
        service.deleteLead(deleteParamsWithInvalidLeadId),
      ).rejects.toThrow(CrmError);

      await expect(
        service.deleteLead(deleteParamsWithInvalidLeadId),
      ).rejects.toHaveProperty(
        'message',
        `Lead ${deleteParamsWithInvalidLeadId.leadId} not found`,
      );

      await expect(
        service.deleteLead(deleteParamsWithInvalidLeadId),
      ).rejects.toHaveProperty('isLogged', true);
    });

    it('should successfully delete a lead', async () => {
      // Setup
      const leadId = await service.createLead({
        ref: validRef,
        lead: leadDetails1,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const didDelete = await service.deleteLead({ leadId, ref: validRef });
      expect(typeof didDelete).toBe('boolean');
      expect(didDelete).toBe(true);
    });
  });

  afterAll(async () => {
    for (const leadId of leadIdsToDelete) {
      await service.deleteLead({ leadId, ref: validRef });
    }
  });
});
