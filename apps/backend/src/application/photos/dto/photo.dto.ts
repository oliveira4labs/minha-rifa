export interface AuthorizePrivatePhotoInput {
  userId: number | null;
  filename: string;
}

export interface PrivatePhotoDto {
  filename: string;
}
