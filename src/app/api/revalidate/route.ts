import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Triggers on-demand ISR revalidation across the storefront routes so that
 * any edits made in the admin console immediately reflect on the live site.
 */
export async function POST() {
  try {
    // Revalidate the entire storefront layout and individual pages
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/shop/[slug]", "page");
    revalidatePath("/care-guide", "page");
    revalidatePath("/faq", "page");
    revalidatePath("/about", "page");

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      message: "Storefront cache successfully purged",
    });
  } catch (error: any) {
    console.error("Cache revalidation error:", error);
    return NextResponse.json(
      { revalidated: false, error: error?.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
