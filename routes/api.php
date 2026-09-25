<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\GrnController;
use App\Http\Controllers\UserController;

// Auth Routes (public)
Route::post('login', [AuthController::class, 'login']);

// Auth Routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
});

// Custom Product Routes
Route::get('products/barcode/{barcode}', [ProductController::class, 'findByBarcode']);
Route::get('products/low-stock', [ProductController::class, 'lowStock']);

// Custom Sale Route
Route::get('sales/report', [SaleController::class, 'report']);

// Resource Routes
Route::apiResource('products', ProductController::class);
Route::apiResource('sales', SaleController::class);
Route::apiResource('grns', GrnController::class);
Route::apiResource('users', UserController::class);
