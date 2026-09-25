export interface Guest {
  id: number;
  name: string;
  nameKH: string;
  gender: string;
  dob?: string;
  address?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  ssn?: string;
  passport?: string;
  status?: string;
  imagePath?: string;
}

export interface GuestReq {
  name: string;
  nameKH: string;
  gender: string;
  dob?: string;
  address?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  ssn?: string;
  passport?: string;
  status?: string;
  image?: File | null;
}
