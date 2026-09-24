<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrnItem extends Model
{
    protected $fillable = [
        'grn_id',
        'product_id',
        'quantity',
        'cost_per_unit',
        'total_cost',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
