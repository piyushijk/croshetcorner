export default function CareGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-center">Care Guide</h1>
      
      <div className="prose prose-lg prose-headings:font-serif prose-headings:text-rosewood mx-auto text-foreground/80">
        <p className="lead text-xl mb-8">
          Handmade crochet items are delicate and require special care to ensure they last a lifetime. Follow these guidelines to keep your pieces looking beautiful.
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">Washing Instructions</h3>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li><strong>Hand Wash Only:</strong> Submerge your item in cool water mixed with a small amount of mild baby shampoo or gentle wool detergent.</li>
          <li><strong>Do Not Wring:</strong> Gently squeeze the water out without twisting or wringing the yarn, which can ruin the shape.</li>
          <li><strong>Spot Clean:</strong> For small stains, dab gently with a damp cloth. Do not scrub.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">Drying & Shaping</h3>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li><strong>Lay Flat to Dry:</strong> Always dry crochet items flat on a clean, dry towel. Hanging them will stretch the yarn out of shape.</li>
          <li><strong>Keep Out of Direct Sun:</strong> Drying in direct harsh sunlight can fade the beautiful pastel colors over time.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">Storage</h3>
        <p>
          Store your pieces folded in a breathable cotton bag or drawer. Avoid hanging wearables like cardigans or heavy bags, as gravity will stretch the stitches.
        </p>
      </div>
    </div>
  );
}
