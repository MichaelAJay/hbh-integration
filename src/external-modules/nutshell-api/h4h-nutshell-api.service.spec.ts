import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CrmError } from 'src/common/classes/custom-error.class';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { NutshellApiService } from './nutshell-api.service';

describe('H4H_NutshellApiService', () => {
  let service: NutshellApiService;

  const validRef = 'H4H' as ACCOUNT_REF;
  const invalidRef = 'INVALID_TEST' as ACCOUNT_REF;
  const invalidLeadId = 1211221;

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
      imports: [
        ConfigModule.forRoot(),
        CacheModule.register({}),
        CustomLoggerModule,
      ],
      providers: [NutshellApiService],
    }).compile();

    service = module.get<NutshellApiService>(NutshellApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create lead', () => {
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
      const { id: leadId } = await service.createLead(
        validCreateLeadWithLeadDetails2,
      );
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      expect(leadId).toBeDefined();
      expect(typeof leadId).toBe('string');
    });
  });

  describe('get lead', () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId: parseInt(leadId, 10),
        }),
      ).rejects.toThrow(CrmError);

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId: parseInt(leadId, 10),
        }),
      ).rejects.toHaveProperty(
        'message',
        `Client configuration variables not found for REF ${invalidRef}`,
      );

      await expect(
        service.getLead({
          ref: invalidRef,
          leadId: parseInt(leadId, 10),
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
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const { description, rev } = await service.getLead({
        leadId: parseInt(leadId, 10),
        ref: validRef,
      });
      expect(description).toBeDefined();
      expect(rev).toBeDefined();
      expect(typeof description).toBe('string');
      expect(typeof rev).toBe('string');
    });
  });

  describe('update lead', () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const updateParamsWithInvalidRef = {
        ref: invalidRef,
        leadId: parseInt(leadId, 10),
        lead: leadDetails2,
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
        lead: leadDetails1,
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
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails1,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const { description } = await service.updateLead({
        leadId: parseInt(leadId, 10),
        ref: validRef,
        lead: leadDetails2,
      });

      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
    });
  });

  describe('delete lead', () => {
    it('should fail because ref is not found', async () => {
      // Setup
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails2,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const deleteParamsWithInvalidRef = {
        ref: invalidRef,
        leadId: parseInt(leadId, 10),
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
      const { id: leadId } = await service.createLead({
        ref: validRef,
        lead: leadDetails1,
        orderName: 'TEST LEAD',
      });
      expect(typeof leadId).toBe('string');
      if (typeof leadId === 'string') leadIdsToDelete.push(leadId);

      const didDelete = await service.deleteLead({
        leadId: parseInt(leadId, 10),
        ref: validRef,
      });
      expect(typeof didDelete).toBe('boolean');
      expect(didDelete).toBe(true);
    });
  });

  afterAll(async () => {
    for (const leadId of leadIdsToDelete) {
      await service.deleteLead({ leadId: parseInt(leadId, 10), ref: validRef });
    }
  }, 10000);
});
