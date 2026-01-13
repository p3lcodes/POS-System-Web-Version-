export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: 'pcs' | 'kg' | 'g' | 'bottles' | 'sachets' | 'trays' | 'liters';
  stock: number;
  barcode: string;
  image: string;
  lowStockThreshold: number;
}

export const categories = [
  'Bakery',
  'Beverages',
  'Dairy',
  'Snacks',
  'Personal Care',
  'Cleaning',
  'Cooking',
  'Meat',
  'Vegetables',
  'Fruits',
];

export const initialProducts: Product[] = [
  // Bakery & Flour
  { id: 1, name: "Soko Maize Flour 2kg", category: "Bakery", price: 175, unit: "pcs", stock: 45, barcode: "100001", image: "🌽", lowStockThreshold: 10 },
  { id: 2, name: "Jogoo Maize Flour 2kg", category: "Bakery", price: 185, unit: "pcs", stock: 38, barcode: "100002", image: "🌽", lowStockThreshold: 10 },
  { id: 3, name: "Pembe Maize Flour 2kg", category: "Bakery", price: 180, unit: "pcs", stock: 42, barcode: "100003", image: "🌽", lowStockThreshold: 10 },
  { id: 4, name: "Exe Wheat Flour 2kg", category: "Bakery", price: 195, unit: "pcs", stock: 25, barcode: "100004", image: "🌾", lowStockThreshold: 8 },
  { id: 5, name: "Broadways Bread 400g", category: "Bakery", price: 55, unit: "pcs", stock: 30, barcode: "100005", image: "🍞", lowStockThreshold: 10 },
  
  // Beverages
  { id: 6, name: "Coca-Cola 500ml", category: "Beverages", price: 70, unit: "bottles", stock: 120, barcode: "100006", image: "🥤", lowStockThreshold: 24 },
  { id: 7, name: "Fanta Orange 500ml", category: "Beverages", price: 70, unit: "bottles", stock: 96, barcode: "100007", image: "🧃", lowStockThreshold: 24 },
  { id: 8, name: "Sprite 500ml", category: "Beverages", price: 70, unit: "bottles", stock: 84, barcode: "100008", image: "🥤", lowStockThreshold: 24 },
  { id: 9, name: "Krest Bitter Lemon 500ml", category: "Beverages", price: 75, unit: "bottles", stock: 48, barcode: "100009", image: "🍋", lowStockThreshold: 12 },
  { id: 10, name: "Minute Maid Mango 1L", category: "Beverages", price: 150, unit: "bottles", stock: 36, barcode: "100010", image: "🥭", lowStockThreshold: 10 },
  { id: 11, name: "Afia Mango Juice 500ml", category: "Beverages", price: 85, unit: "bottles", stock: 60, barcode: "100011", image: "🥭", lowStockThreshold: 15 },
  { id: 12, name: "Ketepa Pride Tea 100g", category: "Beverages", price: 145, unit: "pcs", stock: 40, barcode: "100012", image: "🍵", lowStockThreshold: 10 },
  { id: 13, name: "Dormans Coffee 100g", category: "Beverages", price: 320, unit: "pcs", stock: 25, barcode: "100013", image: "☕", lowStockThreshold: 8 },
  
  // Dairy
  { id: 14, name: "Brookside Fresh Milk 500ml", category: "Dairy", price: 65, unit: "bottles", stock: 50, barcode: "100014", image: "🥛", lowStockThreshold: 15 },
  { id: 15, name: "KCC Fresh Milk 500ml", category: "Dairy", price: 60, unit: "bottles", stock: 45, barcode: "100015", image: "🥛", lowStockThreshold: 15 },
  { id: 16, name: "Tuzo Yoghurt Strawberry 250ml", category: "Dairy", price: 55, unit: "pcs", stock: 35, barcode: "100016", image: "🍓", lowStockThreshold: 10 },
  { id: 17, name: "Daima Butter 250g", category: "Dairy", price: 280, unit: "pcs", stock: 20, barcode: "100017", image: "🧈", lowStockThreshold: 5 },
  { id: 18, name: "Bio Fresh Eggs 1 Tray", category: "Dairy", price: 420, unit: "trays", stock: 15, barcode: "100018", image: "🥚", lowStockThreshold: 5 },
  
  // Cooking Essentials
  { id: 19, name: "Elianto Cooking Oil 2L", category: "Cooking", price: 620, unit: "bottles", stock: 28, barcode: "100019", image: "🫒", lowStockThreshold: 8 },
  { id: 20, name: "Rina Sunflower Oil 2L", category: "Cooking", price: 580, unit: "bottles", stock: 32, barcode: "100020", image: "🌻", lowStockThreshold: 8 },
  { id: 21, name: "Cowboy Sugar 1kg", category: "Cooking", price: 165, unit: "pcs", stock: 55, barcode: "100021", image: "🍬", lowStockThreshold: 15 },
  { id: 22, name: "Kensalt Table Salt 1kg", category: "Cooking", price: 45, unit: "pcs", stock: 70, barcode: "100022", image: "🧂", lowStockThreshold: 20 },
  { id: 23, name: "Royco Beef Cubes 12pcs", category: "Cooking", price: 85, unit: "pcs", stock: 65, barcode: "100023", image: "🍲", lowStockThreshold: 15 },
  { id: 24, name: "Pilau Masala 100g", category: "Cooking", price: 95, unit: "pcs", stock: 40, barcode: "100024", image: "🌿", lowStockThreshold: 10 },
  { id: 25, name: "Tomato Paste Tropical 400g", category: "Cooking", price: 120, unit: "pcs", stock: 45, barcode: "100025", image: "🍅", lowStockThreshold: 10 },
  
  // Snacks
  { id: 26, name: "Tropical Heat Crisps 100g", category: "Snacks", price: 80, unit: "pcs", stock: 80, barcode: "100026", image: "🥔", lowStockThreshold: 20 },
  { id: 27, name: "Cadbury Dairy Milk 50g", category: "Snacks", price: 110, unit: "pcs", stock: 60, barcode: "100027", image: "🍫", lowStockThreshold: 15 },
  { id: 28, name: "Orbit Spearmint Gum", category: "Snacks", price: 30, unit: "pcs", stock: 100, barcode: "100028", image: "🍬", lowStockThreshold: 25 },
  { id: 29, name: "Indomie Chicken 70g", category: "Snacks", price: 35, unit: "pcs", stock: 150, barcode: "100029", image: "🍜", lowStockThreshold: 30 },
  { id: 30, name: "Britania Nice Biscuits 100g", category: "Snacks", price: 45, unit: "pcs", stock: 75, barcode: "100030", image: "🍪", lowStockThreshold: 20 },
  { id: 31, name: "Manji Glucose 100g", category: "Snacks", price: 40, unit: "pcs", stock: 85, barcode: "100031", image: "🍪", lowStockThreshold: 20 },
  
  // Personal Care
  { id: 32, name: "Dettol Soap 175g", category: "Personal Care", price: 120, unit: "pcs", stock: 45, barcode: "100032", image: "🧼", lowStockThreshold: 10 },
  { id: 33, name: "Colgate Toothpaste 100ml", category: "Personal Care", price: 185, unit: "pcs", stock: 35, barcode: "100033", image: "🪥", lowStockThreshold: 10 },
  { id: 34, name: "Sure Roll-On 50ml", category: "Personal Care", price: 250, unit: "pcs", stock: 28, barcode: "100034", image: "💨", lowStockThreshold: 8 },
  { id: 35, name: "Vaseline Petroleum Jelly 100ml", category: "Personal Care", price: 195, unit: "pcs", stock: 30, barcode: "100035", image: "🫙", lowStockThreshold: 8 },
  { id: 36, name: "Sunsilk Shampoo 200ml", category: "Personal Care", price: 280, unit: "bottles", stock: 25, barcode: "100036", image: "🧴", lowStockThreshold: 8 },
  
  // Cleaning
  { id: 37, name: "Omo Detergent 1kg", category: "Cleaning", price: 285, unit: "pcs", stock: 35, barcode: "100037", image: "🧺", lowStockThreshold: 10 },
  { id: 38, name: "Jik Bleach 750ml", category: "Cleaning", price: 145, unit: "bottles", stock: 40, barcode: "100038", image: "🧪", lowStockThreshold: 10 },
  { id: 39, name: "Harpic Toilet Cleaner 500ml", category: "Cleaning", price: 195, unit: "bottles", stock: 30, barcode: "100039", image: "🚽", lowStockThreshold: 8 },
  { id: 40, name: "Mortein Doom 300ml", category: "Cleaning", price: 320, unit: "pcs", stock: 25, barcode: "100040", image: "🦟", lowStockThreshold: 8 },
  
  // Vegetables
  { id: 41, name: "Fresh Tomatoes", category: "Vegetables", price: 120, unit: "kg", stock: 25, barcode: "100041", image: "🍅", lowStockThreshold: 5 },
  { id: 42, name: "Fresh Onions", category: "Vegetables", price: 80, unit: "kg", stock: 30, barcode: "100042", image: "🧅", lowStockThreshold: 5 },
  { id: 43, name: "Sukuma Wiki (Kale)", category: "Vegetables", price: 30, unit: "pcs", stock: 40, barcode: "100043", image: "🥬", lowStockThreshold: 10 },
  { id: 44, name: "Fresh Cabbage", category: "Vegetables", price: 60, unit: "pcs", stock: 20, barcode: "100044", image: "🥬", lowStockThreshold: 5 },
  { id: 45, name: "Carrots Fresh", category: "Vegetables", price: 100, unit: "kg", stock: 15, barcode: "100045", image: "🥕", lowStockThreshold: 5 },
  
  // Fruits
  { id: 46, name: "Bananas", category: "Fruits", price: 150, unit: "kg", stock: 25, barcode: "100046", image: "🍌", lowStockThreshold: 5 },
  { id: 47, name: "Oranges", category: "Fruits", price: 200, unit: "kg", stock: 20, barcode: "100047", image: "🍊", lowStockThreshold: 5 },
  { id: 48, name: "Mangoes", category: "Fruits", price: 180, unit: "kg", stock: 18, barcode: "100048", image: "🥭", lowStockThreshold: 5 },
  
  // Meat
  { id: 49, name: "Beef Steak", category: "Meat", price: 750, unit: "kg", stock: 15, barcode: "100049", image: "🥩", lowStockThreshold: 3 },
  { id: 50, name: "Tilapia Fish Fresh", category: "Meat", price: 500, unit: "kg", stock: 12, barcode: "100050", image: "🐟", lowStockThreshold: 3 },
];
