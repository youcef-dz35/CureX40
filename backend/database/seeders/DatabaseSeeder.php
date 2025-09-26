<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        config(['scout.driver' => 'database']);
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            PharmacySeeder::class,
            MedicationSeeder::class,
        ]);
    }
}
