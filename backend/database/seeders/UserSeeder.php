<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@curex40.test'],
            [
                'name' => 'System Admin',
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if (method_exists($admin, 'assignRole')) {
            $admin->assignRole('admin');
        }

        $patient = User::firstOrCreate(
            ['email' => 'patient@curex40.test'],
            [
                'name' => 'John Doe',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if (method_exists($patient, 'assignRole')) {
            $patient->assignRole('patient');
        }
    }
}


