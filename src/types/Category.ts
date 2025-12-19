import { ProductUI } from "./Product";

export type CategoryData = {
    id: number;
    name: string;
    products: ProductUI[];
    offset: number;
    loading: boolean;
    hasMore: boolean;
};