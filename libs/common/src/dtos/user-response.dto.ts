export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
