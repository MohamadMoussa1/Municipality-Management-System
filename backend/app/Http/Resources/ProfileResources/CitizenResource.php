<?php

namespace App\Http\Resources\ProfileResources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitizenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'role' => $this->user->role,
            'status' => $this->user->status ?? 'active',
            'national_id' => $this->national_id,
            'address' => $this->address,
            'contact' => $this->contact,
            'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Create a new resource instance with additional data.
     *
     * @param  mixed  $resource
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function withMessage($resource, $message = '')
    {
        return response()->json([
            'message' => $message,
            'data' => $resource,
        ]);
    }
}
