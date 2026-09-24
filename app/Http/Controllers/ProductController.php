<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }
    public function findByBarcode($barcode)
    {
        $product = Product::where('barcode', $barcode)->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }
    public function lowStock()
    {
        $products = Product::where('stock', '<=', 10)->get();

        return response()->json([
            'low_stock_count' => $products->count(),
            'products' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'barcode'  => 'required|string|unique:products',
            'price'    => 'required|numeric|min:0',
            'stock'    => 'required|integer|min:0',
            'category' => 'required|string',
        ]);

        $product = Product::create([
            'name'     => $request->name,
            'barcode'  => $request->barcode,
            'price'    => $request->price,
            'stock'    => $request->stock,
            'category' => $request->category,
        ]);
        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $product->update([
            'name'     => $request->name ?? $product->name,
            'barcode'  => $request->barcode ?? $product->barcode,
            'price'    => $request->price ?? $product->price,
            'stock'    => $request->stock ?? $product->stock,
            'category' => $request->category ?? $product->category,
        ]);
        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
