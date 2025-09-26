<?php

namespace Database\Seeders;

use App\Models\Medication;
use Illuminate\Database\Seeder;

class MedicationSeeder extends Seeder
{
    public function run(): void
    {
        Medication::firstOrCreate([
            'name' => 'Paracetamol 500mg',
            'generic_name' => 'Acetaminophen',
            'brand' => 'CureXPharma',
            'category' => 'analgesics',
            'form' => 'tablet',
            'price' => 2.50,
            'currency' => 'USD',
            'stock' => 200,
            'min_stock' => 20,
            'requires_prescription' => false,
            'is_active' => true,
            'is_available' => true,
        ]);

        Medication::firstOrCreate([
            'name' => 'Amoxicillin 500mg',
            'generic_name' => 'Amoxicillin',
            'brand' => 'CureXPharma',
            'category' => 'antibiotics',
            'form' => 'capsule',
            'price' => 8.90,
            'currency' => 'USD',
            'stock' => 120,
            'min_stock' => 15,
            'requires_prescription' => true,
            'is_active' => true,
            'is_available' => true,
        ]);
    }
}


