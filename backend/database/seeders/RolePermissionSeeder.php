<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'admin',
            'patient',
            'pharmacist',
            'government_official',
            'insurance_provider',
        ];

        $permissions = [
            'manage users',
            'manage medications',
            'manage pharmacies',
            'view reports',
            'place orders',
            'upload prescriptions',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        foreach ($roles as $name) {
            $role = Role::firstOrCreate(['name' => $name]);
            if ($name === 'admin') {
                $role->givePermissionTo($permissions);
            }
            if ($name === 'pharmacist') {
                $role->givePermissionTo(['manage medications', 'manage pharmacies', 'view reports']);
            }
            if ($name === 'patient') {
                $role->givePermissionTo(['place orders', 'upload prescriptions']);
            }
        }
    }
}


