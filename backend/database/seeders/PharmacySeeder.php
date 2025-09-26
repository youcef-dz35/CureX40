<?php

namespace Database\Seeders;

use App\Models\Pharmacy;
use Illuminate\Database\Seeder;

class PharmacySeeder extends Seeder
{
    public function run(): void
    {
        Pharmacy::firstOrCreate([
            'name' => 'CureX Downtown Pharmacy',
            'address_city' => 'Algiers',
            'address_country' => 'DZ',
            'phone' => '+213700000001',
            'email' => 'downtown@curex40.test',
            'is_active' => true,
            'is_verified' => true,
        ]);

        Pharmacy::firstOrCreate([
            'name' => 'CureX Airport Pharmacy',
            'address_city' => 'Algiers',
            'address_country' => 'DZ',
            'phone' => '+213700000002',
            'email' => 'airport@curex40.test',
            'is_active' => true,
            'is_verified' => true,
        ]);
    }
}


