export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  lead_time: string;
  care_instructions: string;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  categories?: Category; // Joined data
}

export interface CustomInquiry {
  idea_description: string;
  preferred_colors: string;
  estimated_size: string;
  target_date: string;
}
