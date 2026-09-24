<?php

namespace App\Http\Controllers;

use App\Models\Grn;
use App\Models\GrnItem;
use App\Models\Product;
use Illuminate\Http\Request;

class GrnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $grns = Grn::with('items.product')->latest()->get();
        return response()->json($grns);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_name'          => 'required|string',
            'received_date'          => 'required|date',
            'notes'                  => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.cost_per_unit'  => 'required|numeric|min:0',
        ]);
        $totalCost = 0;
        $grnItems = [];
        foreach ($request->items as $item) {
            $itemTotal = $item['quantity'] * $item['cost_per_unit'];
            $totalCost += $itemTotal;
            $grnItems[] = [
                'product_id'    => $item['product_id'],
                'quantity'      => $item['quantity'],
                'cost_per_unit' => $item['cost_per_unit'],
                'total_cost'    => $itemTotal,
            ];
            // Increase stock automatically!
            $product = Product::find($item['product_id']);
            $product->stock += $item['quantity'];
            $product->save();
        }
        $grn = Grn::create([
            'grn_number'    => 'GRN-' . date('Ymd') . '-' . rand(1000, 9999),
            'supplier_name' => $request->supplier_name,
            'received_date' => $request->received_date,
            'total_cost'    => $totalCost,
            'notes'         => $request->notes,
        ]);
        $grn->items()->createMany($grnItems);
        return response()->json($grn->load('items.product'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
