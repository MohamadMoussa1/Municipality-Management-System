<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles and permissions
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create test admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Create test citizen user
        $citizen = User::firstOrCreate(
            ['email' => 'citizen@example.com'],
            [
                'name' => 'Test Citizen',
                'password' => Hash::make('password'),
                'role' => 'citizen',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $citizen->assignRole('citizen');
    }
}
