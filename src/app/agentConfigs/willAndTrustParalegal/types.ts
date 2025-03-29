export interface EstatePlanData {
  basicInfo?: {
    fullName?: string;
    maritalStatus?: string;
    spouseName?: string;
    hasMinorChildren?: boolean;
    hasCharitableBequests?: boolean;
    // Additional basic information
    dateOfBirth?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    citizenship?: string;
    previousMarriages?: boolean;
    previousMarriageDetails?: string;
    hasPrenuptialAgreement?: boolean;
  };
  minorChildren?: {
    children?: Array<{
      name: string;
      age: number;
      specialNeeds?: boolean;
      relationship?: string; // biological, adopted, stepchild
    }>;
    guardianName?: string;
    alternateGuardian?: string;
    separatePropertyGuardian?: boolean;
    propertyGuardianName?: string;
    trustAge?: number;
    staggeredDistribution?: boolean;
    staggeredSchedule?: string;
    trustDetails?: string;
    specialNeeds?: boolean;
    specialNeedsDetails?: string;
  };
  charitableGiving?: {
    wantsCharity?: boolean;
    charities?: Array<{
      name: string;
      amount: string;
      purposeRestriction?: string;
      fallbackInstructions?: string;
    }>;
    charitableRemainderTrust?: boolean;
    askedAboutMoreCharities?: boolean;
    isConfirmed?: boolean;
  };
  assets?: {
    realEstate?: Array<{
      address: string;
      approximateValue: string;
      ownershipType: string;
      mortgageBalance?: string;
      isCommunityProperty?: boolean;
    }>;
    bankAccounts?: Array<{
      institution: string;
      accountType: string;
      approximateValue: string;
      ownership?: string; // sole, joint, POD
      beneficiaries?: string;
    }>;
    investments?: Array<{
      type: string;
      institution: string;
      approximateValue: string;
      ownership?: string;
      beneficiaries?: string;
    }>;
    retirementAccounts?: Array<{
      type: string; // 401(k), IRA, Roth IRA, etc.
      institution: string;
      approximateValue: string;
      beneficiaries?: string;
    }>;
    lifeInsurance?: Array<{
      company: string;
      policyNumber?: string;
      type?: string; // term, whole life
      faceAmount: string;
      beneficiaries: string;
    }>;
    businessInterests?: Array<{
      name: string;
      type: string; // LLC, Corporation, Partnership
      ownershipPercentage: string;
      approximateValue: string;
      hasBuySellAgreement?: boolean;
    }>;
    personalProperty?: Array<{
      description: string;
      approximateValue: string;
      specialInstructions?: string;
    }>;
    digitalAssets?: Array<{
      description: string;
      accessInstructions?: string;
    }>;
  };
  distribution?: {
    primaryBeneficiaries?: Array<{
      name: string;
      relationship: string;
      share: string;
      contingentBeneficiaries?: Array<{
        name: string;
        relationship: string;
        share: string;
      }>;
    }>;
    alternativeBeneficiaries?: Array<{
      name: string;
      relationship: string;
      share: string;
    }>;
    specificBequests?: Array<{
      item: string;
      recipient: string;
      alternateRecipient?: string;
    }>;
    residuaryEstate?: {
      distribution: string;
      contingencyPlan?: string;
    };
  };
  executorTrustee?: {
    executorName?: string;
    alternatExecutor?: string;
    trusteeName?: string;
    alternateTrustee?: string;
    guardianOfEstate?: string;
    powersOfAttorney?: {
      financialPOA?: string;
      healthcarePOA?: string;
    };
  };
  specialProvisions?: {
    petProvisions?: {
      hasPets?: boolean;
      petDetails?: string;
      caregiverName?: string;
      petTrust?: boolean;
      petTrustAmount?: string;
    };
    burialInstructions?: {
      hasBurialInstructions?: boolean;
      instructions?: string;
      prepaidArrangements?: boolean;
    };
    digitalAssetInstructions?: string;
    otherSpecialInstructions?: string;
  };
  // Dynamic Q&A section to store additional questions and answers that don't fit in predefined categories
  dynamicQA?: Record<string, string>;
} 