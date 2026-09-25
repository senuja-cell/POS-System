<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@pos.com',
            'password' => bcrypt('admin123'),
            'role'     => 'admin',
        ]);

        \App\Models\User::create([
            'name'     => 'Cashier One',
            'email'    => 'cashier@pos.com',
            'password' => bcrypt('cashier123'),
            'role'     => 'cashier',
        ]);
    }
}
