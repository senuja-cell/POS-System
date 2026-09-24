<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['name' => 'Coca Cola 500ml',    'barcode' => '4890008100001', 'price' => 250.00, 'stock' => 50,  'category' => 'Beverages'],
            ['name' => 'Pepsi 500ml',        'barcode' => '4890008100002', 'price' => 230.00, 'stock' => 40,  'category' => 'Beverages'],
            ['name' => 'Sunlight Soap',      'barcode' => '4890008100003', 'price' => 120.00, 'stock' => 100, 'category' => 'Household'],
            ['name' => 'Milo 400g',          'barcode' => '4890008100004', 'price' => 850.00, 'stock' => 30,  'category' => 'Groceries'],
            ['name' => 'Anchor Milk 1L',     'barcode' => '4890008100005', 'price' => 450.00, 'stock' => 60,  'category' => 'Dairy'],
            ['name' => 'Bread Loaf',         'barcode' => '4890008100006', 'price' => 180.00, 'stock' => 25,  'category' => 'Bakery'],
            ['name' => 'Eggs 12 Pack',       'barcode' => '4890008100007', 'price' => 360.00, 'stock' => 45,  'category' => 'Dairy'],
            ['name' => 'Rice 5kg',           'barcode' => '4890008100008', 'price' => 1200.00,'stock' => 20,  'category' => 'Groceries'],
            ['name' => 'Colgate Toothpaste', 'barcode' => '4890008100009', 'price' => 290.00, 'stock' => 80,  'category' => 'Personal Care'],
            ['name' => 'Lay\'s Chips 100g',  'barcode' => '4890008100010', 'price' => 200.00, 'stock' => 70,  'category' => 'Snacks'],
        ];
        foreach ($products as $product) {
            \App\Models\Product::create($product);
        }

    }
}
