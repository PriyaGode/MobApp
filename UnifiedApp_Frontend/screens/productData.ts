export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
};

export type ProductInfo = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceValue: number;
  unit: string;
  cardImage: string;
  heroImages: string[];
  description: string;
  detailItems: { label: string; value: string }[];
  tasteNotes: string[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  varietyCategory: string;
  weightCategory: string;
  isOrganic: boolean;
  stock?: number;
};

export const productCatalog: ProductInfo[] = [
  {
    id: "alphonso",
    name: "Alphonso Mango",
    subtitle: "Ratnagiri's Finest",
    price: "$24.99",
    priceValue: 24.99,
    unit: "Dozen",
    cardImage:
      "https://image.pollinations.ai/prompt/hyperreal%20alphonso%20mango%20pyramid%20on%20brass%20plate",
    heroImages: [
      "https://image.pollinations.ai/prompt/sunlit%20mango%20orchard%20baskets%2C%20volumetric%20light",
      "https://image.pollinations.ai/prompt/macro%20mango%20leaf%20with%20dewdrops%20and%20fruit",
      "https://image.pollinations.ai/prompt/botanical%20illustration%20of%20mango%20blossom%20and%20fruit",
    ],
    description:
      "Experience the divine taste of authentic Ratnagiri Alphonso mangoes. Known for their rich flavor, creamy texture, and unparalleled aroma, each mango is hand-picked at peak ripeness from our certified farms.",
    detailItems: [
      { label: "Variety", value: "Alphonso (Hapus)" },
      { label: "Origin", value: "Ratnagiri, Maharashtra" },
      { label: "Average Weight", value: "250–300 g per piece" },
      { label: "Certification", value: "GI Tagged" },
    ],
    tasteNotes: ["High Sweetness", "Low Acidity", "Fiberless", "Rich Aroma"],
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      {
        id: "r1",
        author: "Priya S.",
        rating: 5,
        comment: "Absolutely the best mangoes I've ever had. The sweetness and aroma are just perfect. Worth every penny!",
      },
      {
        id: "r2",
        author: "Rohan M.",
        rating: 4,
        comment: "Great quality and fast delivery. One mango was slightly bruised, but the rest were flawless.",
      },
      {
        id: "r3",
        author: "Anjali K.",
        rating: 5,
        comment: "Fresh and delicious! Exactly what I was looking for. Will definitely order again.",
      },
      {
        id: "r4",
        author: "Vikram P.",
        rating: 5,
        comment: "Premium quality mangoes. The taste is incredible and they arrived in perfect condition.",
      },
      {
        id: "r5",
        author: "Neha D.",
        rating: 4,
        comment: "Very good quality. A bit pricey but the taste justifies it. Highly recommended!",
      },
      {
        id: "r6",
        author: "Arjun T.",
        rating: 5,
        comment: "Best mangoes in the market. The flavor is authentic and natural. Love it!",
      },
      {
        id: "r7",
        author: "Sneha M.",
        rating: 4,
        comment: "Good quality and taste. Packaging was excellent. Arrived fresh and ready to eat.",
      },
      {
        id: "r8",
        author: "Rajesh V.",
        rating: 5,
        comment: "Outstanding! These are the finest mangoes I've tasted. Highly satisfied with the purchase.",
      },
      {
        id: "r9",
        author: "Pooja N.",
        rating: 4,
        comment: "Very satisfied with the quality. Sweet and juicy. Will order more next season.",
      },
      {
        id: "r10",
        author: "Amit S.",
        rating: 5,
        comment: "Exceptional quality and taste. Delivery was prompt. Highly recommended to all mango lovers!",
      },
    ],
    varietyCategory: "Alphonso",
    weightCategory: "Standard (200-300 g)",
    isOrganic: true,
  },
  {
    id: "kesar",
    name: "Kesar Mango",
    subtitle: "Saffron-Hued Goodness",
    price: "$22.00",
    priceValue: 22,
    unit: "Dozen",
    cardImage:
      "https://image.pollinations.ai/prompt/cinematic%20kesar%20mango%20halves%20on%20silk%20cloth",
    heroImages: [
      "https://image.pollinations.ai/prompt/organic%20mango%20crate%20watercolor%20style",
      "https://image.pollinations.ai/prompt/close-up%20mango%20cubes%20dripping%20honey",
      "https://image.pollinations.ai/prompt/cyberpunk%20mango%20market%20at%20midnight",
    ],
    description:
      "Sweet, aromatic, and deeply flavorful, our Kesar mangoes bring a saffron-like hue and velvety texture to every bite.",
    detailItems: [
      { label: "Variety", value: "Kesar" },
      { label: "Origin", value: "Gir, Gujarat" },
      { label: "Average Weight", value: "200–250 g per piece" },
      { label: "Certification", value: "Farm Traceable" },
    ],
    tasteNotes: ["Balanced Sweetness", "Creamy", "Bright Aroma"],
    rating: 4.7,
    reviewCount: 86,
    reviews: [
      {
        id: "r1",
        author: "Nisha T.",
        rating: 5,
        comment: "Reminds me of summers back home. Super juicy and fragrant!",
      },
      {
        id: "r2",
        author: "Arjun P.",
        rating: 4,
        comment: "Great taste, though delivery took an extra day.",
      },
      {
        id: "r3",
        author: "Meera L.",
        rating: 5,
        comment: "Excellent quality. The mangoes were perfectly ripe and sweet.",
      },
      {
        id: "r4",
        author: "Suresh K.",
        rating: 5,
        comment: "Best Kesar mangoes I've bought online. Highly satisfied!",
      },
      {
        id: "r5",
        author: "Divya R.",
        rating: 4,
        comment: "Good taste and quality. Packaging could be better.",
      },
      {
        id: "r6",
        author: "Karthik M.",
        rating: 5,
        comment: "Amazing flavor! These are the real deal. Will order again.",
      },
      {
        id: "r7",
        author: "Priya V.",
        rating: 4,
        comment: "Very good quality. Fresh and delicious. Recommended!",
      },
      {
        id: "r8",
        author: "Ravi S.",
        rating: 5,
        comment: "Perfect mangoes! Great taste and aroma. Worth the price.",
      },
      {
        id: "r9",
        author: "Anjana K.",
        rating: 4,
        comment: "Good quality mangoes. Arrived in good condition.",
      },
      {
        id: "r10",
        author: "Sanjay T.",
        rating: 5,
        comment: "Fantastic! These are premium quality mangoes. Highly recommended!",
      },
    ],
    varietyCategory: "Kesar",
    weightCategory: "Standard (200-300 g)",
    isOrganic: true,
  },
  {
    id: "pickle",
    name: "Mango Pickle",
    subtitle: "Handcrafted Small Batches",
    price: "$8.00",
    priceValue: 8,
    unit: "500 g",
    cardImage:
      "https://image.pollinations.ai/prompt/artisan%20mango%20pickle%20jars%20with%20glowing%20spices",
    heroImages: [
      "https://image.pollinations.ai/prompt/rustic%20mango%20pickle%20masala%20still%20life%2C%20clay%20jars",
      "https://image.pollinations.ai/prompt/artisan%20mango%20chutney%20labels%20in%20studio%20light",
    ],
    description:
      "Traditional family recipe pickle made with sun-cured raw mangoes, cold-pressed mustard oil, and fragrant spices.",
    detailItems: [
      { label: "Heat Level", value: "Medium" },
      { label: "Shelf Life", value: "12 months" },
      { label: "Packaging", value: "Glass Jar" },
      { label: "Allergens", value: "Mustard" },
    ],
    tasteNotes: ["Tangy", "Spiced", "Smoky"],
    rating: 4.6,
    reviewCount: 52,
    reviews: [
      {
        id: "r1",
        author: "Lata V.",
        rating: 5,
        comment: "Exactly like my grandmother's pickle. Goes with everything!",
      },
      {
        id: "r2",
        author: "Daniel K.",
        rating: 4,
        comment: "Tasty and authentic, though a bit oily for my preference.",
      },
      {
        id: "r3",
        author: "Kavya S.",
        rating: 5,
        comment: "Authentic taste! Perfect with rice and dal. Highly satisfied.",
      },
      {
        id: "r4",
        author: "Mohan R.",
        rating: 4,
        comment: "Good quality pickle. Taste is traditional and authentic.",
      },
      {
        id: "r5",
        author: "Sunita P.",
        rating: 5,
        comment: "Best homemade pickle I've tasted. Absolutely delicious!",
      },
      {
        id: "r6",
        author: "Arun K.",
        rating: 4,
        comment: "Very good pickle. Spices are well balanced.",
      },
      {
        id: "r7",
        author: "Geeta M.",
        rating: 5,
        comment: "Excellent quality and taste. Will order again!",
      },
      {
        id: "r8",
        author: "Prakash T.",
        rating: 4,
        comment: "Good pickle with authentic flavor. Recommended.",
      },
      {
        id: "r9",
        author: "Isha N.",
        rating: 5,
        comment: "Perfect pickle! Great taste and quality. Love it!",
      },
      {
        id: "r10",
        author: "Vikram S.",
        rating: 4,
        comment: "Authentic and tasty. Good value for money.",
      },
    ],
    varietyCategory: "Pantry & Staples",
    weightCategory: "Bulk (>300 g)",
    isOrganic: false,
  },
  {
    id: "lassi",
    name: "Mango Lassi",
    subtitle: "Creamy & Refreshing",
    price: "$5.00",
    priceValue: 5,
    unit: "Bottle",
    cardImage:
      "https://image.pollinations.ai/prompt/refreshing%20mango%20lassi%20splash%20in%20crystal%20glass",
    heroImages: [
      "https://image.pollinations.ai/prompt/mango%20sorbet%20swirl%20in%20frosted%20bowl",
      "https://image.pollinations.ai/prompt/luxury%20mango%20dessert%20platter%20with%20smoke",
    ],
    description:
      "Silky mango yogurt blend with cardamom undertones. Served chilled, perfect for sunny afternoons.",
    detailItems: [
      { label: "Dairy", value: "Organic Cow Milk" },
      { label: "Sweetener", value: "Cane Sugar" },
      { label: "Serving Temp", value: "4°C" },
      { label: "Shelf Life", value: "5 days refrigerated" },
    ],
    tasteNotes: ["Creamy", "Refreshing", "Lightly Spiced"],
    rating: 4.5,
    reviewCount: 64,
    reviews: [
      {
        id: "r1",
        author: "Sara G.",
        rating: 5,
        comment: "Perfect balance of mango and yogurt. Not overly sweet.",
      },
      {
        id: "r2",
        author: "Imran H.",
        rating: 4,
        comment: "Delicious but wish the bottles were slightly bigger.",
      },
      {
        id: "r3",
        author: "Zara M.",
        rating: 5,
        comment: "Refreshing and tasty! Perfect for hot summer days.",
      },
      {
        id: "r4",
        author: "Nikhil P.",
        rating: 4,
        comment: "Good taste and quality. Very refreshing.",
      },
      {
        id: "r5",
        author: "Priya K.",
        rating: 5,
        comment: "Excellent lassi! Creamy and delicious. Highly recommended!",
      },
      {
        id: "r6",
        author: "Rahul S.",
        rating: 4,
        comment: "Good quality and taste. Perfect for summer.",
      },
      {
        id: "r7",
        author: "Ananya D.",
        rating: 5,
        comment: "Best mango lassi! Authentic taste and quality.",
      },
      {
        id: "r8",
        author: "Siddharth M.",
        rating: 4,
        comment: "Very refreshing and tasty. Good value.",
      },
      {
        id: "r9",
        author: "Neha S.",
        rating: 5,
        comment: "Perfect! Creamy, sweet, and refreshing. Love it!",
      },
      {
        id: "r10",
        author: "Aryan K.",
        rating: 4,
        comment: "Good quality lassi. Tastes fresh and authentic.",
      },
    ],
    varietyCategory: "Beverages",
    weightCategory: "Light (<200 g)",
    isOrganic: false,
  },
];
