import { UserPurpose, UserType } from "@/models";

export interface AuthModel {
  token: string;
  refreshTokenExpiryTime?: string;
  refreshToken?: string;
  isAuthSuccessful?: boolean;
  isTfaEnabled?: boolean;
}

export interface UserAddressModel {
  addressLine: string;
  city: string;
  state: string;
  postCode: string;
}

export interface UserCommunicationModel {
  email: boolean;
  sms: boolean;
  phone: boolean;
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean;
  sendCopyToPersonalEmail?: boolean;
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean;
    youAreSentADirectMessage?: boolean;
    someoneAddsYouAsAsAConnection?: boolean;
    uponNewOrder?: boolean;
    newMembershipApproval?: boolean;
    memberRegistration?: boolean;
  };
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean;
    tipsOnGettingMoreOutOfKeen?: boolean;
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean;
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean;
    tipsOnStartBusinessProducts?: boolean;
  };
}

export interface UserSocialNetworksModel {
  linkedIn: string;
  facebook: string;
  twitter: string;
  instagram: string;
}

export interface UserModel {
  id: string;
  type?: UserType;
  purposes?: UserPurpose[] | null;
  userId?: string;
  userName: string;
  password: string | undefined;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  occupation?: string;
  companyName?: string;
  tenantId?: string;
  tenantName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roles?: Array<string>;
  permissions?: Array<string>;
  pic?: string;
  language?: 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'ru';
  timeZone?: string;
  website?: 'https://keenthemes.com';
  emailSettings?: UserEmailSettingsModel;
  auth?: AuthModel;
  communication?: UserCommunicationModel;
  address?: UserAddressModel;
  socialNetworks?: UserSocialNetworksModel;
  organizationUnitId?: string;
  organizationUnitCode?: string;
  chuyenGiaId?: string;
  businessId?: string;
  businessName?: string;
  businessTaxCode?: string;
  businessIsDraft?: boolean;
}

export interface UserProfile {
  onClose: () => void;
  userDetail: {
    id: string;
    type?: UserType;
    purposes?: UserPurpose[] | null;
    userId?: string;
    userName: string;
    password: string | undefined;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    occupation?: string;
    companyName?: string;
    tenantId?: string;
    tenantName?: string;
    phoneNumber?: string;
    isActive?: boolean;
    roles?: Array<string>;
    permissions?: Array<string>;
    pic?: string;
    language?: 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'ru';
    timeZone?: string;
    website?: 'https://keenthemes.com';
    emailSettings?: UserEmailSettingsModel;
    auth?: AuthModel;
    communication?: UserCommunicationModel;
    address?: UserAddressModel;
    socialNetworks?: UserSocialNetworksModel;
    organizationUnitId?: string;
  };
}
