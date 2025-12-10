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
  specification?: string;
  description: string;
  price: number;
  stock: number;
  imageURL: string[];
  category?: Category;
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
}

export interface UserAuth {
  id: number;
  username: string;
  enabled: boolean;
  authorities: Array<{ authority: string }>;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
}

export interface CartItem {
  id: number;
  isSelected: boolean;
  quantity: number;
  subtotal: number;
  product: Product;
}

export interface Cart {
  id: number;
  totalPrice: number;
  items: CartItem[];
}

export interface Client {
  id: number | null;
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  
  user?: UserAuth;
  seller?: Seller;
  addresses?: Address[];
  cart?: Cart | null;
}


export interface LoginResponse {
  token: string; 
}

export interface ClientRequest {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  phone: string;
}