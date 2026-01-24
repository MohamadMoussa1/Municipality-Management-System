<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CitizenRequest;
use App\Http\Resources\CitizenRequest\CitizenRequestResource;
use App\Models\Event;
use App\Models\Permit;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;


class CitizenDashboardController extends Controller
{
    // get count of completed and pending requests
    public function getCompletedandPendingRequests(Request $request): array{
        $user = $request->user();

        $baseQuery = CitizenRequest::query();

        if ($user->role === 'citizen') {
            $baseQuery->where('citizen_id', $user->citizen->id);
        } 

        $pendingCount = (clone $baseQuery)->where('status', 'pending')->count();
        $activeCount = (clone $baseQuery)->where('status', 'completed')->count();

        return [
            'active_requests' => $activeCount,
            'pending_requests' => $pendingCount,
        ];
    }

    /**
     * Get the 3 most recent requests
     * - Citizens see their own requests
     * - Admins/Clerks see all requests
     * 
     * @param Request $request
     * @return array
     */
    public function getLatestRequests(Request $request): array
    {
        $user = $request->user();
        $query = CitizenRequest::with('citizen.user') // Eager load citizen and user data
            ->latest('submission_date')
            ->limit(3);

        if ($user->role === 'citizen') {
            $query->where('citizen_id', $user->citizen->id);
        }

        $latestRequests = $query->get();

        return [
            'message' => 'Latest requests retrieved successfully.',
            'requests' => CitizenRequestResource::collection($latestRequests)
        ];
    }
    public function getUpcomingEventsCount(Request $request): array
    {
        $query = Event::where('date', '>=', now());
        $user = $request->user();
        // Citizens can see public and citizen events
        $query->whereIn('target_audience', ['public', 'citizens']);       
        $count = $query->count();
        return [
            'upcoming_events_count' => $count
        ];
    }
    public function getApprovedAndPendingCounts(Request $request): array
    {
        $user = $request->user();
        $baseQuery = \App\Models\Permit::query();

        // If user is a citizen, only show their permits
        if ($user->role === 'citizen') {
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

        return [
            'approved_permits' => $approvedCount,
            'pending_permits' => $pendingCount,
        ];
    }
     public function getPendingPaymentsSum(Request $request): array
    {
        $user = $request->user();
        $query = \App\Models\Payment::where('status', 'pending');

        // If user is a citizen, only show their pending payments
        if ($user->role === 'citizen') {
            if (!$user->citizen) {
                return response()->json([
                    'message' => 'Citizen profile not found.'
                ], 400);
            }
            $query->where('citizen_id', $user->citizen->id);
        } 
        // Only allow admin, clerk, and citizen roles
        elseif (!in_array($user->role, ['admin', 'finance_officer'])) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $totalPending = $query->sum('amount');
        $pendingCount = $query->count();

        return [
            'total_pending_amount' => (float) $totalPending,
            'currency' => 'USD',
            'pending_payments_count' => $pendingCount
        ];
    }
    public function dashboard(Request $request):JsonResponse{
        $user = $request->user();
        if($user->role !== 'citizen'){
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }
        $latestRequests=$this->getLatestRequests($request);
        $completedRequests=$this->getCompletedandPendingRequests($request);
        $upcomingEvents=$this->getUpcomingEventsCount($request);
        $approvedAndPendingCounts=$this->getApprovedAndPendingCounts($request);
        $pendingPaymentsSum=$this->getPendingPaymentsSum($request);
        return response()->json([
            'latest_requests' => $latestRequests,
            'completed_requests' => $completedRequests,
            'upcoming_events' => $upcomingEvents,
            'permit_counts' => $approvedAndPendingCounts,
            'pending_payments' => $pendingPaymentsSum,
        ]);
    }
}
