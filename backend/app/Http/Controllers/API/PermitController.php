<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Permit;
use App\Models\Citizen;
use App\Models\Document;
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
     * Get counts of approved and pending permits
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getApprovedAndPendingCounts(Request $request)
    {
        $user = $request->user();
        $baseQuery = \App\Models\Permit::query();

        // If user is a citizen, only show their permits
        if ($user->role === 'citizen') {
            if (!$user->citizen) {
                return response()->json([
                    'message' => 'Citizen profile not found for this user.'
                ], 400);
            }
            $baseQuery->where('applicant_id', $user->citizen->id);
        } 
        // Only allow admin, clerk, and citizen roles
        elseif (!in_array($user->role, ['admin', 'clerk'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $pendingCount = (clone $baseQuery)->where('status', 'pending')->count();
        $approvedCount = (clone $baseQuery)->where('status', 'approved')->count();

        return response()->json([
            'approved_permits' => $approvedCount,
            'pending_permits' => $pendingCount,
        ], 200);
    }


    /**
     * Create a new permit (Citizen)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['business', 'construction', 'vehicle', 'public_event'])],
            'documents' => 'nullable|array',
            'documents.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'existing_documents' => 'nullable|array',
            'existing_documents.*' => 'exists:documents,id,uploaded_by,' . Auth::id(),
        ]);

        \DB::beginTransaction();
        $uploadedFiles = []; // Track uploaded temp files for cleanup

        try {
            $documentIds = $validated['existing_documents'] ?? [];
            $tempFiles = []; // Store temp file info for moving later

            // Handle new file uploads
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    try {
                        // Store in temp directory first
                        $tempPath = $file->store('temp/' . Auth::id(), 'local');
                        $uploadedFiles[] = $tempPath;
                        
                        // Store temp file info
                        $tempFiles[] = [
                            'temp_path' => $tempPath,
                            'original_name' => $file->getClientOriginalName(),
                            'extension' => $file->getClientOriginalExtension(),
                        ];
                    } catch (\Exception $e) {
                        // Cleanup any uploaded temp files if one fails
                        foreach ($uploadedFiles as $filePath) {
                            \Storage::disk('local')->delete($filePath);
                        }
                        throw $e;
                    }
                }
            }
            // Get the authenticated citizen
            $citizen = Auth::user()->citizen;
            // Create the permit first
            $permit = $citizen->permits()->create([
                'type' => $validated['type'],
                'status' => 'pending',
                'related_documents' => $documentIds,
            ]);
            // Now process the temp files and move them to permanent storage
            foreach ($tempFiles as $tempFile) {
                // Generate permanent path
                $permanentPath = 'documents/' . date('Y/m') . '/' . \Str::random(40) . '.' . $tempFile['extension'];
                
                // Move from temp to permanent storage
                \Storage::disk('public')->writeStream(
                    $permanentPath,
                    \Storage::disk('local')->readStream($tempFile['temp_path'])
                );
                
                // Delete the temp file
                \Storage::disk('local')->delete($tempFile['temp_path']);
                
                // Create document record
                $document = Document::create([
                    'title' => $tempFile['original_name'],
                    'link' => $permanentPath,
                    'uploaded_by' => Auth::id(),
                    'related_entity' => 'permit',
                ]);
                
                $documentIds[] = $document->id;
            }

            // Update the permit with all document IDs
            $permit->update(['related_documents' => $documentIds]);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permit application submitted successfully',
                'data' => [
                    'permit' => $permit->load('applicant'),
                    'documents' => Document::whereIn('id', $documentIds)->get()
                ]
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            // Cleanup any uploaded temp files on error
            foreach ($uploadedFiles as $filePath) {
                \Storage::disk('local')->delete($filePath);
            }
            \Log::error('Error creating permit: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit permit application',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
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
            
            // Send notification to applicant
            $permit->applicant->user->notify(new \App\Notifications\PermitStatusUpdated($permit));
            
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
        
        
         // Eager load the applicant with user data
        $permit->load(['applicant.user']);
        // Manually load documents
        $documents = Document::whereIn('id', $permit->related_documents ?? [])
            ->where('related_entity', 'permit')
            ->get(['id', 'title', 'link']);
    

        return response()->json([
            'success' => true,
            'message' => 'Permit retrieved successfully',
            'data' => [
                'permit' => [
                    'id' => $permit->id,
                    'type' => $permit->type,
                    'status' => $permit->status,
                    'issue_date' => $permit->issue_date?->toDateString(),
                    'expiry_date' => $permit->expiry_date?->toDateString(),
                    'created_at' => $permit->created_at,
                    'updated_at' => $permit->updated_at,
                ],
                'applicant' => [
                    'id' => $permit->applicant->id,
                    'name' => $permit->applicant->user->name,
                    'contact' => $permit->applicant->contact,
                ],
                'documents' => $documents->map(function($document) {
                    return [
                        'id' => $document->id,
                        'title' => $document->title,
                        'url' => \Storage::disk('public')->url($document->link),
                        'type' => \Str::afterLast($document->link, '.')
                    ];
                })
            ]
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
