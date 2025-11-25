<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained('citizens');
            $table->enum('type', [
                'residency_certificate',
                'birth_certificate',
                'death_certificate',
                'marriage_certificate',
                'garbage_collection',
                'street_repair',
                'public_complaint'
            ]);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'rejected'])->default('pending');
            $table->dateTime('submission_date');
            $table->dateTime('completion_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('requests');
    }
};
