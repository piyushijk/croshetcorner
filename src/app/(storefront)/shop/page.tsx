import { createServerSupabase } from "@/lib/supabase/server";
import ProductCard from "@/components/storefront/ProductCard";
import { mockProducts, mockCategories } from "@/lib/mock-data";

export const revalidate = 60; // Disable cache so edits show instantly

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams;
  const supabase = createServerSupabase();
  
  // Fetch categories for pills
  const { data: dbCategories, error: catError } = await supabase.from('categories').select('*');
  let categories = dbCategories;
  if (catError || !dbCategories || dbCategories.length === 0) {
    categories = mockCategories;
  }
  
  // Fetch products based on category filter
  let query = supabase.from('products').select('*, categories(*)');
  if (category && category !== 'all') {
    query = query.eq('categories.slug', category);
  }
  
  const { data: dbProducts, error } = await query.order('created_at', { ascending: false });
  let products = dbProducts;
  if (error || !dbProducts || dbProducts.length === 0) {
    products = mockProducts;
    if (category && category !== 'all') {
      products = mockProducts.filter((p: any) => p.categories?.slug === category);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">Catalog</h1>
      
      {/* Filters */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar -mx-4 px-4">
        <a href="/shop?category=all" className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors ${!category || category === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border/50 text-muted-foreground hover:bg-accent'}`}>
          All
        </a>
        {categories?.map(cat => (
          <a key={cat.id} href={`/shop?category=${cat.slug}`} className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors ${category === cat.slug ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border/50 text-muted-foreground hover:bg-accent'}`}>
            {cat.name}
          </a>
        ))}
      </div>

      {/* Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/50 shadow-sm flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-lg mb-6">No items found in this category yet. Check back soon!</p>
          <a href="/shop?category=all" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            View All Products
          </a>
        </div>
      )}
    </div>
  );
}
