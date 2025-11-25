<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['business', 'construction', 'vehicle', 'public_event']);
            $table->foreignId('applicant_id')->constrained('citizens');
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->date('issue_date');
            $table->date('expiry_date');
            $table->foreignId('document_id')->nullable()->constrained('documents');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('permits');
    }
};
