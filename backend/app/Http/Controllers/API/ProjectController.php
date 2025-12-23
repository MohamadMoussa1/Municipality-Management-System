<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Task;
use Illuminate\Validation\Rule;
use App\Http\Requests\Project\AssignTaskRequest;
class ProjectController extends Controller
{
    /**
     * Display a listing of the projects with optional filters.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Check if user has permission to view all projects
        if (!auth()->user()->hasAnyRole(['admin', 'urban_planner'])) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators and urban planners can view all projects.'
            ], 403);
        }

        $query = Project::query();

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        //Filter by budget
        // Filter by budget range
        if ($request->has('min_budget')) {
            $query->where('budget', '>=', $request->min_budget);
        }
        if ($request->has('max_budget')) {
            $query->where('budget', '<=', $request->max_budget);
        }

        // Filter by start date range
        if ($request->has('start_date_from')) {
            $query->whereDate('start_date', '>=', $request->start_date_from);
        }
        if ($request->has('start_date_to')) {
            $query->whereDate('start_date', '<=', $request->start_date_to);
        }

        // Filter by end date range
        if ($request->has('end_date_from')) {
            $query->whereDate('end_date', '>=', $request->end_date_from);
        }
        if ($request->has('end_date_to')) {
            $query->whereDate('end_date', '<=', $request->end_date_to);
        }
        //check if the end date is passed change the status to cancelled
        foreach($query->get() as $project){
            if($project->end_date < now() && $project->status != 'completed'){
                $project->update(['status' => 'cancelled']);
            }
        }
        // Apply sorting (default: newest first)
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $projects = $query->paginate($perPage);

        return response()->json([
            'data' => $projects->items(),
            'pagination' => [
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ]
        ]);
    }
    /**
 * Display the specified project.
 *
 * @param  Project  $project
 * @return JsonResponse
 */
    public function show(Project $project): JsonResponse
    {
        // Check if user has permission to view the project
        if (!auth()->user()->hasAnyRole(['admin', 'urban_planner'])) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators and urban planners can view project details.'
            ], 403);
        }

        return response()->json([
            'data' => $project->load('tasks')->load('tasks.assignee.user') // Eager load tasks relationship
        ]);
    }
    /**
     * Store a newly created project in storage.
     *
     * @param  StoreProjectRequest  $request
     * @return JsonResponse
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $project = Project::create($validated);

        return response()->json([
            'message' => 'Project created successfully',
            'data' => $project
        ], 201);
    }
    /**
 * Assign a task to an employee for a specific project.
 *
 * @param  Project  $project
 * @param  AssignTaskRequest  $request
 * @return JsonResponse
 */
    public function assignTask(Project $project, AssignTaskRequest $request): JsonResponse
    {
        // Check if the assigned employee is in the same department as the project
        $employee = Employee::findOrFail($request->assignee_id);
        
        if ($employee->department !== $project->department) {
            return response()->json([
                'message' => 'Cannot assign task. The selected employee must be in the same department as the project.'
            ], 422);
        }

        // Create the task
        $task = new Task($request->validated());
        $task->project_id = $project->id;
        $task->status = $request->status ?? 'todo';
        $task->save();

        return response()->json([
            'message' => 'Task assigned successfully',
            'data' => $task->load(['assignee.user' => function($query) {
                $query->select('id', 'name');
            }])
        ], 201);
    }


    /**
 * Update the status of a project
 *
 * @param  \App\Models\Project  $project
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
    public function updateStatus(Project $project, Request $request)
    {
        // Check if user has permission to update project status
        if (!auth()->user()->hasAnyRole(['admin', 'urban_planner'])) {
            return response()->json([
                'message' => 'Unauthorized. Only administrators and urban planners can update project status.'
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                'in_progress', 
                'completed', 
                'on_hold', 
                'cancelled'
            ])]
        ]);

        $project->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Project status updated successfully',
            'data' => $project
        ]);
    }
}
