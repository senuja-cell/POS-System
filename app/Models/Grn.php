<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grn extends Model
{
    protected $fillable = [
        'grn_number',
        'supplier_name',
        'received_date',
        'total_cost',
        'notes',
    ];

    public function items()
    {
        return $this->hasMany(GrnItem::class);
    }
}
