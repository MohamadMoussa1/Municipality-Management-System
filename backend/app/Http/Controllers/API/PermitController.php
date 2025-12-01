<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Permit;
use App\Models\Citizen;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
class PermitController extends Controller
{
     use AuthorizesRequests;
    /**
     * Create a new permit (Citizen)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['business', 'construction', 'vehicle', 'public_event'])],
            'related_documents' => 'nullable|array',
            'related_documents.*' => 'exists:documents,id',
        ]);

        try {
            // Check if all documents belong to the authenticated user
            if (!empty($validated['related_documents'])) {
                $invalidDocuments = \App\Models\Document::whereIn('id', $validated['related_documents'])
                    ->where('uploaded_by', '!=', Auth::id())
                    ->pluck('id')
                    ->toArray();
                
                if (!empty($invalidDocuments)) {
                    return response()->json([
                        'message' => 'Some documents do not belong to you',
                        'invalid_documents' => $invalidDocuments
                    ], 422);
                }
            }

            $permit = Auth::user()->citizen->permits()->create([
                'type' => $validated['type'],
                'status' => 'pending',
                'related_documents' => $validated['related_documents'] ?? null,
                // issue_date and expiry_date will be set when the permit is approved
            ]);

            return response()->json([
                'message' => 'Permit application submitted successfully',
                'data' => $permit->load('applicant')
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating permit: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to submit permit application',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
                'file' => config('app.debug') ? $e->getFile() : null,
                'line' => config('app.debug') ? $e->getLine() : null,
            ], 500);
        }
    }
    

    /**
     * Get authenticated citizen's permits
     */
    public function myPermits()
    {
        try {
            $permits = Auth::user()->citizen->permits()
                ->select([
                'id',
                'type',
                'status',
                'issue_date',
                'expiry_date',
                'created_at'
                ])
                ->latest()
                ->get();

            return response()->json([
                'data' => $permits
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user permits: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch permits'], 500);
        }
    }

    /**
     * Get all permits (Admin/Clerk)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Permit::class);

        $query = Permit::with('applicant')
            ->when($request->filled('type'), function ($q) use ($request) {
                return $q->where('type', $request->type);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->when($request->filled('applicant_id'), function ($q) use ($request) {
                return $q->where('applicant_id', $request->applicant_id);
            })
            ->latest();

        $permits = $query->get();

        return response()->json([
            'data' => $permits
        ]);
    }

    /**
     * Update permit status (Clerk/Admin)
     */
    public function updateStatus(Request $request, Permit $permit)
    {
        $this->authorize('update', $permit);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['approved', 'rejected', 'expired'])],
            'expiry_date' => [
                'required_if:status,approved', 
                'date',
                'after:today',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->status === 'approved' && empty($value)) {
                        $fail('Expiry date is required when approving a permit.');
                    }
                },
            ],
        ]);

        try {
            $updates = ['status' => $validated['status']];
            
            if ($validated['status'] === 'approved') {
                $updates['issue_date'] = now();
                $updates['expiry_date'] = $validated['expiry_date'];
            }

            $permit->update($updates);

            return response()->json([
                'message' => 'Permit status updated successfully',
                'data' => $permit->refresh()->load('applicant')
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating permit status: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update permit status'], 500);
        }
    }

    /**
     * Get a specific permit
     */
    public function show(Permit $permit)
    {
        $this->authorize('view', $permit);
        
        // Check and update status if expired
        $this->checkAndUpdateExpiredStatus($permit);
        
        return response()->json([
            'data' => $permit->load('applicant')
        ]);
    }

    /**
     * Check and update expired permits
     */
    protected function checkAndUpdateExpiredStatus(Permit $permit): void
    {
        if ($permit->status === 'approved' && $permit->expiry_date->isPast()) {
            $permit->update(['status' => 'expired']);
        }
    }

    /**
 * Delete a permit (Admin only)
 */
public function destroy(Permit $permit)
{
    $this->authorize('delete', $permit);
    
    try {
        $permit->delete();
        
        return response()->json([
            'message' => 'Permit deleted successfully'
        ]);
    } catch (\Exception $e) {
        Log::error('Error deleting permit: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to delete permit. Please try again.'
        ], 500);
    }
}
}
