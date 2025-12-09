export interface Category {
  id: number;
  name: string;
}

export interface Seller {
  id: number;
  cnpj: string;
  sales: number;
  balance: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  specification?: string;
  price: number;
  stock: number;
  imageURL: string[];
  category?: Category;
  seller?: Seller;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  user?: {
    id: number;
    username: string;
    enabled: boolean;
  };
  seller?: Seller;
}

export interface Address {
  id: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  additionalInfo?: string;
  home: boolean;
  contactName?: string;
  contactPhone?: string;
  client?: Client;
  
  city?: string;
  state?: string;
  neighborhood?: string;
}

export interface LoginResponse {
  token: string;
}

export interface SessionUser {
  id?: number;
  name?: string;
  email: string;
  token: string;
  phone?: string;
  cpf?: string;
  isGuest?: boolean;
  isAdmin?: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  shipping?: number;
}