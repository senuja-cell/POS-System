<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with('items.product')->latest()->get();
        return response()->json($sales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,card',
            'amount_paid'    => 'required|numeric|min:0',
        ]);

        $total = 0;
        $saleItems = [];

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            $subtotal = $product->price * $item['quantity'];
            $total += $subtotal;

            $saleItems[] = [
                'product_id' => $product->id,
                'quantity'   => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal'   => $subtotal,
            ];

            // Reduce stock automatically!
            $product->stock -= $item['quantity'];
            $product->save();
        }

        $sale = Sale::create([
            'total_amount'   => $total,
            'payment_method' => $request->payment_method,
            'amount_paid'    => $request->amount_paid,
            'change_amount'  => $request->amount_paid - $total,
        ]);

        $sale->items()->createMany($saleItems);

        return response()->json($sale->load('items.product'), 201);
    }
    public function report()
    {
        $today = now()->toDateString();

        $sales = Sale::whereDate('created_at', $today)
                    ->with('items.product')
                    ->get();

        $totalRevenue  = $sales->sum('total_amount');
        $totalSales    = $sales->count();
        $totalItems    = $sales->flatMap->items->sum('quantity');

        return response()->json([
            'date'           => $today,
            'total_sales'    => $totalSales,
            'total_items'    => $totalItems,
            'total_revenue'  => $totalRevenue,
            'sales'          => $sales,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        return response()->json($sale->load('items.product'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

}
