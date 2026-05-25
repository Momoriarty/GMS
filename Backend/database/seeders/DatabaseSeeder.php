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
        // User::factory(10)->create();

        // Removed hardcoded test user to avoid dummy data in production seeds.
        // Use factories or explicit dev-only seeders when needed.
        // Example: User::factory(10)->create();
    }
}
