<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'title' => $this->title,
            'assignee_id' => $this->assignee_id,
            'status' => $this->status,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'project' => $this->whenLoaded('project', function () {
                return [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                    'status' => $this->project->status,
                ];
            }),
            'assignee' => $this->whenLoaded('assignee', function () {
                return [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->user->name ?? null,
                    'position' => $this->assignee->position,
                    'department' => $this->assignee->department,
                ];
            }),
        ];
    }
}
