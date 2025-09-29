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

        // Pharmacist user
        $pharmacist = User::firstOrCreate(
            ['email' => 'pharmacist@curex40.test'],
            [
                'name' => 'Dr. Sarah Johnson',
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if (method_exists($pharmacist, 'assignRole')) {
            $pharmacist->assignRole('pharmacist');
        }

        // Government Official user
        $government = User::firstOrCreate(
            ['email' => 'government@curex40.test'],
            [
                'name' => 'Michael Chen',
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if (method_exists($government, 'assignRole')) {
            $government->assignRole('government_official');
        }

        // Insurance Provider user
        $insurance = User::firstOrCreate(
            ['email' => 'insurance@curex40.test'],
            [
                'name' => 'Lisa Rodriguez',
                'first_name' => 'Lisa',
                'last_name' => 'Rodriguez',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if (method_exists($insurance, 'assignRole')) {
            $insurance->assignRole('insurance_provider');
        }
    }
}


