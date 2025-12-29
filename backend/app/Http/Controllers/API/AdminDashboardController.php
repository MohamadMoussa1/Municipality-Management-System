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
    public function monthlyPermitsAndRequestsCounts(Request $request): JsonResponse
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

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

        return response()->json([
            'months' => $months,
            'permits' => $permitsSeries,
            'requests' => $requestsSeries,
        ], 200);
    }

    public function totals(Request $request): JsonResponse
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        return response()->json([
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