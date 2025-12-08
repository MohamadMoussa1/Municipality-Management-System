<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Notifications\PaymentCreated;


class BulkPaymentController extends Controller
{
     public function store(Request $request): JsonResponse
    {
         $validated = $request->validate([
            'citizen_ids'   => 'required|array|min:1',
            'citizen_ids.*' => 'required|exists:citizens,id',

            'amount'        => 'required|numeric|min:0.01',
            'payment_type'  => 'required|in:property_tax,water_bill,electricity_bill,waste_management,other',
          
           
        ]);
           $user = $request->user();
        $allowed = $user->role === 'admin'
            || ($user->role === 'finance_officer' && optional($user->employee)->department === 'finance');

        if (! $allowed) {
            return response()->json([
                'message' => 'Only admins or finance officers (finance department) can create payments.'
            ], 403);
        }

        $citizenIds  = $validated['citizen_ids'];
        $amount      = $validated['amount'];
        $paymentType = $validated['payment_type'];
        $date        = now();

        // 3. Transaction: all or none
         try {
        $created = DB::transaction(function () 
            use ($citizenIds, $amount, $paymentType, $date) 
            {
                $records = [];

                foreach ($citizenIds as $id) {
                    $records[] = Payment::create([
                        'citizen_id'   => $id,
                        'amount'       => $amount,
                        'payment_type' => $paymentType,
                        'date'         => $date,
                        'status'       => 'pending',
                    ]);
                }

                return $records;
            });
            foreach ($created as $payment) {
                $citizen = $payment->citizen;
                if ($citizen && $citizen->user) {
                    $payment->citizen->user->notify(new \App\Notifications\PaymentCreated($payment));
                }
            }

        return response()->json([
            'message' => 'Payments created successfully.',
            'count'   => count($created),
            'payments' => $created,
        ], 201);

    } catch (\Throwable $e) {
        Log::error('Bulk payment creation failed: ' . $e->getMessage());

        return response()->json([
            'message' => 'Failed to create payments.',
            'error' => config('app.debug') ? $e->getMessage() : 'Server error'
        ], 500);
    }
    }
}