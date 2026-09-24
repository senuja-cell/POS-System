<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\GrnController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Custom Product Routes (MUST be before apiResource)
Route::get('products/barcode/{barcode}', [ProductController::class, 'findByBarcode']);
Route::get('products/low-stock', [ProductController::class, 'lowStock']);
Route::get('sales/report', [SaleController::class, 'report']);

// Resource Routes
Route::apiResource('products', ProductController::class);
Route::apiResource('sales', SaleController::class);
Route::apiResource('grns', GrnController::class);

