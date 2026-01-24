<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Models\CitizenRequest;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\Employee;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function monthlyPermitsAndRequestsCounts(Request $request): array
    {
        
        $monthsBack = (int) $request->query('months', 12);
        if ($monthsBack < 1) {
            $monthsBack = 1;
        }
        if ($monthsBack > 36) {
            $monthsBack = 36;
        }

        $start = now()->subMonths($monthsBack - 1)->startOfMonth();
        $end = now()->endOfMonth();

        $months = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $months[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }

        $permitCounts = Permit::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        $requestCounts = CitizenRequest::query()
            ->whereBetween('submission_date', [$start, $end])
            ->selectRaw("DATE_FORMAT(submission_date, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        $permitsSeries = [];
        $requestsSeries = [];

        foreach ($months as $month) {
            $permitsSeries[$month] = (int) ($permitCounts[$month] ?? 0);
            $requestsSeries[$month] = (int) ($requestCounts[$month] ?? 0);
        }

        return [
            'months' => $months,
            'permits' => $permitsSeries,
            'requests' => $requestsSeries,
        ];
    }
    public function getPaymentSummary(Request $request): array
    {
        $user = $request->user();
        $baseQuery = \App\Models\Payment::query();

        // If user is a citizen, only show their payments
       
        // Only allow admin, finance_officer, and citizen roles
        

        // Get all possible payment types
        $paymentTypes = ['property_tax', 'water_bill', 'electricity_bill', 'waste_management', 'other'];
        
        // Initialize default values for all payment types
        $totalsByType = collect($paymentTypes)->mapWithKeys(function($type) {
            return [$type => ['total_amount' => 0, 'count' => 0]];
        });

        // Get and merge actual data for completed payments
        $completedPayments = (clone $baseQuery)
            ->where('status', 'completed')
            ->selectRaw('payment_type, COALESCE(SUM(amount), 0) as total_amount, COUNT(*) as count')
            ->groupBy('payment_type')
            ->get()
            ->keyBy('payment_type')
            ->toArray();

        // Merge actual data with default values
        foreach ($completedPayments as $type => $data) {
            $totalsByType[$type] = [
                'total_amount' => (float) $data['total_amount'],
                'count' => (int) $data['count']
            ];
        }

        return [
            'total_amount' => (float) ($baseQuery->sum('amount') ?? 0),
            'total_completed' => (float) ((clone $baseQuery)->where('status', 'completed')->sum('amount') ?? 0),
            'total_pending' => (float) ((clone $baseQuery)->where('status', 'pending')->sum('amount') ?? 0),
            'total_failed' => (float) ((clone $baseQuery)->where('status', 'failed')->sum('amount') ?? 0),
            'by_type' => $totalsByType,
            'currency' => 'USD'
        ];
    }

    public function totals(Request $request): JsonResponse
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }
        $requestsCount=$this->monthlyPermitsAndRequestsCounts($request);
        $months=$requestsCount['months'];
        $permitsCount=$requestsCount['permits'];
        $requestsCount=$requestsCount['requests'];

        $paymentSummary=$this->getPaymentSummary($request);
        $totalAmount=$paymentSummary['total_amount'];
        $totalCompleted=$paymentSummary['total_completed'];
        $totalPending=$paymentSummary['total_pending'];
        $totalFailed=$paymentSummary['total_failed'];
        $byType=$paymentSummary['by_type'];
        return response()->json([
            'months'=>$months,
            'permits'=>$permitsCount,
            'requests'=>$requestsCount,
            'total_amount'=>$totalAmount,
            'total_completed'=>$totalCompleted,
            'total_pending'=>$totalPending,
            'total_failed'=>$totalFailed,
            'by_type'=>$byType,
            'currency' => 'USD',
            'total_citizens' => Citizen::count(),
            'total_employees'=> Employee::count(),
            'completed_requests' => CitizenRequest::where('status', 'completed')->count(),
            'completed_permits' => Permit::where('status', 'approved')->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
        ], 200);
    }

}
// fuction that count all citizens and count the completed requests and completed
// permits and the completed payments and the completed projects