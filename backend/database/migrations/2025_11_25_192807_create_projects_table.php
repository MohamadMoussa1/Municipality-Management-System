<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('department', ['finance','it','hr','planning','public_services']);
            $table->decimal('budget');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'])->default('planned');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};
