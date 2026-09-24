<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'total_amount',
        'payment_method',
        'amount_paid',
        'change_amount',
    ];
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }
}
