export interface ProfileDto {
  name: string;
  lastName: string;
  userName: string;
  email?: string;
  avatar?: string;
  usePhoto?: boolean;
  verificationLevel: number;
}
